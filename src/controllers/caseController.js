import FailedPayment from '../models/FailedPayment.js';
import Plot from '../models/Plot.js';
import PaymentSchedule from '../models/PaymentSchedule.js';
import PaymentInstallment from '../models/PaymentInstallment.js';
import { v4 as uuidv4 } from 'uuid';

export const recordFailedPayment = async (req, res) => {
  try {
    const { plotId, amount, description, gracePeriodDays = 30 } = req.body;

    const plot = await Plot.findById(plotId);
    if (!plot) {
      return res.status(404).json({ success: false, message: 'Plot not found' });
    }

    const existingFailed = await FailedPayment.findOne({ 
      plotId, 
      status: { $in: ['recorded', 'filed', 'in_progress'] } 
    });
    
    if (existingFailed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Active failed payment already exists for this plot' 
      });
    }

    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);

    const failedPayment = await FailedPayment.create({
      amount,
      date: new Date(),
      status: 'recorded',
      plotId,
      description,
      gracePeriodEnd,
      filedBy: req.user.serviceProviderId
    });

    res.status(201).json({
      success: true,
      message: 'Failed payment recorded successfully',
      data: failedPayment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fileCase = async (req, res) => {
  try {
    const { failedPaymentId } = req.params;
    const { courtDate, chargeCode, amountCharged, description } = req.body;

    const failedPayment = await FailedPayment.findById(failedPaymentId);
    if (!failedPayment) {
      return res.status(404).json({ success: false, message: 'Failed payment not found' });
    }

    if (failedPayment.status === 'filed' || failedPayment.caseId) {
      return res.status(400).json({ success: false, message: 'Case already filed for this payment' });
    }

    const today = new Date();
    if (failedPayment.gracePeriodEnd && today < failedPayment.gracePeriodEnd) {
      return res.status(400).json({ 
        success: false, 
        message: `Grace period not yet ended. Case can be filed after ${failedPayment.gracePeriodEnd.toDateString()}` 
      });
    }

    failedPayment.caseId = `CASE-${uuidv4().substring(0, 8).toUpperCase()}`;
    failedPayment.courtDate = courtDate;
    failedPayment.chargeCode = chargeCode;
    failedPayment.amountCharged = amountCharged;
    failedPayment.description = description || failedPayment.description;
    failedPayment.status = 'filed';
    failedPayment.filedBy = req.user.serviceProviderId;

    await failedPayment.save();

    const plot = await Plot.findById(failedPayment.plotId);
    plot.status = 'on_hold';
    await plot.save();

    res.json({
      success: true,
      message: 'Case filed successfully',
      data: {
        failedPayment,
        plot
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCases = async (req, res) => {
  try {
    const { status, plotId } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (plotId) filter.plotId = plotId;

    const cases = await FailedPayment.find(filter)
      .populate('plotId', 'plotNumber area location purchaserId')
      .populate('filedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: cases.length, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const failedPayment = await FailedPayment.findById(req.params.id)
      .populate({
        path: 'plotId',
        populate: { path: 'purchaserId' }
      })
      .populate('filedBy');

    if (!failedPayment) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.json({ success: true, data: failedPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCaseStatus = async (req, res) => {
  try {
    const { status, description } = req.body;

    const failedPayment = await FailedPayment.findById(req.params.id);
    if (!failedPayment) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    failedPayment.status = status;
    if (description) failedPayment.description = description;
    await failedPayment.save();

    if (status === 'resolved' || status === 'closed') {
      const plot = await Plot.findById(failedPayment.plotId);
      if (plot && plot.status === 'on_hold') {
        plot.status = status === 'resolved' ? 'sold' : 'available';
        await plot.save();
      }
    }

    res.json({
      success: true,
      message: 'Case status updated successfully',
      data: failedPayment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFailedPaymentsByGracePeriod = async (req, res) => {
  try {
    const today = new Date();
    
    const expiredGracePeriod = await FailedPayment.find({
      status: 'recorded',
      gracePeriodEnd: { $lt: today }
    }).populate('plotId', 'plotNumber purchaserId');

    res.json({
      success: true,
      message: 'Failed payments with expired grace period',
      count: expiredGracePeriod.length,
      data: expiredGracePeriod
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
