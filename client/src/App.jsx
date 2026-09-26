import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Warehouses from './pages/Warehouses';
import WarehouseForm from './pages/WarehouseForm';
import StockOverview from './pages/StockOverview';

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
