import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    prices: [{ currency: 'USD', amount: 0 }],
    unitOfMeasure: 'Units',
    reorderLevel: 0,
    status: 'ACTIVE'
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);

  const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const p = res.data;
          setFormData({
            name: p.name,
            sku: p.sku,
            description: p.description || '',
            category: p.category || '',
            prices: p.prices && p.prices.length > 0 ? p.prices : [{ currency: 'USD', amount: 0 }],
            unitOfMeasure: p.unitOfMeasure,
            reorderLevel: p.reorderLevel,
            status: p.status
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch product');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...formData.prices];
    if (field === 'amount') {
      newPrices[index][field] = Number(value);
    } else {
      newPrices[index][field] = value;
    }
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };

  const addPrice = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { currency: 'USD', amount: 0 }]
    }));
  };

  const removePrice = (index) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate prices
    if (formData.prices.length === 0) {
      setError('At least one price is required.');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading product data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
        <button 
          onClick={() => navigate('/products')}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input
                type="text"
                name="sku"
                required
                className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  name="unitOfMeasure"
                  className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Multi-Currency Pricing Section */}
            <div className="md:col-span-2 border-t pt-6 mt-2">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-gray-800">Pricing (Multi-Currency)</label>
                <button
                  type="button"
                  onClick={addPrice}
                  className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={16} /> Add Currency
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.prices.map((priceObj, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                      <select
                        value={priceObj.currency}
                        onChange={(e) => handlePriceChange(index, 'currency', e.target.value)}
                        className="w-full border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                      >
                        {CURRENCY_OPTIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceObj.amount}
                        onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                        className="w-full border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                      />
                    </div>
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => removePrice(index)}
                        disabled={formData.prices.length === 1}
                        className="text-red-500 hover:text-red-700 p-2 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 border border-transparent rounded-lg text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
