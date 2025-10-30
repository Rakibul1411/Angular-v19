import mongoose from 'mongoose';

const { Schema } = mongoose;

const CampaignSchema = new Schema({
  name: { type: String, required: true, unique: true }
});

const Campaign = mongoose.model('Campaign', CampaignSchema);
export default Campaign;