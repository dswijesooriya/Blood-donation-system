// Import mongoose to interact with MongoDB
const mongoose = require('mongoose');

// Async function to connect the app to the database
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI stored in environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Log a success message with the connected host name
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error message if the connection fails
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process with a failure code to stop the app
    process.exit(1);
  }
};

// Export the function so it can be used in other files
module.exports = connectDB;