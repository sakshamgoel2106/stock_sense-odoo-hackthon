# StockSense API Contracts

This document defines the API endpoints, request/response structures, and shared models for the StockSense backend.

## Base URL
`/api/v1`

## Authentication
Most routes require a Bearer token in the `Authorization` header.

## Models

### Product
- `_id`: ObjectId
- `name`: String (required)
- `sku`: String (required, unique)
- `description`: String
- `category`: String
- `price`: Number

### Warehouse
- `_id`: ObjectId
- `name`: String (required)
- `location`: String
- `isActive`: Boolean

### Stock
- `_id`: ObjectId
- `product`: ObjectId (ref Product)
- `warehouse`: ObjectId (ref Warehouse)
- `quantity`: Number (cannot be negative)

### Operation
- `_id`: ObjectId
- `type`: String (Enum: 'RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT')
- `status`: String (Enum: 'DRAFT', 'VALIDATED', 'CANCELLED')
- `sourceWarehouse`: ObjectId (ref Warehouse, required for DELIVERY, TRANSFER)
- `destinationWarehouse`: ObjectId (ref Warehouse, required for RECEIPT, TRANSFER)
- `items`: Array of Objects
  - `product`: ObjectId (ref Product)
  - `quantity`: Number (or countedQuantity for ADJUSTMENT)
- `createdBy`: ObjectId (ref User)
- `validatedAt`: Date

### StockLedger
- `_id`: ObjectId
- `operation`: ObjectId (ref Operation)
- `product`: ObjectId (ref Product)
- `warehouse`: ObjectId (ref Warehouse)
- `quantityChange`: Number (positive or negative)
- `previousQuantity`: Number
- `newQuantity`: Number
- `timestamp`: Date
- `user`: ObjectId (ref User)

## Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Products
- `GET /products`
- `POST /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`

### Warehouses
- `GET /warehouses`
- `POST /warehouses`
- `GET /warehouses/:id`
- `PUT /warehouses/:id`
- `DELETE /warehouses/:id`

### Inventory / Operations
- `GET /inventory/operations`
- `POST /inventory/operations` (Create DRAFT operation)
- `GET /inventory/operations/:id`
- `POST /inventory/operations/:id/validate` (Validate operation & move stock)

### Stock
- `GET /inventory/stock` (Get current stock levels, filterable by warehouse/product)
- `GET /inventory/ledger` (Get stock movement history)
