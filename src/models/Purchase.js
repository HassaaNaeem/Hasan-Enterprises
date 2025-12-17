import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
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
  },
  fatherName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
