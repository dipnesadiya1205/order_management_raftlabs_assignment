import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  trackOrder,
} from '../controllers/orderController';
import { sseController } from '../controllers/sseController';
import {
  orderValidation,
  orderStatusValidation,
  idValidation,
  orderNumberValidation,
  paginationValidation,
} from '../middleware/validators';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/', orderValidation, createOrder);
router.get('/', paginationValidation, getAllOrders);
router.get('/:id', idValidation, getOrderById);
router.patch('/:id/status', idValidation, orderStatusValidation, updateOrderStatus);
router.get('/track/:orderNumber', orderNumberValidation, trackOrder);
router.get('/track/:orderNumber/stream', orderNumberValidation, asyncHandler(sseController.streamOrderUpdates));

export default router;
