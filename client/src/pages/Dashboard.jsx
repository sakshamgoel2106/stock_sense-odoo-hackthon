import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, AlertCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [productsRes, stockRes, operationsRes, ledgerRes, warehouseRes, valuationRes] = await Promise.all([
          api.get('/products'),
          api.get('/inventory/stock'),
          api.get('/inventory/operations'),
          api.get('/inventory/ledger'),
          api.get('/warehouses'),
          api.get('/inventory/valuation')
        ]);

        const products = productsRes.data;
        const stock = stockRes.data;
        const operations = operationsRes.data;
        const ledger = ledgerRes.data;
        const warehouses = warehouseRes.data;
        const valuation = valuationRes.data;

        // KPI Calculations
        const totalPortfolioValue = valuation.reduce((acc, curr) => acc + curr.totalValue, 0);
        const totalProducts = products.length;
        
        let totalStockQuantity = 0;
        const stockByProduct = {};
        const stockByWarehouse = {};
        
        warehouses.forEach(w => stockByWarehouse[w.name] = 0);

        stock.forEach(s => {
          totalStockQuantity += s.quantity;
          stockByProduct[s.product._id] = (stockByProduct[s.product._id] || 0) + s.quantity;
          if (s.warehouse?.name) {
            stockByWarehouse[s.warehouse.name] += s.quantity;
          }
        });

        let lowStockCount = 0;
        let outOfStockCount = 0;
        const lowStockItems = [];

        products.forEach(p => {
          const qty = stockByProduct[p._id] || 0;
          if (qty === 0) outOfStockCount++;
          else if (qty <= (p.reorderLevel || 10)) {
            lowStockCount++;
            lowStockItems.push({ ...p, currentStock: qty });
          }
        });

        const pendingOperations = operations.filter(op => op.status === 'DRAFT');

        // Chart Data
        const warehouseChartData = Object.keys(stockByWarehouse).map(name => ({
          name,
          quantity: stockByWarehouse[name]
        }));

        setStats({
          totalProducts,
          totalStockQuantity,
          totalPortfolioValue,
          lowStockCount,
          outOfStockCount,
          pendingOperationsCount: pendingOperations.length,
          warehouseChartData,
          recentOperations: operations.slice(0, 5),
          lowStockItems: lowStockItems.slice(0, 5),
          recentLedger: ledger.slice(0, 5)
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Package size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Inventory Value</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalPortfolioValue?.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Stock Qty</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStockQuantity}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock</p>
            <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Out of Stock</p>
            <p className="text-2xl font-bold text-gray-900">{stats.outOfStockCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Ops</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingOperationsCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Stock by Warehouse</h2>
          <div className="h-72">
            {stats.warehouseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.warehouseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="quantity"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.warehouseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Units']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No stock data available</div>
            )}
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Low Stock Alerts</h2>
          {stats.lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Product</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">SKU</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Current Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.lowStockItems.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-3 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="py-3 text-sm text-gray-500">{item.sku}</td>
                      <td className="py-3 text-sm text-right font-medium text-red-600">{item.currentStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">All products are adequately stocked</div>
          )}
        </div>
      </div>

      {/* Recent Ledger / Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Stock Movements</h2>
        {stats.recentLedger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Operation</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Warehouse</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentLedger.map(entry => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-500">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">{entry.operation?.type || 'UNKNOWN'}</td>
                    <td className="py-3 text-sm text-gray-500">{entry.product?.name || '-'}</td>
                    <td className="py-3 text-sm text-gray-500">{entry.warehouse?.name || '-'}</td>
                    <td className={`py-3 text-sm text-right font-medium ${entry.quantityChange > 0 ? 'text-green-600' : entry.quantityChange < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {entry.quantityChange > 0 ? '+' : ''}{entry.quantityChange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400">No recent activities</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
