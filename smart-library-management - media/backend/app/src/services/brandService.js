// services/brandService.js
import mongoose from 'mongoose';
import Brand from '../models/Brand.js';

export const validateBrandId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


export const createBrand = async (data) => {
  try {
    const existingBrand = await Brand.findOne({ name: data.name });
    if (existingBrand) {
      return null;
    }

    const brand = new Brand({
      name: data.name
    });

    const savedBrand = await brand.save();
    return savedBrand;
  } catch (err) {
    throw err;
  }
};


export const getAllBrands = async () => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    return brands;
  } catch (err) {
    throw err;
  }
};


export const findBrandById = async (id) => {
  try {
    if (!validateBrandId(id)) {
      return undefined;
    }
    const brand = await Brand.findById(id);
    return brand;
  } catch (err) {
    throw err;
  }
};


export const findBrandByName = async (name) => {
  try {
    const brand = await Brand.findOne({ name });
    return brand;
  } catch (err) {
    throw err;
  }
};


export const updateBrandById = async (id, data) => {
  try {
    if (!validateBrandId(id)) {
      return undefined;
    }

    if (data.name) {
      const existingBrand = await Brand.findOne({ 
        name: data.name,
        _id: { $ne: id }
      });
      if (existingBrand) {
        return null;
      }
    }

    const brand = await Brand.findByIdAndUpdate(
      id,
      { name: data.name },
      { new: true, runValidators: true }
    );

    return brand;
  } catch (err) {
    throw err;
  }
};


export const deleteBrandById = async (id) => {
  try {
    if (!validateBrandId(id)) {
      return undefined;
    }

    const brand = await Brand.findByIdAndDelete(id);
    return brand;
  } catch (err) {
    throw err;
  }
};

