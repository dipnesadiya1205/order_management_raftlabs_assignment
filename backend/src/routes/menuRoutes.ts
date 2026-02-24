import { Router } from 'express';
import {
  createMenuItem,
  getMenuItemById,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController';
import {
  menuItemValidation,
  menuItemUpdateValidation,
  idValidation,
} from '../middleware/validators';

const router = Router();

router.post('/', menuItemValidation, createMenuItem);
router.get('/', getAllMenuItems);
router.get('/:id', idValidation, getMenuItemById);
router.put('/:id', idValidation, menuItemUpdateValidation, updateMenuItem);
router.delete('/:id', idValidation, deleteMenuItem);

export default router;
