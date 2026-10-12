const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      address: String,
      city: String,
      state: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required'],
    },
    architectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    budget: {
      estimated: {
        type: Number,
        required: [true, 'Estimated budget is required'],
      },
      actual: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: Date,
    estimatedEndDate: Date,
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone',
      },
    ],
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photo',
      },
    ],
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    documents: [String],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug from name
projectSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes for common query patterns
projectSchema.index({ clientId: 1, createdAt: -1 });
projectSchema.index({ contractorId: 1, createdAt: -1 });
projectSchema.index({ architectId: 1, createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ slug: 1 });

projectSchema.methods.calculateProgress = async function () {
  const Milestone = mongoose.model('Milestone');
  const milestones = await Milestone.find({ projectId: this._id });
  
  if (milestones.length === 0) return 0;
  
  const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
  return Math.round(totalProgress / milestones.length);
};

module.exports = mongoose.model('Project', projectSchema);
