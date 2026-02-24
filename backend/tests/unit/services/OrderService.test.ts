import '../../setup';
import { OrderService } from '../../../src/services/OrderService';
import { MenuItem, MenuCategory } from '../../../src/models/MenuItem';
import { Order, OrderStatus } from '../../../src/models/Order';
import { NotFoundError, BadRequestError } from '../../../src/utils/AppError';

describe('OrderService', () => {
  let orderService: OrderService;
  let menuItemId: string;

  beforeEach(async () => {
    orderService = new OrderService();

    const menuItem = await MenuItem.create({
      name: 'Pizza',
      description: 'Delicious pizza with various toppings',
      price: 12.99,
      category: MenuCategory.MAIN,
      imageUrl: 'https://example.com/pizza.jpg',
      isAvailable: true,
    });

    menuItemId = menuItem._id.toString();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const orderData = {
        items: [
          {
            menuItemId,
            quantity: 2,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
      };

      const order = await orderService.createOrder(orderData);

      expect(order).toBeDefined();
      expect(order.orderNumber).toMatch(/^ORD\d{8}\d{4}$/);
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount).toBe(12.99 * 2);
      expect(order.status).toBe(OrderStatus.RECEIVED);
    });

    it('should throw error for empty items', async () => {
      const orderData = {
        items: [],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(BadRequestError);
    });

    it('should throw error for non-existent menu items', async () => {
      const orderData = {
        items: [
          {
            menuItemId: '507f1f77bcf86cd799439011',
            quantity: 1,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(BadRequestError);
    });

    it('should calculate total correctly for multiple items', async () => {
      const item2 = await MenuItem.create({
        name: 'Burger',
        description: 'Delicious beef burger',
        price: 8.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/burger.jpg',
        isAvailable: true,
      });

      const orderData = {
        items: [
          { menuItemId, quantity: 2 },
          { menuItemId: item2._id.toString(), quantity: 1 },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
      };

      const order = await orderService.createOrder(orderData);
      const expectedTotal = 12.99 * 2 + 8.99 * 1;

      expect(order.totalAmount).toBeCloseTo(expectedTotal, 2);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const order = await Order.create({
        orderNumber: 'ORD202402240001',
        items: [
          {
            menuItem: menuItemId,
            quantity: 1,
            priceAtOrder: 12.99,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
        totalAmount: 12.99,
        status: OrderStatus.RECEIVED,
      });

      const updated = await orderService.updateOrderStatus(
        order._id.toString(),
        OrderStatus.PREPARING
      );

      expect(updated.status).toBe(OrderStatus.PREPARING);
      expect(updated.statusHistory).toHaveLength(2);
    });

    it('should throw error for invalid status transition', async () => {
      const order = await Order.create({
        orderNumber: 'ORD202402240002',
        items: [
          {
            menuItem: menuItemId,
            quantity: 1,
            priceAtOrder: 12.99,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
        totalAmount: 12.99,
        status: OrderStatus.RECEIVED,
      });

      await expect(
        orderService.updateOrderStatus(order._id.toString(), OrderStatus.DELIVERED)
      ).rejects.toThrow(BadRequestError);
    });

    it('should not allow updating completed orders', async () => {
      const order = await Order.create({
        orderNumber: 'ORD202402240003',
        items: [
          {
            menuItem: menuItemId,
            quantity: 1,
            priceAtOrder: 12.99,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
        totalAmount: 12.99,
        status: OrderStatus.DELIVERED,
      });

      await expect(
        orderService.updateOrderStatus(order._id.toString(), OrderStatus.CANCELLED)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('getOrderByOrderNumber', () => {
    it('should find order by order number', async () => {
      const orderNumber = 'ORD202402240004';
      await Order.create({
        orderNumber,
        items: [
          {
            menuItem: menuItemId,
            quantity: 1,
            priceAtOrder: 12.99,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
        totalAmount: 12.99,
        status: OrderStatus.RECEIVED,
      });

      const order = await orderService.getOrderByOrderNumber(orderNumber);

      expect(order).toBeDefined();
      expect(order.orderNumber).toBe(orderNumber);
    });

    it('should throw NotFoundError for non-existent order number', async () => {
      await expect(orderService.getOrderByOrderNumber('ORD202402240999')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
