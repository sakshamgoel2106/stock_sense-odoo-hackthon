const asyncHandler = require('express-async-handler');
const Operation = require('../models/Operation');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const { validateOperation } = require('../services/inventory.service');

// @desc    Create new inventory operation
// @route   POST /api/v1/inventory/operations
// @access  Private
const createOperation = asyncHandler(async (req, res) => {
  const { type, sourceWarehouse, destinationWarehouse, items } = req.body;
  
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Please provide items for the operation');
  }

  const operation = new Operation({
    type,
    sourceWarehouse,
    destinationWarehouse,
    items,
    createdBy: req.user ? req.user._id : null
  });

  const createdOperation = await operation.save();
  res.status(201).json(createdOperation);
});

// @desc    Get all operations
// @route   GET /api/v1/inventory/operations
// @access  Private
const getOperations = asyncHandler(async (req, res) => {
  const operations = await Operation.find({})
    .populate('sourceWarehouse', 'name')
    .populate('destinationWarehouse', 'name')
    .populate('items.product', 'name sku');
  res.json(operations);
});

// @desc    Get operation by ID
// @route   GET /api/v1/inventory/operations/:id
// @access  Private
const getOperationById = asyncHandler(async (req, res) => {
  const operation = await Operation.findById(req.params.id)
    .populate('sourceWarehouse', 'name')
    .populate('destinationWarehouse', 'name')
    .populate('items.product', 'name sku');

  if (operation) {
    res.json(operation);
  } else {
    res.status(404);
    throw new Error('Operation not found');
  }
});

// @desc    Validate an operation (process stock movement)
// @route   POST /api/v1/inventory/operations/:id/validate
// @access  Private
const validateOperationController = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  try {
    const operation = await validateOperation(req.params.id, userId);
    res.json({ message: 'Operation validated successfully', operation });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get stock levels
// @route   GET /api/v1/inventory/stock
// @access  Private
const getStock = asyncHandler(async (req, res) => {
  const { warehouse, product } = req.query;
  const filter = {};
  if (warehouse) filter.warehouse = warehouse;
  if (product) filter.product = product;

  const stock = await Stock.find(filter)
    .populate('product', 'name sku price')
    .populate('warehouse', 'name location');
  res.json(stock);
});

// @desc    Get stock ledger
// @route   GET /api/v1/inventory/ledger
// @access  Private
const getLedger = asyncHandler(async (req, res) => {
  const { warehouse, product, operation } = req.query;
  const filter = {};
  if (warehouse) filter.warehouse = warehouse;
  if (product) filter.product = product;
  if (operation) filter.operation = operation;

  const ledger = await StockLedger.find(filter)
    .populate('product', 'name sku')
    .populate('warehouse', 'name')
    .populate('operation', 'type')
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json(ledger);
});

module.exports = {
  createOperation,
  getOperations,
  getOperationById,
  validateOperationController,
  getStock,
  getLedger
};
