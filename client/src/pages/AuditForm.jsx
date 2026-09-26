import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, ArrowLeft, Send } from 'lucide-react';
import api from '../lib/api';

const AuditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // For new audit
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // For counting
  const [audit, setAudit] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    if (isNew) {
      const fetchData = async () => {
        try {
          const [whRes, prRes] = await Promise.all([
            api.get('/warehouses'),
            api.get('/products')
          ]);
          setWarehouses(whRes.data);
          setProducts(prRes.data);
        } catch (err) {
          setError('Failed to load initial data');
        }
      };
      fetchData();
    } else {
      const fetchAudit = async () => {
        try {
          const res = await api.get(`/audits/${id}`);
          setAudit(res.data);
          const initialCounts = {};
          res.data.items.forEach(item => {
            initialCounts[item._id] = item.countedQuantity !== null ? item.countedQuantity : '';
          });
          setCounts(initialCounts);
        } catch (err) {
          setError('Failed to load audit');
        } finally {
          setLoading(false);
        }
      };
      fetchAudit();
    }
  }, [id, isNew]);

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    if (!selectedWarehouse || selectedProducts.length === 0) {
      return setError('Please select a warehouse and at least one product.');
    }
    try {
      setSaving(true);
      const res = await api.post('/audits', {
        warehouse: selectedWarehouse,
        productIds: selectedProducts
      });
      navigate(`/audits/${res.data._id}/count`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create audit');
      setSaving(false);
    }
  };

  const handleSaveCounts = async () => {
    try {
      setSaving(true);
      const itemsPayload = Object.keys(counts).map(itemId => ({
        _id: itemId,
        countedQuantity: counts[itemId] === '' ? null : Number(counts[itemId])
      }));
      await api.put(`/audits/${id}/count`, { items: itemsPayload });
      alert('Progress saved successfully');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save counts');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAudit = async () => {
    const incomplete = Object.values(counts).some(qty => qty === '' || qty === null);
    if (incomplete) {
      return setError('Please complete all counts before submitting.');
    }
    if (!window.confirm("Are you sure you want to submit this audit? You won't be able to change counts after submission.")) return;
    
    try {
      setSaving(true);
      const itemsPayload = Object.keys(counts).map(itemId => ({
        _id: itemId,
        countedQuantity: Number(counts[itemId])
      }));
      await api.put(`/audits/${id}/count`, { items: itemsPayload });
      
      await api.post(`/audits/${id}/submit`);
      navigate('/audits');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit audit');
      setSaving(false);
    }
  };

  const toggleProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/audits')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          {isNew ? 'New Audit Session' : 'Record Audit Counts'}
        </h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

      {isNew ? (
        <form onSubmit={handleCreateAudit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Warehouse</label>
            <select
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              required
            >
              <option value="">-- Choose Warehouse --</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Products to Count</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg bg-gray-50">
              {products.map(p => (
                <label key={p._id} className="flex items-center gap-3 p-3 bg-white rounded shadow-sm cursor-pointer hover:bg-indigo-50 border border-gray-200">
                  <input
                    type="checkbox"
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                    checked={selectedProducts.includes(p._id)}
                    onChange={() => toggleProduct(p._id)}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sku}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">{selectedProducts.length} products selected</p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow flex items-center gap-2"
            >
              {saving ? 'Starting...' : 'Start Audit Session'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">Audit Information</p>
            <p className="text-sm text-blue-600">Warehouse: {audit?.warehouse?.name}</p>
            <p className="text-sm text-blue-600 mt-1">Please physically count the stock for the items below. The system quantity is hidden intentionally.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {audit?.items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.product?.sku}</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        className="w-32 text-right border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                        value={counts[item._id] ?? ''}
                        onChange={(e) => setCounts({ ...counts, [item._id]: e.target.value })}
                        placeholder="Count"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={handleSaveCounts}
              disabled={saving}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2"
            >
              <Save size={18} /> Save Progress
            </button>
            <button
              onClick={handleSubmitAudit}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow flex items-center gap-2"
            >
              <Send size={18} /> Submit Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditForm;
