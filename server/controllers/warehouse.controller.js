const asyncHandler = require('express-async-handler');
const Warehouse = require('../models/Warehouse');
const Stock = require('../models/Stock');

// @desc    Get all warehouses
// @route   GET /api/v1/warehouses
// @access  Private
const getWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
  res.json(warehouses);
});

// @desc    Create a warehouse
// @route   POST /api/v1/warehouses
// @access  Private
const createWarehouse = asyncHandler(async (req, res) => {
  const { name, code, location, isActive } = req.body;

  const warehouseExists = await Warehouse.findOne({ code });
  if (warehouseExists) {
    res.status(400);
    throw new Error('Warehouse with this code already exists');
  }

  const warehouse = await Warehouse.create({
    name, code, location, isActive
  });

  res.status(201).json(warehouse);
});

// @desc    Get warehouse by ID
// @route   GET /api/v1/warehouses/:id
// @access  Private
const getWarehouseById = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (warehouse) {
    res.json(warehouse);
  } else {
    res.status(404);
    throw new Error('Warehouse not found');
  }
});

// @desc    Update a warehouse
// @route   PUT /api/v1/warehouses/:id
// @access  Private
const updateWarehouse = asyncHandler(async (req, res) => {
  const { name, code, location, isActive } = req.body;

  const warehouse = await Warehouse.findById(req.params.id);

  if (warehouse) {
    if (code && code !== warehouse.code) {
      const warehouseExists = await Warehouse.findOne({ code });
      if (warehouseExists) {
        res.status(400);
        throw new Error('Warehouse with this code already exists');
      }
    }

    warehouse.name = name || warehouse.name;
    warehouse.code = code || warehouse.code;
    warehouse.location = location !== undefined ? location : warehouse.location;
    warehouse.isActive = isActive !== undefined ? isActive : warehouse.isActive;

    const updatedWarehouse = await warehouse.save();
    res.json(updatedWarehouse);
  } else {
    res.status(404);
    throw new Error('Warehouse not found');
  }
});

// @desc    Delete a warehouse
// @route   DELETE /api/v1/warehouses/:id
// @access  Private
const deleteWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);

  if (!warehouse) {
    res.status(404);
    throw new Error('Warehouse not found');
  }

  const stockExists = await Stock.findOne({ warehouse: warehouse._id, quantity: { $gt: 0 } });
  if (stockExists) {
    res.status(400);
    throw new Error('Cannot delete warehouse with existing stock.');
  }

  await warehouse.deleteOne();
  res.json({ message: 'Warehouse removed' });
});

module.exports = {
  getWarehouses,
  createWarehouse,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
};
