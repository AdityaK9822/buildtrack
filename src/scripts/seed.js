require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('../utils/seedData');

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...\n');

    await seedData();

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest User Credentials:');
    console.log('  Admin: admin@buildtrack.com / password123');
    console.log('  Contractor: contractor@buildtrack.com / password123');
    console.log('  Architect: architect@buildtrack.com / password123');
    console.log('  Client: client@buildtrack.com / password123');
    console.log('  Worker: worker@buildtrack.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();
