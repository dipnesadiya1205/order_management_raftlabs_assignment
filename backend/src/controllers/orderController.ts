import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { asyncHandler } from '../utils/asyncHandler';
import { OrderStatus } from '../models/Order';

const orderService = new OrderService();

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body);
  
  res.status(201).json({
    success: true,
    data: order,
    message: 'Order placed successfully',
  });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: order,
  });
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, customerPhone, startDate, endDate, page, limit } = req.query;
  
  const filters: Record<string, unknown> = {};
  
  if (status) {
    filters.status = status as OrderStatus;
  }
  
  if (customerPhone) {
    filters.customerPhone = customerPhone as string;
  }
  
  if (startDate) {
    filters.startDate = new Date(startDate as string);
  }
  
  if (endDate) {
    filters.endDate = new Date(endDate as string);
  }
  
  const pagination = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
  };
  
  const result = await orderService.getAllOrders(filters, pagination);
  
  res.status(200).json({
    success: true,
    data: result.orders,
    pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit: pagination.limit,
    },
  });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  
  res.status(200).json({
    success: true,
    data: order,
    message: 'Order status updated successfully',
  });
});

export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.trackOrder(req.params.orderNumber);
  
  res.status(200).json({
    success: true,
    data: order,
  });
});
