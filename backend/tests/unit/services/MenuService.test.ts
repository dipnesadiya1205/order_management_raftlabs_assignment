import '../../setup';
import { MenuService } from '../../../src/services/MenuService';
import { MenuItem, MenuCategory } from '../../../src/models/MenuItem';
import { NotFoundError, BadRequestError } from '../../../src/utils/AppError';

describe('MenuService', () => {
  let menuService: MenuService;

  beforeEach(() => {
    menuService = new MenuService();
  });

  describe('createMenuItem', () => {
    it('should create a menu item successfully', async () => {
      const menuItemData = {
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with tomato and mozzarella',
        price: 12.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/pizza.jpg',
        isAvailable: true,
      };

      const menuItem = await menuService.createMenuItem(menuItemData);

      expect(menuItem).toBeDefined();
      expect(menuItem.name).toBe(menuItemData.name);
      expect(menuItem.price).toBe(menuItemData.price);
    });

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        name: 'P',
        description: 'Short',
        price: -5,
        category: 'invalid' as MenuCategory,
        imageUrl: 'not-a-url',
      };

      await expect(menuService.createMenuItem(invalidData)).rejects.toThrow();
    });
  });

  describe('getMenuItemById', () => {
    it('should return menu item by id', async () => {
      const menuItem = await MenuItem.create({
        name: 'Burger',
        description: 'Delicious beef burger with cheese',
        price: 8.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/burger.jpg',
      });

      const found = await menuService.getMenuItemById(menuItem._id.toString());

      expect(found).toBeDefined();
      expect(found.name).toBe('Burger');
    });

    it('should throw NotFoundError for non-existent id', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(menuService.getMenuItemById(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllMenuItems', () => {
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
        {
          name: 'Pasta',
          description: 'Italian pasta with tomato sauce',
          price: 10.99,
          category: MenuCategory.MAIN,
          imageUrl: 'https://example.com/pasta.jpg',
          isAvailable: false,
        },
      ]);
    });

    it('should return all menu items', async () => {
      const items = await menuService.getAllMenuItems();
      expect(items).toHaveLength(3);
    });

    it('should filter by category', async () => {
      const items = await menuService.getAllMenuItems({ category: MenuCategory.MAIN });
      expect(items).toHaveLength(2);
      expect(items.every((item) => item.category === MenuCategory.MAIN)).toBe(true);
    });

    it('should filter by availability', async () => {
      const items = await menuService.getAllMenuItems({ isAvailable: true });
      expect(items).toHaveLength(2);
      expect(items.every((item) => item.isAvailable === true)).toBe(true);
    });
  });

  describe('validateMenuItems', () => {
    it('should validate available menu items', async () => {
      const item1 = await MenuItem.create({
        name: 'Pizza',
        description: 'Delicious pizza with various toppings',
        price: 12.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/pizza.jpg',
        isAvailable: true,
      });

      const items = await menuService.validateMenuItems([item1._id.toString()]);
      expect(items).toHaveLength(1);
    });

    it('should throw error for non-existent items', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(menuService.validateMenuItems([fakeId])).rejects.toThrow(BadRequestError);
    });

    it('should throw error for unavailable items', async () => {
      const item = await MenuItem.create({
        name: 'Pasta',
        description: 'Italian pasta with tomato sauce',
        price: 10.99,
        category: MenuCategory.MAIN,
        imageUrl: 'https://example.com/pasta.jpg',
        isAvailable: false,
      });

      await expect(menuService.validateMenuItems([item._id.toString()])).rejects.toThrow(
        BadRequestError
      );
    });
  });
});
