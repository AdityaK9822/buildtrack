const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      unique: true,
    },
    categories: [
      {
        name: {
          type: String,
          required: true,
        },
        estimated: {
          type: Number,
          required: true,
          min: 0,
        },
        actual: {
          type: Number,
          default: 0,
          min: 0,
        },
        items: [
          {
            description: String,
            estimated: {
              type: Number,
              min: 0,
            },
            actual: {
              type: Number,
              min: 0,
            },
            date: Date,
            receipt: String,
          },
        ],
      },
    ],
    totalEstimated: {
      type: Number,
      default: 0,
    },
    totalActual: {
      type: Number,
      default: 0,
    },
    variance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.pre('save', function (next) {
  this.totalEstimated = this.categories.reduce((sum, cat) => sum + (cat.estimated || 0), 0);
  this.totalActual = this.categories.reduce((sum, cat) => sum + (cat.actual || 0), 0);
  this.variance = this.totalEstimated - this.totalActual;
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
