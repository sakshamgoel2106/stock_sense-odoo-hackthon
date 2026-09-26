import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Package, MapPin, BarChart3, LayoutDashboard } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Package />
          StockSense
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/products" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <Package size={20} /> Products
          </Link>
          <Link to="/warehouses" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <MapPin size={20} /> Warehouses
          </Link>
          <Link to="/stock-overview" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <BarChart3 size={20} /> Stock Overview
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
