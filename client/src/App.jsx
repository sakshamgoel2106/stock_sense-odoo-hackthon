import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Warehouses from './pages/Warehouses';
import WarehouseForm from './pages/WarehouseForm';
import StockOverview from './pages/StockOverview';
import Receipts from './pages/Receipts';
import ReceiptForm from './pages/ReceiptForm';
import Deliveries from './pages/Deliveries';
import DeliveryForm from './pages/DeliveryForm';
import Transfers from './pages/Transfers';
import TransferForm from './pages/TransferForm';
import Adjustments from './pages/Adjustments';
import AdjustmentForm from './pages/AdjustmentForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div className="text-2xl font-bold">Dashboard (Member 4)</div>} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="warehouses/new" element={<WarehouseForm />} />
          <Route path="warehouses/:id/edit" element={<WarehouseForm />} />
          
          <Route path="stock-overview" element={<StockOverview />} />
          
          <Route path="receipts" element={<Receipts />} />
          <Route path="receipts/new" element={<ReceiptForm />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="deliveries/new" element={<DeliveryForm />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="transfers/new" element={<TransferForm />} />
          <Route path="adjustments" element={<Adjustments />} />
          <Route path="adjustments/new" element={<AdjustmentForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
