import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dbService } from '../services/dbService.js';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGO_URI;
    if (!connString) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(connString);
    const dbName = mongoose.connection.db?.databaseName || 'campusPlacement';
    console.log(`MongoDB Connected successfully to database: "${dbName}"`);
    
    // Perform initial sync of users and default data to MongoDB Atlas so collections are created immediately
    dbService.syncWithMongo().catch((err) => {
      console.warn('Initial MongoDB Atlas data sync warning:', err);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
