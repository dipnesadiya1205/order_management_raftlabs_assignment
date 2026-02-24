import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  trackOrder,
} from '../controllers/orderController';
import {
  orderValidation,
  orderStatusValidation,
  idValidation,
  orderNumberValidation,
  paginationValidation,
} from '../middleware/validators';

const router = Router();

router.post('/', orderValidation, createOrder);
router.get('/', paginationValidation, getAllOrders);
router.get('/:id', idValidation, getOrderById);
router.patch('/:id/status', idValidation, orderStatusValidation, updateOrderStatus);
router.get('/track/:orderNumber', orderNumberValidation, trackOrder);

export default router;
