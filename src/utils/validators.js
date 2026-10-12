const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).when('firebaseUid', {
    is: '',
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('client', 'contractor', 'architect', 'admin').required(),
  phone: Joi.string().optional(),
  company: Joi.string().optional(),
  firebaseUid: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const projectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  slug: Joi.string().optional(), // Auto-generated if not provided
  description: Joi.string().max(500).optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).optional(),
  clientId: Joi.string().hex().length(24).required(),
  contractorId: Joi.string().hex().length(24).required(),
  architectId: Joi.string().hex().length(24).optional(),
  budget: Joi.object({
    estimated: Joi.number().positive().required(),
    currency: Joi.string().default('USD'),
  }).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  estimatedEndDate: Joi.date().iso().optional(),
  team: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

const milestoneSchema = Joi.object({
  projectId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.string() // Also accepts slugs
  ).required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
});

const taskSchema = Joi.object({
  projectId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.string() // Also accepts slugs
  ).required(),
  milestoneId: Joi.string().hex().length(24).optional(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  assignedTo: Joi.array().items(Joi.string().hex().length(24)).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  dueDate: Joi.date().iso().optional(),
  estimatedHours: Joi.number().min(0).optional(),
});

const materialSchema = Joi.object({
  projectId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.string() // Also accepts slugs
  ).required(),
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().valid('concrete', 'steel', 'wood', 'electrical', 'plumbing', 'paint', 'other').optional(),
  quantity: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  unitCost: Joi.number().min(0).required(),
  supplier: Joi.object({
    name: Joi.string().optional(),
    contact: Joi.string().optional(),
    email: Joi.string().email().optional(),
  }).optional(),
  deliveryStatus: Joi.string().valid('ordered', 'in-transit', 'delivered', 'installed').optional(),
  deliveryDate: Joi.date().iso().optional(),
  receivedDate: Joi.date().iso().optional(),
  invoiceNumber: Joi.string().optional(),
  notes: Joi.string().max(500).optional(),
});

const laborSchema = Joi.object({
  projectId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.string() // Also accepts slugs
  ).required(),
  worker: Joi.object({
    name: Joi.string().required(),
    role: Joi.string().required(),
    phone: Joi.string().optional(),
    employeeId: Joi.string().optional(),
  }).required(),
  date: Joi.date().iso().required(),
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().min(Joi.ref('checkIn')).optional(),
  hourlyRate: Joi.number().min(0).required(),
  overtimeHours: Joi.number().min(0).optional(),
  overtimeRate: Joi.number().min(0).optional(),
  notes: Joi.string().max(500).optional(),
});

const reportSchema = Joi.object({
  projectId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.string() // Also accepts slugs
  ).required(),
  date: Joi.date().iso().required(),
  title: Joi.string().min(3).max(100).required(),
  summary: Joi.string().min(10).required(),
  weather: Joi.object({
    condition: Joi.string().optional(),
    temperature: Joi.number().optional(),
    impactOnWork: Joi.string().optional(),
  }).optional(),
  workCompleted: Joi.array().items(Joi.string()).optional(),
  workPlanned: Joi.array().items(Joi.string()).optional(),
  issues: Joi.array().items(Joi.object({
    description: Joi.string().optional(),
    severity: Joi.string().valid('low', 'medium', 'high').optional(),
    resolved: Joi.boolean().optional(),
  })).optional(),
  laborCount: Joi.number().min(0).optional(),
  safetyIncidents: Joi.array().items(Joi.string()).optional(),
  nextDayPlan: Joi.string().optional(),
});

const budgetSchema = Joi.object({
  categories: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    estimated: Joi.number().min(0).required(),
    items: Joi.array().items(Joi.object({
      description: Joi.string().optional(),
      estimated: Joi.number().min(0).optional(),
      actual: Joi.number().min(0).optional(),
      date: Joi.date().iso().optional(),
      receipt: Joi.string().optional(),
    })).optional(),
  })).required(),
});

const approvalSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  comments: Joi.string().max(500).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  projectSchema,
  milestoneSchema,
  taskSchema,
  materialSchema,
  laborSchema,
  reportSchema,
  budgetSchema,
  approvalSchema,
};
