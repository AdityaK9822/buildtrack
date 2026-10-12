const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader ID is required'],
    },
    url: {
      type: String,
      required: [true, 'Photo URL is required'],
    },
    caption: {
      type: String,
      trim: true,
    },
    tags: [String],
    metadata: {
      capturedAt: Date,
      location: {
        lat: Number,
        lng: Number,
      },
      device: String,
    },
    isDronePhoto: {
      type: Boolean,
      default: false,
    },
    droneData: {
      altitude: Number,
      flightId: String,
    },
  },
  {
    timestamps: true,
  }
);

photoSchema.index({ projectId: 1, createdAt: -1 });
photoSchema.index({ projectId: 1, milestoneId: 1 });

module.exports = mongoose.model('Photo', photoSchema);
