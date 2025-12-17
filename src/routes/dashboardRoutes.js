import express from 'express';
import {
  getPurchaserDashboard,
  getServiceProviderDashboard,
  getAdminDashboard,
  getAuditLogs,
  getReports
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/purchaser', protect, authorize('purchaser'), getPurchaserDashboard);
router.get('/service-provider', protect, authorize('service_provider'), getServiceProviderDashboard);
router.get('/admin', protect, authorize('admin', 'legal'), getAdminDashboard);

router.get('/audit-logs', protect, authorize('admin', 'legal'), getAuditLogs);
router.get('/reports', protect, authorize('admin', 'legal', 'service_provider'), getReports);

export default router;
