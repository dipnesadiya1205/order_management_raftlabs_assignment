import { Request, Response } from 'express';
import { OrderRepository } from '../repositories/OrderRepository';
import { sseConnectionManager } from '../services/SSEConnectionManager';
import { BadRequestError, NotFoundError } from '../utils/AppError';
import logger from '../utils/logger';

export class SSEController {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  streamOrderUpdates = async (req: Request, res: Response): Promise<void> => {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      throw new BadRequestError('Order number is required');
    }

    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundError('Order');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders();

    const initialData = JSON.stringify({
      _id: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      customer: order.customer,
      totalAmount: order.totalAmount,
      status: order.status,
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });

    res.write(`event: order-update\n`);
    res.write(`data: ${initialData}\n\n`);

    sseConnectionManager.addConnection(orderNumber, res);

    logger.info(`SSE stream established for order ${orderNumber}`);

    req.on('close', () => {
      logger.info(`SSE stream closed for order ${orderNumber}`);
    });
  };
}

export const sseController = new SSEController();
