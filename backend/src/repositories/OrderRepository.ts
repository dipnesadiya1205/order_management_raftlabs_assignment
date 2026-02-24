import { Order, IOrder, OrderStatus } from '../models/Order';
import '../models/MenuItem';
import { FilterQuery } from 'mongoose';

export interface OrderFilters {
  status?: OrderStatus;
  customerPhone?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class OrderRepository {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    const order = new Order(data);
    return await order.save();
  }

  async findById(id: string): Promise<IOrder | null> {
    return await Order.findById(id).populate({
      path: 'items.menuItem',
      model: 'menu_item',
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return await Order.findOne({ orderNumber }).populate({
      path: 'items.menuItem',
      model: 'menu_item',
    });
  }

  async findAll(
    filters?: OrderFilters,
    pagination?: PaginationOptions
  ): Promise<{ orders: IOrder[]; total: number }> {
    const query: FilterQuery<IOrder> = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.customerPhone) {
      query['customer.phone'] = filters.customerPhone;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: 'items.menuItem',
          model: 'menu_item',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return { orders, total };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<IOrder | null> {
    const order = await Order.findById(id);
    if (!order) return null;

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
    });

    return await order.save();
  }

  async update(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    return await Order.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'items.menuItem',
      model: 'menu_item',
    });
  }

  async findPendingOrders(): Promise<IOrder[]> {
    return await Order.find({
      status: {
        $in: [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY],
      },
    }).sort({ createdAt: 1 });
  }

  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const prefix = `ORD${year}${month}${day}`;
    
    const lastOrder = await Order.findOne({
      orderNumber: new RegExp(`^${prefix}`),
    }).sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
