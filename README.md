# StockSense - Professional Inventory Management System

StockSense is a comprehensive inventory management system built with the MERN stack (MongoDB, Express, React, Node.js). It provides robust tracking of warehouses, products, stock levels, and inventory operations such as receipts, deliveries, internal transfers, and stock adjustments.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with role management (ADMIN, MANAGER, WORKER).
- **Dashboard**: Real-time KPI metrics, stock visualization by warehouse, and low-stock alerts.
- **Product Management**: Track products with SKUs, categories, reorder levels, and statuses.
- **Warehouse Management**: Support for multiple storage locations.
- **Inventory Operations**:
  - **Receipts**: Inbound stock.
  - **Deliveries**: Outbound stock.
  - **Transfers**: Inter-warehouse stock movement.
  - **Adjustments**: Manual stock correction (e.g., cycle counts).
- **Stock Ledger**: Immutable audit trail of all inventory movements.
- **Responsive Layout**: Modern, fast UI powered by React, Tailwind CSS, and Lucide React.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router, Tailwind CSS, Recharts, Lucide React, Axios.
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs.
- **Deployment**: 
  - Frontend: Vercel / Netlify (Ready)
  - Backend: Render / Railway (Ready)

## 📁 Project Structure

```
stock_sense/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Layout, ProtectedRoute, etc.)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── lib/            # Axios API configuration
│   │   ├── pages/          # Application views (Dashboard, Products, Auth, Operations)
│   │   ├── App.jsx         # Main React Router configuration
│   │   └── main.jsx        # React DOM entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express Backend
│   ├── config/             # DB & Server configuration
│   ├── controllers/        # Route logic (auth, inventory, products, warehouses)
│   ├── middleware/         # Custom middlewares (auth protection, error handling)
│   ├── models/             # Mongoose schemas (User, Product, Stock, Ledger, Operation, Warehouse)
│   ├── routes/             # API Endpoints mapping
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── docs/                   # Documentation (API Contracts)
└── README.md
```

## ⚙️ Environment Variables

Create a `.env` file in the `server` directory using this `.env.example`:

```env
# server/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stocksense?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

Create a `.env` file in the `client` directory:

```env
# client/.env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 💻 Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sakshamgoel2106/stock_sense-odoo-hackthon.git
   cd stock_sense-odoo-hackthon
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Make sure you have your .env file created
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd client
   npm install
   # Make sure you have your .env file created
   npm run dev
   ```

## 🌍 Deployment Links

- **Frontend (Live)**: [TBD]
- **Backend API**: [TBD]
- **Demo Video**: [TBD]

## 📸 Screenshots

*(Add screenshots of the Dashboard, Stock Ledger, and Operation Forms here after deployment)*

## 👥 Team Members & Responsibilities

- **Member 1**: Core backend architecture, Ledger implementation, Inventory Controllers.
- **Member 2**: Products and Warehouses REST API and React components.
- **Member 3**: Inventory operations (Receipts, Deliveries, Transfers, Adjustments).
- **Member 4**: Authentication (Frontend & Backend), Dashboard UI, Shared App Layout, Overall Integration, and Deployment preparation.