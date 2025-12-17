import Plot from '../models/Plot.js';
import PlotDetails from '../models/PlotDetails.js';
import Purchase from '../models/Purchase.js';
import ServiceProvider from '../models/ServiceProvider.js';
import PaymentSchedule from '../models/PaymentSchedule.js';
import PaymentInstallment from '../models/PaymentInstallment.js';
import FailedPayment from '../models/FailedPayment.js';
import { calculatePaymentProgress } from '../utils/milestoneService.js';

export const getPurchaserDashboard = async (req, res) => {
  try {
    const purchaserId = req.user.purchaserId;
    
    if (!purchaserId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const purchaser = await Purchase.findById(purchaserId);
    const plots = await Plot.find({ purchaserId });
    
    const plotsWithProgress = await Promise.all(
      plots.map(async (plot) => {
        const details = await PlotDetails.findOne({ plotId: plot._id });
        const progress = await calculatePaymentProgress(plot._id);
        const schedules = await PaymentSchedule.find({ plotId: plot._id });
        
        const pendingPayments = await PaymentInstallment.find({
          paymentScheduleId: { $in: schedules.map(s => s._id) },
          status: { $in: ['pending', 'partial', 'overdue'] }
        });

        return {
          plot,
          details,
          progress,
          pendingPaymentsCount: pendingPayments.length
        };
      })
    );

    const totalPending = plotsWithProgress.reduce((sum, p) => sum + p.pendingPaymentsCount, 0);

    res.json({
      success: true,
      data: {
        purchaser,
        plotsCount: plots.length,
        totalPendingPayments: totalPending,
        plots: plotsWithProgress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getServiceProviderDashboard = async (req, res) => {
  try {
    const serviceProviderId = req.user.serviceProviderId;
    
    if (!serviceProviderId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const serviceProvider = await ServiceProvider.findById(serviceProviderId);
    const assignedPlots = await Plot.find({ serviceProviderId })
      .populate('purchaserId', 'name cnicNumber phoneNumber');

    const pendingDocuments = await PlotDetails.find({ status: 'uploaded' })
      .populate('plotId');

    const overduePayments = await PaymentSchedule.find({ status: 'overdue' })
      .populate('plotId', 'plotNumber purchaserId');

    const activeCases = await FailedPayment.find({ 
      status: { $in: ['recorded', 'filed', 'in_progress'] } 
    }).populate('plotId', 'plotNumber');

    const today = new Date();
    const readyToFile = await FailedPayment.find({
      status: 'recorded',
      gracePeriodEnd: { $lt: today }
    });

    res.json({
      success: true,
      data: {
        serviceProvider,
        assignedPlotsCount: assignedPlots.length,
        pendingDocumentsCount: pendingDocuments.length,
        overduePaymentsCount: overduePayments.length,
        activeCasesCount: activeCases.length,
        readyToFileCount: readyToFile.length,
        assignedPlots,
        pendingDocuments,
        overduePayments,
        activeCases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const totalPlots = await Plot.countDocuments();
    const availablePlots = await Plot.countDocuments({ status: 'available' });
    const reservedPlots = await Plot.countDocuments({ status: 'reserved' });
    const soldPlots = await Plot.countDocuments({ status: 'sold' });
    const onHoldPlots = await Plot.countDocuments({ status: 'on_hold' });

    const totalPurchasers = await Purchase.countDocuments();
    const totalServiceProviders = await ServiceProvider.countDocuments();

    const totalCases = await FailedPayment.countDocuments();
    const activeCases = await FailedPayment.countDocuments({ 
      status: { $in: ['recorded', 'filed', 'in_progress'] } 
    });

    const overduePayments = await PaymentSchedule.countDocuments({ status: 'overdue' });

    const recentPlots = await Plot.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('purchaserId', 'name');

    const recentCases = await FailedPayment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('plotId', 'plotNumber');

    res.json({
      success: true,
      data: {
        overview: {
          totalPlots,
          availablePlots,
          reservedPlots,
          soldPlots,
          onHoldPlots,
          totalPurchasers,
          totalServiceProviders,
          totalCases,
          activeCases,
          overduePayments
        },
        recentPlots,
        recentCases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const plots = await Plot.find(filter)
      .select('plotNumber status createdAt updatedAt purchaserId')
      .sort({ updatedAt: -1 })
      .limit(100);

    const payments = await PaymentInstallment.find({
      ...filter,
      status: 'paid'
    })
      .select('amount amountPaid dateOfPayment status')
      .sort({ dateOfPayment: -1 })
      .limit(100);

    const cases = await FailedPayment.find(filter)
      .select('caseId status amount courtDate createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        plots,
        payments,
        cases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let reportData = {};

    if (reportType === 'payments' || !reportType) {
      const paidInstallments = await PaymentInstallment.find({
        status: 'paid',
        ...(startDate || endDate ? { dateOfPayment: dateFilter } : {})
      });

      const totalCollected = paidInstallments.reduce((sum, inst) => {
        return sum + parseFloat(inst.amountPaid?.toString() || '0');
      }, 0);

      reportData.payments = {
        totalTransactions: paidInstallments.length,
        totalCollected
      };
    }

    if (reportType === 'plots' || !reportType) {
      const plotsByStatus = await Plot.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      reportData.plots = plotsByStatus;
    }

    if (reportType === 'cases' || !reportType) {
      const casesByStatus = await FailedPayment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      reportData.cases = casesByStatus;
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
