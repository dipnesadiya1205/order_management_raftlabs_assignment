import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { MenuCategory } from '../models/MenuItem';
import { OrderStatus } from '../models/Order';
import { ValidationError } from '../utils/AppError';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  next();
};

export const menuItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(MenuCategory))
    .withMessage('Invalid category'),
  body('imageUrl')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  validate,
];

export const menuItemUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(Object.values(MenuCategory))
    .withMessage('Invalid category'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  validate,
];

export const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('customer.name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('customer.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-()]{10,15}$/)
    .withMessage('Invalid phone number format'),
  body('customer.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 300 })
    .withMessage('Address must be between 10 and 300 characters'),
  validate,
];

export const orderStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(OrderStatus))
    .withMessage('Invalid order status'),
  validate,
];

export const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate,
];

export const orderNumberValidation = [
  param('orderNumber')
    .notEmpty()
    .withMessage('Order number is required')
    .matches(/^ORD\d{8}\d{4}$/)
    .withMessage('Invalid order number format'),
  validate,
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];
