# StockSense Advanced Features Implementation Plan

## Overview
This document outlines the architecture, schema changes, and logic required to implement the 5 advanced inventory features: Stock Aging, Forecasting, Reservations, Transfer Approvals, and Inventory Valuation. The implementation will extend the existing MVC structure while strictly reusing current authentication, API configurations, and frontend systems.

---

## Phase 2: Core Schema & Inventory Service Upgrades

### 1. New Model: `StockLayer` (Receipt Batch for Aging & Valuation)
**Purpose:** Tracks stock age (FIFO) and individual unit costs for valuation.
**Schema Additions (`server/models/StockLayer.js`):**
- `product`: ObjectId (ref: Product)
- `warehouse`: ObjectId (ref: Warehouse)
- `operation`: ObjectId (ref: Operation, source of the layer)
- `originalQuantity`: Number
- `remainingQuantity`: Number (decreases over time)
- `unitCost`: Number (for valuation, default 0 or based on product cost)
- `receivedAt`: Date (used for aging, preserved during transfers)

### 2. Upgrading `Stock` Model (For Reservations)
**Changes:**
- Add `reservedQuantity`: Number, default 0.
- Available stock is calculated dynamically: `available = quantity - reservedQuantity`.

### 3. Upgrading `Operation` Model (For Transfer Approvals)
**Changes:**
- Add `approvalStatus`: Enum `['NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED']`, default `'NOT_REQUIRED'`.
- Add `approvedBy`: ObjectId (ref: User)
- Add `approvalReason`: String

### 4. Upgrading `inventory.service.js` (The FIFO Engine)
- **RECEIPT:** Create a new `StockLayer` with `remainingQuantity = quantity`.
- **DELIVERY:** Implement FIFO consumption. Query active `StockLayer`s sorted by `receivedAt` ASC. Iteratively reduce `remainingQuantity` across batches until the delivery quantity is fulfilled.
- **TRANSFER:** Consume FIFO layers from the source warehouse. Re-create new `StockLayer`s in the destination warehouse using the *exact same `receivedAt` dates* to preserve aging history.
- **ADJUSTMENT:** If gaining stock, create a new layer (received now). If losing stock, consume FIFO.

---

## Phase 3: Stock Aging & Inventory Valuation
### API Contracts
- `GET /api/inventory/aging`: Returns stock aggregated by aging buckets (0-30, 31-60, 61-90, 90+ days).
- `GET /api/inventory/valuation`: Calculates total value by summing `(StockLayer.remainingQuantity * StockLayer.unitCost)`.
### Frontend
- **Aging Dashboard Tab:** Bar charts or tables showing aging buckets with filters (Warehouse, Product).
- **Valuation Report:** Table view showing product, quantity, unit cost, and total value.

---

## Phase 4: Stock Forecasting
### Logic
- Calculate usage strictly from `VALIDATED` `DELIVERY` operations (or `StockLedger`) over the last X days (7 or 30).
- `Average Daily Usage (ADU) = Total Usage / X`.
- `Estimated Days Remaining = (Stock.quantity - Stock.reservedQuantity) / ADU`.
### API Contracts
- `GET /api/inventory/forecast?window=30`: Returns product list with ADU, Days Remaining, and Status (e.g., "Critical", "Healthy", "Insufficient Data").
### Frontend
- **Forecasting View:** Table showing metrics and warning badges for low estimated days.

---

## Phase 5: Stock Reservation
### New Model: `Reservation.js`
- `product`, `warehouse`, `quantity`, `status` (ACTIVE, FULFILLED, CANCELLED), `user`, `orderReference`.
### Logic
- **Create:** Check if `(Stock.quantity - Stock.reservedQuantity) >= requestQty`. If yes, atomically `$inc: { reservedQuantity: requestQty }`.
- **Cancel:** `$inc: { reservedQuantity: -requestQty }`.
- **Fulfill:** Reduce `reservedQuantity`, then execute standard DELIVERY logic (reduce on-hand `Stock.quantity` and consume FIFO layers).
### Frontend
- **Reservations Tab:** List active reservations, with buttons to Fulfill or Cancel.

---

## Phase 6: Transfer Approval
### Logic
- **Submit Request:** Create `TRANSFER` operation with `status='DRAFT'` and `approvalStatus='PENDING'`. No stock moves.
- **Approve:** Manager endpoint sets `approvalStatus='APPROVED'`.
- **Execute:** Only `APPROVED` transfers can be validated (which executes the FIFO transfer logic).
### Frontend
- **Approvals Dashboard:** For managers to view pending transfers and click "Approve" or "Reject".

---

## Phase 7 & 8: Integration and Testing
- Build React UIs inside the existing Vite application, reusing current Table and Layout components.
- Run Jest tests against `inventory.service.js` to ensure the FIFO engine perfectly matches the `StockLedger` and `Stock` totals.
- Verify backward compatibility for existing records (graceful fallbacks for missing `StockLayer`s).
