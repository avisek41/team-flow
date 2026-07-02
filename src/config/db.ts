const mongoose = require('mongoose');
import config from "./config";
 export const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error (App will continue running without MongoDB):', error);
        // process.exit(1); // Commented out to allow testing Supabase endpoints without Mongo
    }
 }