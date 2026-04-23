import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Profile from './models/Profile.js';
import { connectDB } from './config/db.js';

dotenv.config({ override: true });

const seedAdmin = async () => {
  try {
    await connectDB();

    // Clear existing users and profiles so old hashed passwords don't conflict
    await User.deleteMany({});
    await Profile.deleteMany({});
    console.log('Cleared database of old hashed accounts...');

    const adminEmail = 'admin@finsight.com';
    
    const admin = await User.create({
      username: 'SystemAdmin',
      email: adminEmail,
      password: 'adminpassword123',
      role: 'Admin',
    });

    await Profile.create({
      user: admin._id,
      profileName: 'Admin Default',
      isDefault: true,
    });

    console.log(`Admin user created successfully! (NO HASHING)`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: adminpassword123`);
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
