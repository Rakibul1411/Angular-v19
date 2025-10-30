import { communicationService } from '../services/index.js';
import fs from 'fs';

export const createCommunication = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: 'File is required'
      });
    }

    const { campaign, brand, description } = req.body;

    if (!campaign || !brand) {
      return res.status(400).json({
        error: 'Campaign and brand are required'
      });
    }

    // Set createdByName from authenticated user
    if (!req.user || !req.user.name) {
      return res.status(401).json({
        error: 'User authentication information is missing'
      });
    }
    req.body.createdByName = req.user.name;

    const comm = await communicationService.createCommunication(file, req.body);

    if (!comm) {
      return res.status(400).json({
        error: 'Invalid campaign or brand name'
      });
    }

    res.status(201).json({
      message: 'Communication created successfully',
      data: comm
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
};

export const getAllCommunications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await communicationService.getAllCommunications(parseInt(page), parseInt(limit));

    res.status(200).json({
      message: 'Communications fetched successfully',
      data: result.data,
      count: result.data.length,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

export const getCommunicationById = async (req, res, next) => {
  try {
    const comm = await communicationService.findCommunicationById(req.params.id);

    if (!comm) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.status(200).json({
      message: 'Communication fetched successfully',
      data: comm
    });
  } catch (err) {
    next(err);
  }
};

export const updateCommunication = async (req, res, next) => {
  try {
    const comm = await communicationService.updateCommunicationById(req.params.id, req.body, req.file);

    if (!comm) {
      return res.status(404).json({ error: 'Communication not found or invalid campaign/brand' });
    }

    res.status(200).json({
      message: 'Communication updated successfully',
      data: comm
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
};

export const deleteCommunication = async (req, res, next) => {
  try {
    const result = await communicationService.deleteCommunicationById(req.params.id);

    if (!result) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.status(200).json({
      message: 'Communication deleted successfully',
      deletedId: req.params.id
    });
  } catch (err) {
    next(err);
  }
};