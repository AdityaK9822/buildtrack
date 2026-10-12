// Try different MongoDB connection formats
require('dotenv').config();
const { MongoClient } = require('mongodb');

const tests = [
  {
    name: 'SRV Connection (DNS SRV record)',
    uri: process.env.MONGODB_URI
  },
  {
    name: 'Direct Connection (port 27017)',
    uri: 'mongodb://AdityaK9822:Aditi9822@buildtrack-shard-00-00.pz6f33q.mongodb.net:27017,buildtrack-shard-00-01.pz6f33q.mongodb.net:27017,buildtrack-shard-00-02.pz6f33q.mongodb.net:27017/?ssl=true&replicaSet=atlas-pz6f33q-shard-0&authSource=admin&retryWrites=true&w=majority'
  }
];

async function testConnection(testConfig) {
  console.log(`\n========================================`);
  console.log(`Testing: ${testConfig.name}`);
  console.log(`========================================`);
  
  const client = new MongoClient(testConfig.uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ SUCCESS! Connected to MongoDB');
    
    const db = client.db();
    console.log('Database:', db.databaseName || 'default');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'No collections yet');
    
    await client.close();
    return true;
  } catch (error) {
    console.log('❌ Failed');
    console.log('Error:', error.message);
    await client.close();
    return false;
  }
}

(async () => {
  console.log('MongoDB Connection Test');
  console.log('Testing multiple connection formats...\n');
  
  for (const test of tests) {
    const success = await testConnection(test);
    if (success) {
      console.log('\n🎉 Working connection found!');
      process.exit(0);
    }
  }
  
  console.log('\n========================================');
  console.log('All connection attempts failed');
  console.log('========================================');
  console.log('\nPossible issues:');
  console.log('1. Cluster name might be incorrect');
  console.log('2. IP address not whitelisted in MongoDB Atlas');
  console.log('3. Database user "AdityaK9822" might not exist');
  console.log('4. Password "Aditi9822" might be incorrect');
  console.log('5. Network connectivity issue');
  console.log('\nRecommended actions:');
  console.log('1. Go to MongoDB Atlas > Network Access > Add IP: 0.0.0.0/0');
  console.log('2. Go to MongoDB Atlas > Database Access > Check user exists');
  console.log('3. Get correct connection string from Atlas > Connect button');
  console.log('4. Try connecting from MongoDB Compass to verify credentials');
  
  process.exit(1);
})();
