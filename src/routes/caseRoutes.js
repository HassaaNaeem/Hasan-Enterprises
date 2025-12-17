import express from 'express';
import {
  recordFailedPayment,
  fileCase,
  getCases,
  getCaseById,
  updateCaseStatus,
  getFailedPaymentsByGracePeriod
} from '../controllers/caseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('service_provider', 'admin', 'legal'), getCases);
router.get('/grace-period-expired', protect, authorize('service_provider', 'admin'), getFailedPaymentsByGracePeriod);
router.get('/:id', protect, authorize('service_provider', 'admin', 'legal'), getCaseById);

router.post('/failed-payment', protect, authorize('service_provider'), recordFailedPayment);
router.post('/:failedPaymentId/file', protect, authorize('service_provider'), fileCase);
router.put('/:id/status', protect, authorize('service_provider', 'admin', 'legal'), updateCaseStatus);

export default router;
