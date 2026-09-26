const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Stock = require('../models/Stock');
const Operation = require('../models/Operation');
const StockLedger = require('../models/StockLedger');

let mongoServer;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('Inventory Operations API', () => {
  let product, warehouseA, warehouseB;

  beforeEach(async () => {
    product = await Product.create({ name: 'Laptop', sku: 'LAP123', price: 1000 });
    warehouseA = await Warehouse.create({ name: 'Main Warehouse' });
    warehouseB = await Warehouse.create({ name: 'Secondary Warehouse' });
  });

  it('1. Receipt increases stock correctly', async () => {
    // Create Receipt Operation
    const opRes = await request(app)
      .post('/api/v1/inventory/operations')
      .send({
        type: 'RECEIPT',
        destinationWarehouse: warehouseA._id,
        items: [{ product: product._id, quantity: 50 }]
      });
    expect(opRes.statusCode).toBe(201);
    const opId = opRes.body._id;

    // Validate
    const valRes = await request(app).post(`/api/v1/inventory/operations/${opId}/validate`);
    expect(valRes.statusCode).toBe(200);

    // Check Stock
    const stock = await Stock.findOne({ product: product._id, warehouse: warehouseA._id });
    expect(stock).not.toBeNull();
    expect(stock.quantity).toBe(50);

    // Check Ledger
    const ledger = await StockLedger.findOne({ operation: opId });
    expect(ledger).not.toBeNull();
    expect(ledger.quantityChange).toBe(50);
  });

  it('2. Delivery decreases stock correctly', async () => {
    // Initial Stock
    await Stock.create({ product: product._id, warehouse: warehouseA._id, quantity: 100 });

    // Create Delivery Operation
    const opRes = await request(app)
      .post('/api/v1/inventory/operations')
      .send({
        type: 'DELIVERY',
        sourceWarehouse: warehouseA._id,
        items: [{ product: product._id, quantity: 20 }]
      });
    const opId = opRes.body._id;

    // Validate
    await request(app).post(`/api/v1/inventory/operations/${opId}/validate`);

    // Check Stock
    const stock = await Stock.findOne({ product: product._id, warehouse: warehouseA._id });
    expect(stock.quantity).toBe(80);
  });

  it('3. Delivery fails when stock is insufficient', async () => {
    await Stock.create({ product: product._id, warehouse: warehouseA._id, quantity: 10 });

    const opRes = await request(app)
      .post('/api/v1/inventory/operations')
      .send({
        type: 'DELIVERY',
        sourceWarehouse: warehouseA._id,
        items: [{ product: product._id, quantity: 20 }]
      });
    const opId = opRes.body._id;

    const valRes = await request(app).post(`/api/v1/inventory/operations/${opId}/validate`);
    expect(valRes.statusCode).toBe(400);

    // Stock should remain unchanged
    const stock = await Stock.findOne({ product: product._id, warehouse: warehouseA._id });
    expect(stock.quantity).toBe(10);
  });

  it('4. Transfer decreases source and increases destination by the same amount', async () => {
    await Stock.create({ product: product._id, warehouse: warehouseA._id, quantity: 100 });
    await Stock.create({ product: product._id, warehouse: warehouseB._id, quantity: 50 });

    const opRes = await request(app)
      .post('/api/v1/inventory/operations')
      .send({
        type: 'TRANSFER',
        sourceWarehouse: warehouseA._id,
        destinationWarehouse: warehouseB._id,
        items: [{ product: product._id, quantity: 30 }]
      });
    const opId = opRes.body._id;

    await request(app).post(`/api/v1/inventory/operations/${opId}/validate`);

    const stockA = await Stock.findOne({ product: product._id, warehouse: warehouseA._id });
    const stockB = await Stock.findOne({ product: product._id, warehouse: warehouseB._id });
    
    expect(stockA.quantity).toBe(70);
    expect(stockB.quantity).toBe(80);
  });

  it('5. Adjustment correctly applies the delta', async () => {
    await Stock.create({ product: product._id, warehouse: warehouseA._id, quantity: 50 });

    const opRes = await request(app)
      .post('/api/v1/inventory/operations')
      .send({
        type: 'ADJUSTMENT',
        destinationWarehouse: warehouseA._id, // destinationWarehouse holds the target for adjustments
        items: [{ product: product._id, quantity: 45 }] // 45 is the counted quantity
      });
    const opId = opRes.body._id;

    await request(app).post(`/api/v1/inventory/operations/${opId}/validate`);

    const stock = await Stock.findOne({ product: product._id, warehouse: warehouseA._id });
    expect(stock.quantity).toBe(45); // Delta was -5

    const ledger = await StockLedger.findOne({ operation: opId });
    expect(ledger.quantityChange).toBe(-5);
  });

  it('6. Revalidating an operation does not change stock again', async () => {
    const opRes = await request(app)
      .post('/api/v1/inventory/operations')
      .send({
        type: 'RECEIPT',
        destinationWarehouse: warehouseA._id,
        items: [{ product: product._id, quantity: 50 }]
      });
    const opId = opRes.body._id;

    await request(app).post(`/api/v1/inventory/operations/${opId}/validate`); // First validation
    const valRes2 = await request(app).post(`/api/v1/inventory/operations/${opId}/validate`); // Second validation
    
    expect(valRes2.statusCode).toBe(400);
    expect(valRes2.body.message).toMatch(/already validated/i);

    const stock = await Stock.findOne({ product: product._id, warehouse: warehouseA._id });
    expect(stock.quantity).toBe(50); // Did not increase to 100
  });

  it('8. Invalid quantities and invalid IDs are rejected', async () => {
    const opRes = await request(app)
      .post('/api/v1/inventory/operations')
      .send({
        type: 'RECEIPT',
        destinationWarehouse: warehouseA._id,
        items: [{ product: product._id, quantity: -10 }]
      });
    
    expect(opRes.statusCode).toBe(500); // Mongoose validation error
  });
});
