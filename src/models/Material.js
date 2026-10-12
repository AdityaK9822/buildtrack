const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['concrete', 'steel', 'wood', 'electrical', 'plumbing', 'paint', 'other'],
      default: 'other',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    unitCost: {
      type: Number,
      required: [true, 'Unit cost is required'],
      min: 0,
    },
    totalCost: {
      type: Number,
    },
    supplier: {
      name: String,
      contact: String,
      email: String,
    },
    deliveryStatus: {
      type: String,
      enum: ['ordered', 'in-transit', 'delivered', 'installed'],
      default: 'ordered',
    },
    deliveryDate: Date,
    receivedDate: Date,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    invoiceNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

materialSchema.pre('save', function (next) {
  this.totalCost = this.quantity * this.unitCost;
  next();
});

materialSchema.index({ projectId: 1, deliveryStatus: 1 });

module.exports = mongoose.model('Material', materialSchema);
