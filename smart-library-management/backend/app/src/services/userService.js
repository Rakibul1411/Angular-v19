// services/userService.js
import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export const validateUserIdInternal = (user_id) => {
  return mongoose.Types.ObjectId.isValid(user_id);
};

export const findUserById = async (id) => {
  return await User.findById(id);
};


export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};


export const countTotalUsers = async () => {
  return await User.countDocuments();
};


export const createUser = async (userData) => {
  console.log('Creating user with data:', userData);
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = new User({
    name: userData.name,
    email: userData.email,
    role: userData.role,
    password: hashedPassword,
  });

  return await user.save();
};


export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  return user;
};


export const updateUserById = async (id, userData) => {
  if (userData.email) {
    const existingUser = await findUserByEmail(userData.email);

    if (existingUser && existingUser._id.toString() !== id) {
      return null;
    }
  }

  const updateData = {
    ...userData,
    updatedAt: Date.now()
  };

  const updateOptions = {
    new: true,
    runValidators: true 
  };

  return await User.findByIdAndUpdate(id, updateData, updateOptions);
};


export const findUsersByRole = async (role) => {
  return await User.find({ role });
};


export const getAllUsers = async () => {
  return await User.find({});
};




