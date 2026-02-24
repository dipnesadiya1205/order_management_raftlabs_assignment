import '../setup';
import request from 'supertest';
import app from '../../src/app';
import { MenuItem, MenuCategory } from '../../src/models/MenuItem';

describe('Menu API Integration Tests', () => {
  describe('POST /api/menu', () => {
    it('should create a new menu item', async () => {
      const menuItemData = {
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with tomato and mozzarella',
        price: 12.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/pizza.jpg',
      };

      const response = await request(app)
        .post('/api/menu')
        .send(menuItemData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(menuItemData.name);
      expect(response.body.data.price).toBe(menuItemData.price);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'P',
        description: 'Short',
        price: -5,
        category: 'invalid',
        imageUrl: 'not-a-url',
      };

      const response = await request(app)
        .post('/api/menu')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/menu', () => {
    beforeEach(async () => {
      await MenuItem.create([
        {
          name: 'Pizza',
          description: 'Delicious pizza with various toppings',
          price: 12.99,
          category: MenuCategory.MAIN,
          imageUrl: 'https://example.com/pizza.jpg',
          isAvailable: true,
        },
        {
          name: 'Ice Cream',
          description: 'Creamy vanilla ice cream',
          price: 4.99,
          category: MenuCategory.DESSERT,
          imageUrl: 'https://example.com/icecream.jpg',
          isAvailable: true,
        },
      ]);
    });

    it('should get all menu items', async () => {
      const response = await request(app)
        .get('/api/menu')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/menu')
        .query({ category: MenuCategory.MAIN })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe(MenuCategory.MAIN);
    });

    it('should filter by availability', async () => {
      await MenuItem.create({
        name: 'Pasta',
        description: 'Italian pasta with tomato sauce',
        price: 10.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/pasta.jpg',
        isAvailable: false,
      });

      const response = await request(app)
        .get('/api/menu')
        .query({ isAvailable: 'true' })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/menu/:id', () => {
    it('should get menu item by id', async () => {
      const menuItem = await MenuItem.create({
        name: 'Burger',
        description: 'Delicious beef burger with cheese',
        price: 8.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/burger.jpg',
      });

      const response = await request(app)
        .get(`/api/menu/${menuItem._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Burger');
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/menu/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/menu/:id', () => {
    it('should update menu item', async () => {
      const menuItem = await MenuItem.create({
        name: 'Pizza',
        description: 'Delicious pizza with various toppings',
        price: 12.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/pizza.jpg',
      });

      const updateData = {
        price: 14.99,
        isAvailable: false,
      };

      const response = await request(app)
        .put(`/api/menu/${menuItem._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.price).toBe(14.99);
      expect(response.body.data.isAvailable).toBe(false);
    });
  });

  describe('DELETE /api/menu/:id', () => {
    it('should delete menu item', async () => {
      const menuItem = await MenuItem.create({
        name: 'Pizza',
        description: 'Delicious pizza with various toppings',
        price: 12.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/pizza.jpg',
      });

      await request(app)
        .delete(`/api/menu/${menuItem._id}`)
        .expect(200);

      const found = await MenuItem.findById(menuItem._id);
      expect(found).toBeNull();
    });
  });
});
