# StockSense 📦

StockSense is a comprehensive Inventory Management System built for the hackathon. It features a robust engine for managing products, warehouses, multi-warehouse stock levels, and precise stock operations (Receipts, Deliveries, Internal Transfers, and Inventory Adjustments).

## 🏗 Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **Frontend**: React + Vite + Tailwind CSS *(WIP)*
- **Authentication**: JWT *(WIP)*

## 🚀 Key Features
- **Atomic Operations Engine**: Uses MongoDB transactions to guarantee exact stock consistency and prevent race conditions.
- **Stock Ledger Auditing**: Every single stock movement automatically creates an auditable ledger entry tracking exactly what changed, by how much, and where.
- **Strict Validation**: Prevents negative stock, automatically calculates delta counts during stock adjustments, and halts duplicate validations.

## 📂 Project Architecture
- `/server/`: The Node.js Express backend
- `/server/services/inventory.service.js`: The "brain" handling the core business logic and database transactions.
- `/docs/API_CONTRACTS.md`: The shared blueprint defining API requests, responses, and data schemas for the entire team.

## 💻 Running the Backend Locally

1. Navigate to the server directory and install packages:
   ```bash
   cd server
   npm install
   ```

2. Your `.env` should look like this (already set up!):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://...
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run the integration tests:
   ```bash
   npm test
   ```