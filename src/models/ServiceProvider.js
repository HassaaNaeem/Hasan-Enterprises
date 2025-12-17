import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cnicNumber: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  balance: {
    type: mongoose.Types.Decimal128,
    default: 0,
    get: (v) => v ? parseFloat(v.toString()) : 0
  },
  imageUri: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);
export default ServiceProvider;
