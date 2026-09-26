const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const Operation = require('../models/Operation');

/**
 * Ensures atomicity when processing stock changes.
 * Wraps logic in a MongoDB transaction if a replica set is available.
 */
const runWithTransaction = async (logic) => {
  let session = null;
  // MongoDB transactions require replica sets. Check if we have one.
  const hasReplicaSet = mongoose.connection.client.topology.s.hasPrimary; // Approximation
  
  if (hasReplicaSet) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (err) {
      console.warn("Could not start transaction, running without it. (Ensure MongoDB is running as a replica set)");
      session = null;
    }
  }

  try {
    const result = await logic(session);
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }
    return result;
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

const _updateStock = async (product, warehouse, quantityChange, session) => {
  let stock = await Stock.findOne({ product, warehouse }).session(session);
  let previousQuantity = 0;
  
  if (!stock) {
    if (quantityChange < 0) {
      throw new Error(`Insufficient stock for product ${product} in warehouse ${warehouse}`);
    }
    stock = new Stock({ product, warehouse, quantity: quantityChange });
    await stock.save({ session });
    return { previousQuantity: 0, newQuantity: quantityChange };
  }
  
  previousQuantity = stock.quantity;
  const newQuantity = previousQuantity + quantityChange;
  
  if (newQuantity < 0) {
    throw new Error(`Insufficient stock for product ${product} in warehouse ${warehouse}`);
  }
  
  stock.quantity = newQuantity;
  await stock.save({ session });
  
  return { previousQuantity, newQuantity };
};

const _createLedgerEntry = async (data, session) => {
  const ledger = new StockLedger(data);
  await ledger.save({ session });
};

const validateOperation = async (operationId, userId) => {
  return await runWithTransaction(async (session) => {
    const operation = await Operation.findById(operationId).session(session);
    
    if (!operation) {
      throw new Error("Operation not found");
    }
    if (operation.status === 'VALIDATED') {
      throw new Error("Operation is already validated");
    }
    if (operation.status === 'CANCELLED') {
      throw new Error("Cannot validate a cancelled operation");
    }

    const { type, items, sourceWarehouse, destinationWarehouse } = operation;

    for (const item of items) {
      if (type === 'RECEIPT') {
        const { previousQuantity, newQuantity } = await _updateStock(item.product, destinationWarehouse, item.quantity, session);
        await _createLedgerEntry({
          operation: operation._id,
          operationType: type,
          product: item.product,
          warehouse: destinationWarehouse,
          quantityChange: item.quantity,
          previousQuantity,
          newQuantity,
          user: userId
        }, session);
      } 
      else if (type === 'DELIVERY') {
        const { previousQuantity, newQuantity } = await _updateStock(item.product, sourceWarehouse, -item.quantity, session);
        await _createLedgerEntry({
          operation: operation._id,
          operationType: type,
          product: item.product,
          warehouse: sourceWarehouse,
          quantityChange: -item.quantity,
          previousQuantity,
          newQuantity,
          user: userId
        }, session);
      } 
      else if (type === 'TRANSFER') {
        // Decrease from source
        const sourceUpdate = await _updateStock(item.product, sourceWarehouse, -item.quantity, session);
        await _createLedgerEntry({
          operation: operation._id,
          operationType: type,
          product: item.product,
          warehouse: sourceWarehouse,
          quantityChange: -item.quantity,
          previousQuantity: sourceUpdate.previousQuantity,
          newQuantity: sourceUpdate.newQuantity,
          user: userId
        }, session);
        
        // Increase in destination
        const destUpdate = await _updateStock(item.product, destinationWarehouse, item.quantity, session);
        await _createLedgerEntry({
          operation: operation._id,
          operationType: type,
          product: item.product,
          warehouse: destinationWarehouse,
          quantityChange: item.quantity,
          previousQuantity: destUpdate.previousQuantity,
          newQuantity: destUpdate.newQuantity,
          user: userId
        }, session);
      }
      else if (type === 'ADJUSTMENT') {
        // Here, item.quantity is the counted quantity
        let stock = await Stock.findOne({ product: item.product, warehouse: destinationWarehouse }).session(session);
        const currentQty = stock ? stock.quantity : 0;
        const delta = item.quantity - currentQty;
        
        const { previousQuantity, newQuantity } = await _updateStock(item.product, destinationWarehouse, delta, session);
        
        if (delta !== 0) {
          await _createLedgerEntry({
            operation: operation._id,
            operationType: type,
            product: item.product,
            warehouse: destinationWarehouse,
            quantityChange: delta,
            previousQuantity,
            newQuantity,
            user: userId
          }, session);
        }
      }
    }

    operation.status = 'VALIDATED';
    operation.validatedAt = new Date();
    await operation.save({ session });
    
    return operation;
  });
};

module.exports = {
  validateOperation
};
