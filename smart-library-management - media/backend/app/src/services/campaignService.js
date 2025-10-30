import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';

export const validateCampaignId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createCampaign = async (data) => {
  try {
    const existingCampaign = await Campaign.findOne({ name: data.name });
    if (existingCampaign) {
      return null;
    }

    const campaign = new Campaign({
      name: data.name
    });

    const savedCampaign = await campaign.save();
    return savedCampaign;
  } catch (err) {
    throw err;
  }
};


export const getAllCampaigns = async () => {
  try {
    const campaigns = await Campaign.find().sort({ name: 1 });
    return campaigns;
  } catch (err) {
    throw err;
  }
};


export const findCampaignById = async (id) => {
  try {
    if (!validateCampaignId(id)) {
      return undefined;
    }
    const campaign = await Campaign.findById(id);
    return campaign;
  } catch (err) {
    throw err;
  }
};


export const findCampaignByName = async (name) => {
  try {
    const campaign = await Campaign.findOne({ name });
    return campaign;
  } catch (err) {
    throw err;
  }
};


export const updateCampaignById = async (id, data) => {
  try {
    if (!validateCampaignId(id)) {
      return undefined;
    }

    if (data.name) {
      const existingCampaign = await Campaign.findOne({ 
        name: data.name,
        _id: { $ne: id }
      });
      if (existingCampaign) {
        return null;
      }
    }

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { name: data.name },
      { new: true, runValidators: true }
    );

    return campaign;
  } catch (err) {
    throw err;
  }
};


export const deleteCampaignById = async (id) => {
  try {
    if (!validateCampaignId(id)) {
      return undefined;
    }

    const campaign = await Campaign.findByIdAndDelete(id);
    return campaign;
  } catch (err) {
    throw err;
  }
};

