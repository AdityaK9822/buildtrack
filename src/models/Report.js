const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Report date is required'],
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    weather: {
      condition: String,
      temperature: Number,
      impactOnWork: String,
    },
    workCompleted: [String],
    workPlanned: [String],
    issues: [
      {
        description: String,
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    materialsUsed: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Material',
        },
        quantity: Number,
      },
    ],
    laborCount: {
      type: Number,
      min: 0,
    },
    safetyIncidents: [String],
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photo',
      },
    ],
    nextDayPlan: String,
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ projectId: 1, date: -1 });

module.exports = mongoose.model('Report', reportSchema);
