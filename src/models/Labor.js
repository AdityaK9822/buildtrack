const mongoose = require('mongoose');

const laborSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    worker: {
      name: {
        type: String,
        required: [true, 'Worker name is required'],
        trim: true,
      },
      role: {
        type: String,
        required: [true, 'Worker role is required'],
        trim: true,
      },
      phone: String,
      employeeId: String,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkOut: Date,
    hoursWorked: {
      type: Number,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: 0,
    },
    totalEarnings: Number,
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtimeRate: Number,
    notes: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

laborSchema.pre('save', function (next) {
  if (this.checkOut && this.checkIn) {
    const diffMs = this.checkOut - this.checkIn;
    this.hoursWorked = Math.round((diffMs / 3600000) * 100) / 100;
  }
  
  const baseEarnings = (this.hoursWorked || 0) * this.hourlyRate;
  const overtimeEarnings = (this.overtimeHours || 0) * (this.overtimeRate || this.hourlyRate * 1.5);
  this.totalEarnings = baseEarnings + overtimeEarnings;
  
  next();
});

laborSchema.index({ projectId: 1, date: -1 });

module.exports = mongoose.model('Labor', laborSchema);
