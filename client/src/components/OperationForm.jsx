import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';

const OperationForm = ({ type, title, backLink }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sourceWarehouse: '',
    destinationWarehouse: '',
    items: []
  });
  
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockLevels, setStockLevels] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [whRes, prodRes] = await Promise.all([
          api.get('/warehouses'),
          api.get('/products')
        ]);
        setWarehouses(whRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        setError('Failed to load form dependencies');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  // Fetch stock levels for adjustment when warehouse changes
  useEffect(() => {
    if (type === 'ADJUSTMENT' && formData.destinationWarehouse) {
      const fetchStock = async () => {
        try {
          const res = await api.get(`/inventory/stock?warehouse=${formData.destinationWarehouse}`);
          const map = {};
          res.data.forEach(s => {
            map[s.product._id] = s.quantity;
          });
          setStockLevels(map);
          
          setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => ({
              ...item,
              currentQty: map[item.product] || 0
            }))
          }));
        } catch (err) {
          console.error(err);
        }
      };
      fetchStock();
    }
  }, [type, formData.destinationWarehouse]);

  const handleProductChange = (index, productId) => {
    const newItems = [...formData.items];
    newItems[index].product = productId;
    if (type === 'ADJUSTMENT') {
      newItems[index].currentQty = stockLevels[productId] || 0;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleQuantityChange = (index, qty) => {
    const newItems = [...formData.items];
    newItems[index].quantity = qty;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, currentQty: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      setError('Please add at least one product line.');
      return;
    }
    
    for (let item of formData.items) {
      if (!item.product) {
        setError('Please select a product for all lines.');
        return;
      }
      if (item.quantity < 0) {
        setError('Quantities cannot be negative.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    const payload = {
      type,
      items: formData.items.map(i => ({ product: i.product, quantity: Number(i.quantity) }))
    };

    if (type === 'RECEIPT' || type === 'TRANSFER' || type === 'ADJUSTMENT') {
      payload.destinationWarehouse = formData.destinationWarehouse;
    }
    if (type === 'DELIVERY' || type === 'TRANSFER') {
      payload.sourceWarehouse = formData.sourceWarehouse;
    }
    if (type === 'TRANSFER' && formData.sourceWarehouse === formData.destinationWarehouse) {
      setError('Source and destination warehouses must be different.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/inventory/operations', payload);
      navigate(backLink);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create operation');
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading form...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          New {title}
        </h1>
        <button 
          onClick={() => navigate(backLink)}
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
            {(type === 'DELIVERY' || type === 'TRANSFER') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Warehouse *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                  value={formData.sourceWarehouse}
                  onChange={(e) => setFormData({...formData, sourceWarehouse: e.target.value})}
                >
                  <option value="">Select Source</option>
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {(type === 'RECEIPT' || type === 'TRANSFER' || type === 'ADJUSTMENT') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Warehouse *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                  value={formData.destinationWarehouse}
                  onChange={(e) => setFormData({...formData, destinationWarehouse: e.target.value})}
                >
                  <option value="">Select Destination</option>
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-end gap-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                      value={item.product}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  
                  {type === 'ADJUSTMENT' && (
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">System Qty</label>
                      <input
                        type="number"
                        disabled
                        className="w-full border border-gray-300 rounded-lg shadow-sm bg-gray-100 p-2"
                        value={item.currentQty}
                      />
                    </div>
                  )}

                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {type === 'ADJUSTMENT' ? 'Counted Qty' : 'Quantity'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                    />
                  </div>

                  {type === 'ADJUSTMENT' && (
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delta</label>
                      <input
                        type="number"
                        disabled
                        className="w-full border border-gray-300 rounded-lg shadow-sm bg-gray-100 p-2"
                        value={Number(item.quantity) - item.currentQty}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:text-red-900 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addItem}
              className="mt-4 flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800"
            >
              <Plus size={20} /> Add Line Item
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={() => navigate(backLink)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 border border-transparent rounded-lg text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OperationForm;
