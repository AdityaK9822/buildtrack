const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    // Check if password placeholder exists
    if (mongoUri.includes('<db_password>')) {
      console.error('❌ ERROR: MongoDB password not set in .env file');
      console.error('Please replace <db_password> with your actual MongoDB Atlas password');
      console.error('Example: mongodb+srv://username:yourpassword@cluster.mongodb.net/');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.error('\n🔐 Authentication failed. Please check:');
      console.error('   1. Your MongoDB Atlas username and password are correct');
      console.error('   2. The database user has proper permissions');
      console.error('   3. Your IP address is whitelisted in MongoDB Atlas');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
