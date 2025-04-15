const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Check if:');
      console.error('1. MongoDB is installed and running');
      console.error('2. Connection string in .env file is correct');
      console.error('3. Network allows connection to MongoDB');
    }
    
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB; 