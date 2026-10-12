const ROLES = {
  CLIENT: 'client',
  CONTRACTOR: 'contractor',
  ARCHITECT: 'architect',
  ADMIN: 'admin',
};

const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in-progress',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
};

const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const MATERIAL_DELIVERY_STATUS = {
  ORDERED: 'ordered',
  IN_TRANSIT: 'in-transit',
  DELIVERED: 'delivered',
  INSTALLED: 'installed',
};

const MATERIAL_CATEGORIES = {
  CONCRETE: 'concrete',
  STEEL: 'steel',
  WOOD: 'wood',
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  PAINT: 'paint',
  OTHER: 'other',
};

const NOTIFICATION_TYPES = {
  MILESTONE_APPROVED: 'milestone-approved',
  MILESTONE_REJECTED: 'milestone-rejected',
  TASK_ASSIGNED: 'task-assigned',
  REPORT_SUBMITTED: 'report-submitted',
  MATERIAL_DELIVERED: 'material-delivered',
  WEATHER_ALERT: 'weather-alert',
  BUDGET_UPDATE: 'budget-update',
};

module.exports = {
  ROLES,
  PROJECT_STATUS,
  MILESTONE_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  MATERIAL_DELIVERY_STATUS,
  MATERIAL_CATEGORIES,
  NOTIFICATION_TYPES,
};
