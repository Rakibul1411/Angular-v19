// controllers/campaignController.js
import { campaignService } from '../services/index.js';

// CREATE Campaign
export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.createCampaign(req.body);
    
    if (!campaign) {
      return res.status(409).json({
        error: 'Campaign with this name already exists'
      });
    }

    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
};

// GET ALL Campaigns
export const getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await campaignService.getAllCampaigns();

    res.status(200).json({
      data: campaigns,
      count: campaigns.length
    });
  } catch (err) {
    next(err);
  }
};

// GET Campaign by ID
export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await campaignService.findCampaignById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.status(200).json(campaign);
  } catch (err) {
    next(err);
  }
};

// UPDATE Campaign
export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.updateCampaignById(req.params.id, req.body);

    if (campaign === null) {
      return res.status(409).json({
        error: 'Campaign name already exists for another campaign'
      });
    }

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.status(200).json(campaign);
  } catch (err) {
    next(err);
  }
};

// DELETE Campaign
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.deleteCampaignById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.status(200).json({
      message: 'Campaign deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
