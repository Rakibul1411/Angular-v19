import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Communication from '../models/Communication.js';
import { brandServiceExternal, campaignServiceExternal } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export const validateCommunicationId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


const getUploadPath = () => {
  const uploadPath = process.env.UPLOAD_PATH || './uploads/av-communications';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};


const validateRefs = async (campaignName, brandName) => {
  const [campaign, brand] = await Promise.all([
    campaignServiceExternal.findCampaignByName(campaignName),
    brandServiceExternal.findBrandByName(brandName)
  ]);

  if (!campaign || !brand) {
    return null;
  }

  return { campaign: campaignName, brand: brandName };
};


export const createCommunication = async (file, body) => {
  if (!file) return null;

  const refs = await validateRefs(body.campaign, body.brand);
  if (!refs) return null;

  const comm = new Communication({
    fileName: file.originalname,
    filePath: `/uploads/av-communications/${file.filename}`,
    description: body.description ?? '',
    type: 'AV',
    mimeType: file.mimetype,
    fileSize: file.size,
    campaign: refs.campaign,
    brand: refs.brand,
    createdByName: body.createdByName
  });

  const saved = await comm.save();
  return saved;
};


export const getAllCommunications = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Communication.countDocuments();

  const data = await Communication.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};


export const findCommunicationById = async (id) => {
  return await Communication.findById(id);
};


export const updateCommunicationById = async (id, body, file) => {
  const comm = await Communication.findById(id);
  if (!comm) return null;

  if (body.description !== undefined) {
    comm.description = body.description;
  }

  if (body.campaign || body.brand) {
    const campaignName = body.campaign || comm.campaign;
    const brandName = body.brand || comm.brand;
    
    const refs = await validateRefs(campaignName, brandName);
    if (!refs) return null;

    comm.campaign = refs.campaign;
    comm.brand = refs.brand;
  }

  if (file) {
    const oldPath = path.join(__dirname, '..', comm.filePath);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    comm.fileName = file.originalname;
    comm.filePath = `/uploads/av-communications/${file.filename}`;
    comm.mimeType = file.mimetype;
    comm.fileSize = file.size;
  }

  comm.updatedAt = Date.now();
  await comm.save();

  return comm;
};


export const deleteCommunicationById = async (id) => {
  const comm = await Communication.findById(id);
  if (!comm) return null;

  const filePath = path.join(__dirname, '..', comm.filePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await Communication.deleteOne({ _id: id });
  return comm;
};


export const countTotalCommunications = async () => {
  return await Communication.countDocuments();
};