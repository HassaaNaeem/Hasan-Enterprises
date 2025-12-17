import mongoose from 'mongoose';

const failedPaymentSchema = new mongoose.Schema({
  amount: {
    type: mongoose.Types.Decimal128,
    get: (v) => v ? parseFloat(v.toString()) : 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['recorded', 'filed', 'in_progress', 'resolved', 'closed'],
    default: 'recorded'
  },
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: true
  },
  caseId: {
    type: String
  },
  courtDate: {
    type: Date
  },
  chargeCode: {
    type: String
  },
  amountCharged: {
    type: mongoose.Types.Decimal128,
    get: (v) => v ? parseFloat(v.toString()) : 0
  },
  description: {
    type: String
  },
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  gracePeriodEnd: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const FailedPayment = mongoose.model('FailedPayment', failedPaymentSchema);
export default FailedPayment;
