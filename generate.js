const fs = require('fs');
const path = require('path');

const listContent = `import React, { useState, useEffect } from 'react';
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
      await api.post(\`/inventory/operations/\${id}/validate\`);
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
                      <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                        op.status === 'VALIDATED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }\`}>
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
`;

fs.writeFileSync('client/src/components/OperationList.jsx', listContent);

const formContent = `import React, { useState, useEffect } from 'react';
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
          const res = await api.get(\`/inventory/stock?warehouse=\${formData.destinationWarehouse}\`);
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
`;

fs.writeFileSync('client/src/components/OperationForm.jsx', formContent);

const pages = [
  { name: 'Receipts', type: 'RECEIPT', newLink: '/receipts/new' },
  { name: 'Deliveries', type: 'DELIVERY', newLink: '/deliveries/new' },
  { name: 'Transfers', type: 'TRANSFER', newLink: '/transfers/new' },
  { name: 'Adjustments', type: 'ADJUSTMENT', newLink: '/adjustments/new' }
];

pages.forEach(p => {
  const content = `import React from 'react';
import OperationList from '../components/OperationList';

const ${p.name} = () => {
  return <OperationList title="${p.name}" type="${p.type}" newLink="${p.newLink}" />;
};

export default ${p.name};
`;
  fs.writeFileSync(`client/src/pages/${p.name}.jsx`, content);
});

const formPages = [
  { name: 'ReceiptForm', type: 'RECEIPT', title: 'Receipt', backLink: '/receipts' },
  { name: 'DeliveryForm', type: 'DELIVERY', title: 'Delivery Order', backLink: '/deliveries' },
  { name: 'TransferForm', type: 'TRANSFER', title: 'Internal Transfer', backLink: '/transfers' },
  { name: 'AdjustmentForm', type: 'ADJUSTMENT', title: 'Inventory Adjustment', backLink: '/adjustments' }
];

formPages.forEach(p => {
  const content = `import React from 'react';
import OperationForm from '../components/OperationForm';

const ${p.name} = () => {
  return <OperationForm type="${p.type}" title="${p.title}" backLink="${p.backLink}" />;
};

export default ${p.name};
`;
  fs.writeFileSync(`client/src/pages/${p.name}.jsx`, content);
});

console.log('Done');
