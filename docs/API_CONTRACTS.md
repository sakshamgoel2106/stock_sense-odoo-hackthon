# StockSense Advanced API Contracts

## 1. Stock Aging & Valuation
**`GET /api/v1/inventory/aging`**
- Query Params: `?warehouse=<id>&product=<id>`
- Returns: Array of aggregated stock quantities by age category (0-30 days, 31-60 days, etc.) based on FIFO receipt batches.

**`GET /api/v1/inventory/valuation`**
- Query Params: `?warehouse=<id>&product=<id>`
- Returns: Array of total stock values by warehouse/product, calculated as `remainingQuantity * unitCost` per FIFO layer.

## 2. Stock Forecasting
**`GET /api/v1/inventory/forecast`**
- Query Params: `?warehouse=<id>&product=<id>&window=30`
- Returns: Array of products with their average daily usage over the window, estimated days of stock remaining, and status ("Healthy", "Warning", "Critical").

## 3. Stock Reservations
**`POST /api/v1/reservations`**
- Body: `{ "product": "id", "warehouse": "id", "quantity": 10, "orderReference": "ORD-123" }`
- Returns: Created Reservation.

**`GET /api/v1/reservations`**
- Returns: All active and past reservations.

**`PUT /api/v1/reservations/:id/cancel`**
- Action: Releases the reserved stock back to available pool.

**`PUT /api/v1/reservations/:id/fulfill`**
- Action: Converts the reservation into a finalized `DELIVERY` operation, deducting physical stock exactly once and resolving FIFO layers.

## 4. Transfer Approvals
**`PUT /api/v1/inventory/operations/:id/approve`**
- Action: Approves a pending internal transfer. Only an approved operation can be `/validate`d.

**`PUT /api/v1/inventory/operations/:id/reject`**
- Body: `{ "reason": "Insufficient stock in source" }`
- Action: Rejects the transfer and marks it cancelled.

## 5. Smart Stock Audit
**`POST /api/v1/audits`**
- Body: `{ "warehouse": "id", "productIds": ["id1", "id2"] }`
- Returns: New Audit session in DRAFT state.

**`PUT /api/v1/audits/:id/count`**
- Body: `{ "items": [{ "_id": "itemId", "countedQuantity": 10 }] }`
- Action: Updates physical counts without changing audit status.

**`POST /api/v1/audits/:id/submit`**
- Action: Locks in the counts, captures the `systemQuantitySnapshot`, and changes status to `PENDING_REVIEW`. Hides system quantity from response for non-managers.

**`POST /api/v1/audits/:id/approve` (Manager Only)**
- Body: `{ "reasons": { "itemId": { "reason": "Damage", "explanation": "Water leak" } } }`
- Action: Validates that current stock strictly matches `systemQuantitySnapshot`. If changed, returns 409 and marks `RECOUNT_REQUIRED`. If matches, creates `ADJUSTMENT` operation and updates stock.

**`POST /api/v1/audits/:id/reject` (Manager Only)**
- Body: `{ "reason": "Count completely wrong" }`
- Action: Rejects audit without touching stock.

**`POST /api/v1/audits/:id/recount`**
- Action: Clones a stale/recount-required audit into a new DRAFT audit session.
