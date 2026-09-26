import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Package, MapPin, BarChart3, LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Sliders } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Package />
          StockSense
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Operations</p>
          </div>
          <Link to="/receipts" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <ArrowDownToLine size={20} /> Receipts
          </Link>
          <Link to="/deliveries" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <ArrowUpFromLine size={20} /> Deliveries
          </Link>
          <Link to="/transfers" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <ArrowRightLeft size={20} /> Transfers
          </Link>
          <Link to="/adjustments" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
            <Sliders size={20} /> Adjustments
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
