import '../setup';
import request from 'supertest';
import app from '../../src/app';
import { MenuItem, MenuCategory } from '../../src/models/MenuItem';
import { Order, OrderStatus } from '../../src/models/Order';

describe('Order API Integration Tests', () => {
  let menuItemId: string;

  beforeEach(async () => {
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

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
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

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toMatch(/^ORD\d{8}\d{4}$/);
      expect(response.body.data.totalAmount).toBe(12.99 * 2);
      expect(response.body.data.status).toBe(OrderStatus.RECEIVED);
    });

    it('should return 400 for invalid order data', async () => {
      const invalidData = {
        items: [],
        customer: {
          name: 'J',
          phone: '123',
          address: 'Short',
        },
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for unavailable menu items', async () => {
      await MenuItem.findByIdAndUpdate(menuItemId, { isAvailable: false });

      const orderData = {
        items: [
          {
            menuItemId,
            quantity: 1,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, City, Country',
        },
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      await Order.create([
        {
          orderNumber: 'ORD202402240001',
          items: [{ menuItem: menuItemId, quantity: 1, priceAtOrder: 12.99 }],
          customer: { name: 'John Doe', phone: '1234567890', address: '123 Main St' },
          totalAmount: 12.99,
          status: OrderStatus.RECEIVED,
        },
        {
          orderNumber: 'ORD202402240002',
          items: [{ menuItem: menuItemId, quantity: 2, priceAtOrder: 12.99 }],
          customer: { name: 'Jane Smith', phone: '0987654321', address: '456 Oak Ave' },
          totalAmount: 25.98,
          status: OrderStatus.PREPARING,
        },
      ]);
    });

    it('should get all orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ status: OrderStatus.PREPARING })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(OrderStatus.PREPARING);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by id', async () => {
      const order = await Order.create({
        orderNumber: 'ORD202402240003',
        items: [{ menuItem: menuItemId, quantity: 1, priceAtOrder: 12.99 }],
        customer: { name: 'John Doe', phone: '1234567890', address: '123 Main St' },
        totalAmount: 12.99,
        status: OrderStatus.RECEIVED,
      });

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe('ORD202402240003');
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      const order = await Order.create({
        orderNumber: 'ORD202402240004',
        items: [{ menuItem: menuItemId, quantity: 1, priceAtOrder: 12.99 }],
        customer: { name: 'John Doe', phone: '1234567890', address: '123 Main St' },
        totalAmount: 12.99,
        status: OrderStatus.RECEIVED,
      });

      const response = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .send({ status: OrderStatus.PREPARING })
        .expect(200);

      expect(response.body.data.status).toBe(OrderStatus.PREPARING);
      expect(response.body.data.statusHistory).toHaveLength(2);
    });

    it('should return 400 for invalid status transition', async () => {
      const order = await Order.create({
        orderNumber: 'ORD202402240005',
        items: [{ menuItem: menuItemId, quantity: 1, priceAtOrder: 12.99 }],
        customer: { name: 'John Doe', phone: '1234567890', address: '123 Main St' },
        totalAmount: 12.99,
        status: OrderStatus.RECEIVED,
      });

      const response = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/track/:orderNumber', () => {
    it('should track order by order number', async () => {
      const orderNumber = 'ORD202402240006';
      await Order.create({
        orderNumber,
        items: [{ menuItem: menuItemId, quantity: 1, priceAtOrder: 12.99 }],
        customer: { name: 'John Doe', phone: '1234567890', address: '123 Main St' },
        totalAmount: 12.99,
        status: OrderStatus.PREPARING,
      });

      const response = await request(app)
        .get(`/api/orders/track/${orderNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe(orderNumber);
    });

    it('should return 404 for non-existent order number', async () => {
      const response = await request(app)
        .get('/api/orders/track/ORD202402249999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
