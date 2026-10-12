const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const Material = require('../models/Material');
const Labor = require('../models/Labor');
const Report = require('../models/Report');
const Photo = require('../models/Photo');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Milestone.deleteMany({}),
      Task.deleteMany({}),
      Material.deleteMany({}),
      Labor.deleteMany({}),
      Report.deleteMany({}),
      Photo.deleteMany({}),
      Budget.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Cleared existing data...');

    // Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@buildtrack.com',
        password: 'password123',
        role: 'admin',
        phone: '+1-555-0100',
      },
      {
        name: 'John Contractor',
        email: 'contractor@buildtrack.com',
        password: 'password123',
        role: 'contractor',
        phone: '+1-555-0101',
      },
      {
        name: 'Sarah Architect',
        email: 'architect@buildtrack.com',
        password: 'password123',
        role: 'architect',
        phone: '+1-555-0102',
      },
      {
        name: 'Mike Client',
        email: 'client@buildtrack.com',
        password: 'password123',
        role: 'client',
        phone: '+1-555-0103',
      },
      {
        name: 'Dave Laborer',
        email: 'laborer@buildtrack.com',
        password: 'password123',
        role: 'contractor',
        phone: '+1-555-0104',
      },
    ]);

    console.log('Created users...');

    // Create Projects
    const projects = await Project.create([
      {
        name: 'Downtown Office Complex',
        description: 'Construction of a modern 10-story office building in downtown area with parking facility',
        status: 'in-progress',
        progress: 45,
        location: {
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
        budget: {
          estimated: 5000000,
          actual: 2250000,
        },
        startDate: new Date('2025-01-15'),
        estimatedEndDate: new Date('2027-06-30'),
        clientId: users[3]._id,
        contractorId: users[1]._id,
        architectId: users[2]._id,
        team: [users[1]._id, users[4]._id],
      },
      {
        name: 'Riverside Apartments',
        description: 'Luxury apartment complex with 50 units and amenities',
        status: 'planning',
        progress: 15,
        location: {
          address: '456 River Road',
          city: 'Brooklyn',
          state: 'NY',
          coordinates: { lat: 40.6892, lng: -73.9857 },
        },
        budget: {
          estimated: 8000000,
          actual: 1200000,
        },
        startDate: new Date('2025-03-01'),
        estimatedEndDate: new Date('2027-12-31'),
        clientId: users[3]._id,
        contractorId: users[1]._id,
        architectId: users[2]._id,
        team: [users[1]._id],
      },
      {
        name: 'Community Hospital Extension',
        description: 'Adding a new wing to the existing community hospital',
        status: 'in-progress',
        progress: 68,
        location: {
          address: '789 Health Avenue',
          city: 'Queens',
          state: 'NY',
          coordinates: { lat: 40.7282, lng: -73.7949 },
        },
        budget: {
          estimated: 12000000,
          actual: 8160000,
        },
        startDate: new Date('2024-06-01'),
        estimatedEndDate: new Date('2026-03-31'),
        clientId: users[3]._id,
        contractorId: users[1]._id,
        architectId: users[2]._id,
        team: [users[1]._id, users[4]._id],
      },
    ]);

    console.log('Created projects...');

    // Create Milestones (using valid statuses: pending, in-progress, submitted, approved, rejected)
    const milestones = await Milestone.create([
      {
        projectId: projects[0]._id,
        name: 'Foundation Complete',
        description: 'Complete building foundation and basement structure',
        status: 'approved',
        progress: 100,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-03-30'),
      },
      {
        projectId: projects[0]._id,
        name: 'Structural Steelwork',
        description: 'Install all structural steel beams and columns',
        status: 'in-progress',
        progress: 75,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-08-15'),
      },
      {
        projectId: projects[0]._id,
        name: 'Roof Installation',
        description: 'Complete roofing and weatherproofing',
        status: 'pending',
        progress: 0,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-11-30'),
      },
      {
        projectId: projects[1]._id,
        name: 'Site Preparation',
        description: 'Clear site and prepare for construction',
        status: 'approved',
        progress: 100,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-15'),
      },
      {
        projectId: projects[2]._id,
        name: 'Frame Construction',
        description: 'Build the main frame structure',
        status: 'submitted',
        progress: 85,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-02-28'),
      },
    ]);

    console.log('Created milestones...');

    // Create Tasks
    const tasks = await Task.create([
      {
        projectId: projects[0]._id,
        milestoneId: milestones[1]._id,
        name: 'Install steel columns on floor 5',
        description: 'Complete installation of steel columns for the fifth floor',
        status: 'completed',
        priority: 'high',
        assignedTo: [users[4]._id],
        dueDate: new Date('2025-06-15'),
      },
      {
        projectId: projects[0]._id,
        milestoneId: milestones[1]._id,
        name: 'Weld steel beams floor 6',
        description: 'Weld and secure steel beams for the sixth floor',
        status: 'in-progress',
        priority: 'high',
        assignedTo: [users[4]._id],
        dueDate: new Date('2025-07-30'),
      },
      {
        projectId: projects[0]._id,
        name: 'Order concrete for floor 7',
        description: 'Place order for concrete delivery for seventh floor',
        status: 'pending',
        priority: 'medium',
        assignedTo: [users[1]._id],
        dueDate: new Date('2025-08-01'),
      },
      {
        projectId: projects[1]._id,
        milestoneId: milestones[3]._id,
        name: 'Survey site boundaries',
        description: 'Conduct site survey and mark boundaries',
        status: 'completed',
        priority: 'high',
        assignedTo: [users[2]._id],
        dueDate: new Date('2025-03-10'),
      },
      {
        projectId: projects[2]._id,
        milestoneId: milestones[4]._id,
        name: 'Install HVAC ducts',
        description: 'Install HVAC ducting system in east wing',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: [users[4]._id],
        dueDate: new Date('2025-10-15'),
      },
    ]);

    console.log('Created tasks...');

    // Create Materials (using valid deliveryStatus: ordered, in-transit, delivered, installed)
    const materials = await Material.create([
      {
        projectId: projects[0]._id,
        name: 'Portland Cement',
        category: 'concrete',
        quantity: 500,
        unit: 'bags',
        unitCost: 12.50,
        supplier: {
          name: 'BuildMart Supplies',
          contact: '+1-555-0200',
          email: 'orders@buildmart.com'
        },
        deliveryStatus: 'delivered',
        deliveryDate: new Date('2025-01-25'),
      },
      {
        projectId: projects[0]._id,
        name: 'Steel Rebar 12mm',
        category: 'steel',
        quantity: 2000,
        unit: 'kg',
        unitCost: 1.25,
        supplier: {
          name: 'Steel Works Inc',
          contact: '+1-555-0201',
          email: 'sales@steelworks.com'
        },
        deliveryStatus: 'delivered',
        deliveryDate: new Date('2025-02-10'),
      },
      {
        projectId: projects[0]._id,
        name: 'Structural Steel Beam I-200',
        category: 'steel',
        quantity: 150,
        unit: 'pieces',
        unitCost: 850,
        supplier: {
          name: 'Steel Works Inc',
          contact: '+1-555-0201',
          email: 'sales@steelworks.com'
        },
        deliveryStatus: 'in-transit',
        deliveryDate: new Date('2025-07-15'),
      },
      {
        projectId: projects[0]._id,
        name: 'Electrical Wire 12 AWG',
        category: 'electrical',
        quantity: 5000,
        unit: 'm',
        unitCost: 0.85,
        supplier: {
          name: 'ElectroSupply',
          contact: '+1-555-0202',
          email: 'orders@electrosupply.com'
        },
        deliveryStatus: 'ordered',
      },
      {
        projectId: projects[0]._id,
        name: 'PVC Pipes 4 inch',
        category: 'plumbing',
        quantity: 200,
        unit: 'm',
        unitCost: 15,
        supplier: {
          name: 'PlumbPro',
          contact: '+1-555-0203',
          email: 'sales@plumbpro.com'
        },
        deliveryStatus: 'delivered',
        deliveryDate: new Date('2025-03-25'),
      },
      {
        projectId: projects[1]._id,
        name: 'Concrete Mix',
        category: 'concrete',
        quantity: 800,
        unit: 'bags',
        unitCost: 10,
        supplier: {
          name: 'BuildMart Supplies',
          contact: '+1-555-0200',
          email: 'orders@buildmart.com'
        },
        deliveryStatus: 'delivered',
        deliveryDate: new Date('2025-03-12'),
      },
      {
        projectId: projects[2]._id,
        name: 'Medical Grade Flooring',
        category: 'other',
        quantity: 3000,
        unit: 'sqft',
        unitCost: 45,
        supplier: {
          name: 'MedFloor Solutions',
          contact: '+1-555-0204',
          email: 'orders@medfloor.com'
        },
        deliveryStatus: 'ordered',
      },
    ]);

    console.log('Created materials...');

    // Create Labor Entries
    const labor = await Labor.create([
      {
        projectId: projects[0]._id,
        worker: {
          name: 'Carlos Martinez',
          role: 'Foreman',
          phone: '+1-555-0301',
          employeeId: 'EMP-001',
        },
        date: new Date('2025-07-01'),
        checkIn: new Date('2025-07-01T07:00:00'),
        checkOut: new Date('2025-07-01T17:00:00'),
        hourlyRate: 45,
        overtimeHours: 2,
        overtimeRate: 67.50,
        notes: 'Supervised steel beam installation on floor 6',
      },
      {
        projectId: projects[0]._id,
        worker: {
          name: 'James Wilson',
          role: 'Welder',
          phone: '+1-555-0302',
          employeeId: 'EMP-002',
        },
        date: new Date('2025-07-01'),
        checkIn: new Date('2025-07-01T07:00:00'),
        checkOut: new Date('2025-07-01T17:00:00'),
        hourlyRate: 35,
        notes: 'Welded structural steel connections',
      },
      {
        projectId: projects[0]._id,
        worker: {
          name: 'Robert Johnson',
          role: 'Electrician',
          phone: '+1-555-0303',
          employeeId: 'EMP-003',
        },
        date: new Date('2025-07-01'),
        checkIn: new Date('2025-07-01T07:00:00'),
        checkOut: new Date('2025-07-01T15:00:00'),
        hourlyRate: 38,
        notes: 'Installed conduit on floors 4-5',
      },
      {
        projectId: projects[0]._id,
        worker: {
          name: 'Michael Brown',
          role: 'Laborer',
          phone: '+1-555-0304',
          employeeId: 'EMP-004',
        },
        date: new Date('2025-07-02'),
        checkIn: new Date('2025-07-02T07:00:00'),
        checkOut: new Date('2025-07-02T16:00:00'),
        hourlyRate: 22,
        overtimeHours: 1,
        overtimeRate: 33,
        notes: 'Material handling and site cleanup',
      },
      {
        projectId: projects[0]._id,
        worker: {
          name: 'David Lee',
          role: 'Carpenter',
          phone: '+1-555-0305',
          employeeId: 'EMP-005',
        },
        date: new Date('2025-07-02'),
        checkIn: new Date('2025-07-02T07:00:00'),
        checkOut: new Date('2025-07-02T17:00:00'),
        hourlyRate: 32,
        overtimeHours: 1,
        overtimeRate: 48,
        notes: 'Built formwork for concrete pouring',
      },
      {
        projectId: projects[1]._id,
        worker: {
          name: 'Steve Clark',
          role: 'Foreman',
          phone: '+1-555-0306',
          employeeId: 'EMP-006',
        },
        date: new Date('2025-03-10'),
        checkIn: new Date('2025-03-10T07:00:00'),
        checkOut: new Date('2025-03-10T15:00:00'),
        hourlyRate: 42,
        notes: 'Managed site preparation activities',
      },
      {
        projectId: projects[2]._id,
        worker: {
          name: 'Tom Harris',
          role: 'Electrician',
          phone: '+1-555-0307',
          employeeId: 'EMP-007',
        },
        date: new Date('2025-07-01'),
        checkIn: new Date('2025-07-01T07:00:00'),
        checkOut: new Date('2025-07-01T17:00:00'),
        hourlyRate: 40,
        overtimeHours: 2,
        overtimeRate: 60,
        notes: 'Installed medical equipment wiring',
      },
    ]);

    console.log('Created labor entries...');

    // Create Daily Reports
    const reports = await Report.create([
      {
        projectId: projects[0]._id,
        reportedBy: users[1]._id,
        date: new Date('2025-07-01'),
        title: 'Daily Progress Report - July 1',
        summary: 'Steel beam installation progress and safety compliance',
        weather: {
          condition: 'sunny',
          temperature: 82,
          impactOnWork: 'No weather delays',
        },
        workCompleted: [
          'Completed installation of steel beams on floor 6',
          'Started welding connections',
          'Electrical team installed conduit on floors 4-5',
        ],
        workPlanned: [
          'Continue welding operations',
          'Begin concrete pouring for floor 7',
        ],
        issues: [
          {
            description: 'Minor delay due to late steel delivery',
            severity: 'low',
            resolved: true,
          },
        ],
        laborCount: 25,
        safetyIncidents: [],
      },
      {
        projectId: projects[0]._id,
        reportedBy: users[1]._id,
        date: new Date('2025-07-02'),
        title: 'Daily Progress Report - July 2',
        summary: 'Welding progress and formwork preparation',
        weather: {
          condition: 'cloudy',
          temperature: 78,
          impactOnWork: 'Good working conditions',
        },
        workCompleted: [
          'Welding 80% complete on floor 6',
          'Concrete formwork prepared for floor 7',
        ],
        workPlanned: [
          'Complete all welding',
          'Pour concrete for floor 7',
        ],
        issues: [],
        laborCount: 28,
        safetyIncidents: [],
      },
      {
        projectId: projects[1]._id,
        reportedBy: users[1]._id,
        date: new Date('2025-03-10'),
        title: 'Site Preparation Report',
        summary: 'Initial site preparation and boundary marking',
        weather: {
          condition: 'sunny',
          temperature: 65,
          impactOnWork: 'Perfect conditions for outdoor work',
        },
        workCompleted: [
          'Site survey completed',
          'Boundary markers installed',
          'Temporary fencing setup',
        ],
        workPlanned: [
          'Begin excavation for foundation',
        ],
        issues: [],
        laborCount: 12,
        safetyIncidents: [],
      },
      {
        projectId: projects[2]._id,
        reportedBy: users[1]._id,
        date: new Date('2025-07-01'),
        title: 'Hospital Extension Progress',
        summary: 'HVAC installation and electrical work progress',
        weather: {
          condition: 'sunny',
          temperature: 85,
          impactOnWork: 'Indoor work unaffected',
        },
        workCompleted: [
          'HVAC ducting 60% complete in east wing',
          'Electrical rough-in continued',
        ],
        workPlanned: [
          'Complete HVAC installation by end of week',
          'Start plumbing rough-in',
        ],
        issues: [
          {
            description: 'Need additional HVAC diffusers ordered',
            severity: 'medium',
            resolved: false,
          },
        ],
        laborCount: 35,
        safetyIncidents: [],
      },
    ]);

    console.log('Created reports...');

    // Create Photo entries
    const photos = await Photo.create([
      {
        projectId: projects[0]._id,
        milestoneId: milestones[1]._id,
        reportId: reports[0]._id,
        uploadedBy: users[1]._id,
        url: 'https://images.unsplash.com/photo-1504307651254-35680f276067?w=800',
        caption: 'Steel beam installation on floor 6 - north side',
        tags: ['steel', 'progress', 'floor-6'],
        isDronePhoto: false,
      },
      {
        projectId: projects[0]._id,
        uploadedBy: users[1]._id,
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        caption: 'Aerial view of construction site - July 2025',
        tags: ['aerial', 'site-overview'],
        isDronePhoto: true,
        droneData: {
          altitude: 150,
          flightId: 'DRN-2025-0701-001',
        },
      },
      {
        projectId: projects[0]._id,
        reportId: reports[0]._id,
        uploadedBy: users[1]._id,
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        caption: 'Steel delivery delay - incomplete shipment',
        tags: ['issue', 'delivery'],
        isDronePhoto: false,
      },
      {
        projectId: projects[0]._id,
        milestoneId: milestones[0]._id,
        uploadedBy: users[1]._id,
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        caption: 'Foundation work completed - milestone achieved',
        tags: ['foundation', 'milestone', 'completed'],
        isDronePhoto: false,
      },
      {
        projectId: projects[1]._id,
        milestoneId: milestones[3]._id,
        reportId: reports[2]._id,
        uploadedBy: users[1]._id,
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
        caption: 'Site preparation and boundary marking',
        tags: ['site-prep', 'boundary'],
        isDronePhoto: false,
      },
      {
        projectId: projects[2]._id,
        reportId: reports[3]._id,
        uploadedBy: users[1]._id,
        url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        caption: 'HVAC ducting installation in progress',
        tags: ['hvac', 'installation'],
        isDronePhoto: false,
      },
    ]);

    console.log('Created photos...');

    // Create Budget entries
    const budgets = await Budget.create([
      {
        projectId: projects[0]._id,
        categories: [
          { name: 'Materials', estimated: 1500000, actual: 675000 },
          { name: 'Labor', estimated: 1200000, actual: 540000 },
          { name: 'Equipment', estimated: 500000, actual: 225000 },
          { name: 'Permits', estimated: 150000, actual: 150000 },
          { name: 'Contingency', estimated: 250000, actual: 60000 },
          { name: 'Professional Fees', estimated: 400000, actual: 300000 },
          { name: 'Utilities', estimated: 100000, actual: 50000 },
          { name: 'Insurance', estimated: 200000, actual: 100000 },
        ],
        totalEstimated: 5000000,
        totalActual: 2250000,
        lastUpdated: new Date(),
      },
      {
        projectId: projects[1]._id,
        categories: [
          { name: 'Materials', estimated: 2500000, actual: 375000 },
          { name: 'Labor', estimated: 2000000, actual: 320000 },
          { name: 'Equipment', estimated: 800000, actual: 125000 },
          { name: 'Permits', estimated: 200000, actual: 200000 },
          { name: 'Contingency', estimated: 500000, actual: 0 },
          { name: 'Professional Fees', estimated: 600000, actual: 180000 },
          { name: 'Utilities', estimated: 150000, actual: 0 },
          { name: 'Insurance', estimated: 250000, actual: 0 },
        ],
        totalEstimated: 8000000,
        totalActual: 1200000,
        lastUpdated: new Date(),
      },
      {
        projectId: projects[2]._id,
        categories: [
          { name: 'Materials', estimated: 3500000, actual: 2380000 },
          { name: 'Labor', estimated: 3000000, actual: 2040000 },
          { name: 'Equipment', estimated: 1500000, actual: 1020000 },
          { name: 'Permits', estimated: 400000, actual: 400000 },
          { name: 'Medical Equipment', estimated: 2000000, actual: 1800000 },
          { name: 'Contingency', estimated: 800000, actual: 120000 },
          { name: 'Professional Fees', estimated: 500000, actual: 300000 },
          { name: 'Utilities', estimated: 200000, actual: 100000 },
          { name: 'Insurance', estimated: 300000, actual: 0 },
        ],
        totalEstimated: 12200000,
        totalActual: 8160000,
        lastUpdated: new Date(),
      },
    ]);

    console.log('Created budgets...');

    // Create Notifications (using valid types: milestone-approved, milestone-rejected, task-assigned, report-submitted, material-delivered, weather-alert, budget-update)
    const notifications = await Notification.create([
      {
        recipientId: users[1]._id,
        type: 'task-assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned to order concrete for floor 7',
        relatedProject: projects[0]._id,
        read: false,
      },
      {
        recipientId: users[2]._id,
        type: 'milestone-approved',
        title: 'Milestone Submission Pending',
        message: 'Milestone "Structural Steelwork" is ready for your review',
        relatedProject: projects[0]._id,
        relatedMilestone: milestones[1]._id,
        read: false,
      },
      {
        recipientId: users[0]._id,
        type: 'report-submitted',
        title: 'Safety Report',
        message: 'Weekly safety report submitted - No incidents reported',
        read: true,
      },
      {
        recipientId: users[3]._id,
        type: 'budget-update',
        title: 'Project Update',
        message: 'Downtown Office Complex is now 45% complete',
        relatedProject: projects[0]._id,
        read: false,
      },
      {
        recipientId: users[1]._id,
        type: 'material-delivered',
        title: 'Material Delivery',
        message: 'Structural Steel Beam order is in transit',
        relatedProject: projects[0]._id,
        read: false,
      },
    ]);

    console.log('Created notifications...');

    console.log('\n✅ Seed data created successfully!\n');
    
    return {
      users,
      projects,
      milestones,
      tasks,
      materials,
      labor,
      reports,
      photos,
      budgets,
      notifications,
    };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = seedData;
