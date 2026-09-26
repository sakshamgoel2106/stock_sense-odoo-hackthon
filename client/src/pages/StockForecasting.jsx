import React, { useState, useEffect } from 'react';
import { TrendingUp, Box } from 'lucide-react';
import api from '../lib/api';

const StockForecasting = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [window, setWindow] = useState('30');

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/forecast?window=${window}`);
      setForecastData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch forecasting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [window]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <TrendingUp className="text-indigo-600" /> Stock Forecasting
        </h1>
        <select
          value={window}
          onChange={(e) => setWindow(e.target.value)}
          className="border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading forecast data...</div>
      ) : forecastData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-500">
          <Box size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium">No inventory data to forecast</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg. Daily Usage</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Est. Days Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.product?.name}</div>
                      <div className="text-sm text-gray-500">{item.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.warehouse?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {item.availableStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.averageDailyUsage.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-700">
                      {item.estimatedDaysRemaining !== null ? Math.ceil(item.estimatedDaysRemaining) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                        item.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'Critical' || item.status === 'Stock out' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockForecasting;
