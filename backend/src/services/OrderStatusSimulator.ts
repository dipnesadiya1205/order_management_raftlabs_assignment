import { OrderRepository } from '../repositories/OrderRepository';
import { OrderStatus } from '../models/Order';
import { sseConnectionManager } from './SSEConnectionManager';
import logger from '../utils/logger';

export class OrderStatusSimulator {
  private orderRepository: OrderRepository;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly updateInterval: number;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.updateInterval = parseInt(process.env.ORDER_STATUS_UPDATE_INTERVAL || '30000');
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Order status simulator is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting order status simulator');

    this.intervalId = setInterval(() => {
      this.processOrders().catch((error) => {
        logger.error('Error processing orders in simulator:', error);
      });
    }, this.updateInterval);
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('Order status simulator stopped');
  }

  private async processOrders(): Promise<void> {
    try {
      const pendingOrders = await this.orderRepository.findPendingOrders();

      for (const order of pendingOrders) {
        const shouldUpdate = this.shouldUpdateOrder(order.updatedAt);
        
        if (shouldUpdate) {
          const nextStatus = this.getNextStatus(order.status);
          
          if (nextStatus) {
            await this.orderRepository.updateStatus(order._id.toString(), nextStatus);
            logger.info(
              `Order ${order.orderNumber} status updated from ${order.status} to ${nextStatus}`
            );

            const updatedOrder = await this.orderRepository.findByOrderNumber(order.orderNumber);
            if (updatedOrder) {
              sseConnectionManager.sendOrderUpdate(order.orderNumber, updatedOrder);
              logger.debug(`SSE update sent for order ${order.orderNumber}`);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error in processOrders:', error);
    }
  }

  private shouldUpdateOrder(lastUpdated: Date): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    const minUpdateTime = 30000;
    const maxUpdateTime = 60000;
    const randomThreshold = Math.random() * (maxUpdateTime - minUpdateTime) + minUpdateTime;

    return timeDiff >= randomThreshold;
  }

  private getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const statusProgression: Record<OrderStatus, OrderStatus | null> = {
      [OrderStatus.RECEIVED]: OrderStatus.PREPARING,
      [OrderStatus.PREPARING]: OrderStatus.OUT_FOR_DELIVERY,
      [OrderStatus.OUT_FOR_DELIVERY]: OrderStatus.DELIVERED,
      [OrderStatus.DELIVERED]: null,
      [OrderStatus.CANCELLED]: null,
    };

    return statusProgression[currentStatus];
  }
}
