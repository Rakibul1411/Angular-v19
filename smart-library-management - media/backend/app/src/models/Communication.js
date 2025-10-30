import mongoose from 'mongoose';

const { Schema } = mongoose;

const CommunicationSchema = new Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true }, // e.g., /uploads/toofan.mp4
  description: { type: String, default: '' },
  type: { type: String, enum: ['AV', 'Communication'], default: 'AV' },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  campaign: { type: String, required: true },
  brand: { type: String, required: true },
  createdByName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Communication = mongoose.model('Communication', CommunicationSchema);
export default Communication;
