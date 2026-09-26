const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'VALIDATED', 'CANCELLED'], 
    default: 'DRAFT' 
  },
  sourceWarehouse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Warehouse',
    required: function() {
      return this.type === 'DELIVERY' || this.type === 'TRANSFER';
    }
  },
  destinationWarehouse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Warehouse',
    required: function() {
      return this.type === 'RECEIPT' || this.type === 'TRANSFER';
    }
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: [0, 'Quantity cannot be negative'] }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Operation', operationSchema);
