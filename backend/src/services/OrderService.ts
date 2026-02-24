import { OrderRepository, OrderFilters, PaginationOptions } from '../repositories/OrderRepository';
import { MenuService } from './MenuService';
import { IOrder, OrderStatus, IOrderItem, ICustomer } from '../models/Order';
import { NotFoundError, BadRequestError } from '../utils/AppError';

export interface CreateOrderDTO {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  customer: ICustomer;
}

export class OrderService {
  private orderRepository: OrderRepository;
  private menuService: MenuService;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.menuService = new MenuService();
  }

  async createOrder(data: CreateOrderDTO): Promise<IOrder> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Order must contain at least one item');
    }

    const menuItemIds = data.items.map((item) => item.menuItemId);
    const menuItems = await this.menuService.validateMenuItems(menuItemIds);

    const menuItemMap = new Map(menuItems.map((item) => [item._id.toString(), item]));

    const orderItems: IOrderItem[] = data.items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new BadRequestError(`Menu item ${item.menuItemId} not found`);
      }

      return {
        menuItem: menuItem._id,
        quantity: item.quantity,
        priceAtOrder: menuItem.price,
      };
    });

    const totalAmount = this.calculateTotal(orderItems);

    const orderNumber = await this.orderRepository.generateOrderNumber();

    const order = await this.orderRepository.create({
      orderNumber,
      items: orderItems,
      customer: data.customer,
      totalAmount,
      status: OrderStatus.RECEIVED,
      statusHistory: [],
    });

    return order;
  }

  async getOrderById(id: string): Promise<IOrder> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order');
    }
    return order;
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<IOrder> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundError('Order');
    }
    return order;
  }

  async getAllOrders(
    filters?: OrderFilters,
    pagination?: PaginationOptions
  ): Promise<{ orders: IOrder[]; total: number; page: number; totalPages: number }> {
    const { orders, total } = await this.orderRepository.findAll(filters, pagination);
    
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      total,
      page,
      totalPages,
    };
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<IOrder> {
    const validTransitions = this.getValidStatusTransitions();
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError('Cannot update status of completed or cancelled order');
    }

    const allowedStatuses = validTransitions[order.status];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestError(
        `Cannot transition from ${order.status} to ${status}`
      );
    }

    const updatedOrder = await this.orderRepository.updateStatus(id, status);
    if (!updatedOrder) {
      throw new NotFoundError('Order');
    }

    return updatedOrder;
  }

  async trackOrder(orderNumber: string): Promise<IOrder> {
    return await this.getOrderByOrderNumber(orderNumber);
  }

  private calculateTotal(items: IOrderItem[]): number {
    return items.reduce((total, item) => {
      return total + item.priceAtOrder * item.quantity;
    }, 0);
  }

  private getValidStatusTransitions(): Record<OrderStatus, OrderStatus[]> {
    return {
      [OrderStatus.RECEIVED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };
  }
}
