import React, { useState, useEffect } from 'react';
import { CheckSquare, Box, Check, X } from 'lucide-react';
import api from '../lib/api';

const TransferApprovals = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/operations');
      // Filter only TRANSFER operations that are PENDING
      setOperations(res.data.filter(op => op.type === 'TRANSFER' && op.approvalStatus === 'PENDING'));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this transfer?`)) return;
    try {
      if (action === 'reject') {
        const reason = window.prompt("Enter rejection reason:");
        if (reason === null) return; // User cancelled
        await api.put(`/inventory/operations/${id}/reject`, { reason });
      } else {
        await api.put(`/inventory/operations/${id}/approve`);
        // If approved, automatically validate it to execute the stock movement
        await api.post(`/inventory/operations/${id}/validate`);
      }
      fetchOperations();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} operation`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <CheckSquare className="text-indigo-600" /> Transfer Approvals
        </h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading pending transfers...</div>
      ) : operations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-500">
          <Box size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium">No pending transfers to approve</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{item.sourceWarehouse?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{item.destinationWarehouse?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.items.map((i, idx) => (
                      <div key={idx}>
                        {i.quantity}x {i.product?.name}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAction(item._id, 'approve')} className="bg-green-50 text-green-600 px-3 py-1 rounded-md hover:bg-green-100 flex items-center gap-1 transition-colors">
                        <Check size={16} /> Approve
                      </button>
                      <button onClick={() => handleAction(item._id, 'reject')} className="bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100 flex items-center gap-1 transition-colors">
                        <X size={16} /> Reject
                      </button>
                    </div>
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

export default TransferApprovals;
