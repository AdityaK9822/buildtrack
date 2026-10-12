const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set ✓' : 'Not set ✗');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✓ MongoDB connected successfully!');
    
    // Test creating a simple document
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await TestModel.create({ name: 'test' });
    console.log('✓ Database write test passed!');
    
    await TestModel.deleteMany({});
    console.log('✓ Database delete test passed!');
    
    await mongoose.connection.close();
    console.log('\n✓✓✓ All tests passed! Your setup is ready.');
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection error:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Make sure MongoDB is running locally, OR');
    console.log('2. Update MONGODB_URI in .env with MongoDB Atlas connection string');
    process.exit(1);
  }
};

testConnection();
