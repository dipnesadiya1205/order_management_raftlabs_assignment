import { Response } from 'express';
import { IOrder } from '../models/Order';
import logger from '../utils/logger';

interface SSEClient {
  res: Response;
  orderNumber: string;
  connectedAt: Date;
}

export class SSEConnectionManager {
  private static instance: SSEConnectionManager;
  private connections: Map<string, SSEClient[]>;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL_MS = 30000;

  private constructor() {
    this.connections = new Map();
    this.startHeartbeat();
  }

  public static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  public addConnection(orderNumber: string, res: Response): void {
    const client: SSEClient = {
      res,
      orderNumber,
      connectedAt: new Date(),
    };

    if (!this.connections.has(orderNumber)) {
      this.connections.set(orderNumber, []);
    }

    const clients = this.connections.get(orderNumber)!;
    clients.push(client);

    logger.info(`SSE client connected for order ${orderNumber}. Total clients: ${clients.length}`);

    res.on('close', () => {
      this.removeConnection(orderNumber, res);
    });
  }

  public removeConnection(orderNumber: string, res: Response): void {
    const clients = this.connections.get(orderNumber);
    if (!clients) return;

    const index = clients.findIndex((client) => client.res === res);
    if (index !== -1) {
      clients.splice(index, 1);
      logger.info(`SSE client disconnected for order ${orderNumber}. Remaining clients: ${clients.length}`);

      if (clients.length === 0) {
        this.connections.delete(orderNumber);
        logger.info(`No more clients tracking order ${orderNumber}, removed from connection map`);
      }
    }
  }

  public sendOrderUpdate(orderNumber: string, order: IOrder): void {
    const clients = this.connections.get(orderNumber);
    if (!clients || clients.length === 0) {
      return;
    }

    const data = JSON.stringify({
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

    const deadConnections: Response[] = [];

    clients.forEach((client) => {
      try {
        client.res.write(`event: order-update\n`);
        client.res.write(`data: ${data}\n\n`);
        logger.debug(`Sent order update to client for order ${orderNumber}`);
      } catch (error) {
        logger.error(`Failed to send update to client for order ${orderNumber}:`, error);
        deadConnections.push(client.res);
      }
    });

    deadConnections.forEach((res) => this.removeConnection(orderNumber, res));
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeatToAll();
    }, this.HEARTBEAT_INTERVAL_MS);

    logger.info('SSE heartbeat started');
  }

  private sendHeartbeatToAll(): void {
    const deadConnections: Array<{ orderNumber: string; res: Response }> = [];

    this.connections.forEach((clients, orderNumber) => {
      clients.forEach((client) => {
        try {
          client.res.write(`:heartbeat\n\n`);
        } catch (error) {
          logger.debug(`Heartbeat failed for order ${orderNumber}, marking connection as dead`);
          deadConnections.push({ orderNumber, res: client.res });
        }
      });
    });

    deadConnections.forEach(({ orderNumber, res }) => {
      this.removeConnection(orderNumber, res);
    });

    if (this.connections.size > 0) {
      logger.debug(`Heartbeat sent to ${this.getTotalConnections()} active SSE connections`);
    }
  }

  public getTotalConnections(): number {
    let total = 0;
    this.connections.forEach((clients) => {
      total += clients.length;
    });
    return total;
  }

  public getConnectionsForOrder(orderNumber: string): number {
    return this.connections.get(orderNumber)?.length || 0;
  }

  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      logger.info('SSE heartbeat stopped');
    }
  }

  public closeAllConnections(): void {
    this.connections.forEach((clients, orderNumber) => {
      clients.forEach((client) => {
        try {
          client.res.end();
        } catch (error) {
          logger.error(`Error closing connection for order ${orderNumber}:`, error);
        }
      });
    });
    this.connections.clear();
    logger.info('All SSE connections closed');
  }
}

export const sseConnectionManager = SSEConnectionManager.getInstance();
