import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import api from '../lib/api';

const OperationList = ({ title, type, newLink }) => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validating, setValidating] = useState(null);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/operations');
      const filtered = res.data.filter(op => op.type === type);
      setOperations(filtered);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [type]);

  const handleValidate = async (id) => {
    if (!window.confirm('Are you sure you want to validate this operation? This will affect stock.')) return;
    
    try {
      setValidating(id);
      await api.post(`/inventory/operations/${id}/validate`);
      alert('Operation validated successfully!');
      fetchOperations();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to validate operation');
    } finally {
      setValidating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{title}</h1>
        <Link to={newLink} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow flex items-center gap-2 transition-colors">
          <Plus size={20} /> New {title.slice(0, -1)}
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading {title.toLowerCase()}...
        </div>
      ) : operations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-500">
          <p className="text-lg font-medium">No {title.toLowerCase()} found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Date</th>
                  {type !== 'RECEIPT' && type !== 'ADJUSTMENT' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>}
                  {type !== 'DELIVERY' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.map((op) => (
                  <tr key={op._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{op._id.slice(-6).toUpperCase()}</div>
                      <div className="text-sm text-gray-500">{new Date(op.createdAt).toLocaleDateString()}</div>
                    </td>
                    {type !== 'RECEIPT' && type !== 'ADJUSTMENT' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {op.sourceWarehouse?.name || '-'}
                      </td>
                    )}
                    {type !== 'DELIVERY' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {op.destinationWarehouse?.name || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {op.items.map(item => (
                        <div key={item.product?._id}>{item.product?.name} ({type === 'ADJUSTMENT' ? 'Counted: ' : ''}{item.quantity})</div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        op.status === 'VALIDATED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {op.status === 'VALIDATED' ? <CheckCircle size={14} className="mr-1 inline" /> : <Clock size={14} className="mr-1 inline" />}
                        {op.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {op.status === 'DRAFT' && (
                        <button
                          onClick={() => handleValidate(op._id)}
                          disabled={validating === op._id}
                          className="text-indigo-600 hover:text-indigo-900 font-medium disabled:opacity-50"
                        >
                          {validating === op._id ? 'Validating...' : 'Validate'}
                        </button>
                      )}
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

export default OperationList;
