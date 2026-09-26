import React, { useState, useEffect } from 'react';
import { DollarSign, Box } from 'lucide-react';
import api from '../lib/api';

const InventoryValuation = () => {
  const [valuationData, setValuationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchValuation = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/valuation');
      setValuationData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch valuation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValuation();
  }, []);

  const totalPortfolioValue = valuationData.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <DollarSign className="text-indigo-600" /> Inventory Valuation
        </h1>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-indigo-800">
          <span className="text-sm font-medium mr-2">Total Value:</span>
          <span className="text-xl font-bold">₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading valuation data...</div>
      ) : valuationData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-500">
          <Box size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium">No inventory valuation found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {valuationData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.product?.name}</div>
                    <div className="text-sm text-gray-500">{item.product?.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.warehouse?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">{item.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-700">
                    ₹{item.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryValuation;
