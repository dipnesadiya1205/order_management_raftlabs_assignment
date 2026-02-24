import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, disconnectDatabase } from '../config/database';
import { MenuItem, MenuCategory } from '../models/MenuItem';
import { Order, OrderStatus } from '../models/Order';

const menuItems = [
  {
    name: 'Spring Rolls',
    description: 'Crispy vegetable spring rolls served with sweet chili sauce',
    price: 6.99,
    category: MenuCategory.APPETIZER,
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    isAvailable: true,
  },
  {
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter and herbs',
    price: 4.99,
    category: MenuCategory.APPETIZER,
    imageUrl: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400',
    isAvailable: true,
  },
  {
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings with blue cheese dip',
    price: 8.99,
    category: MenuCategory.APPETIZER,
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
    isAvailable: true,
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with tomato sauce, mozzarella, and fresh basil',
    price: 12.99,
    category: MenuCategory.MAIN,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    isAvailable: true,
  },
  {
    name: 'Chicken Burger',
    description: 'Grilled chicken breast with lettuce, tomato, and special sauce',
    price: 10.99,
    category: MenuCategory.MAIN,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isAvailable: true,
  },
  {
    name: 'Pasta Alfredo',
    description: 'Creamy fettuccine pasta with parmesan cheese',
    price: 11.99,
    category: MenuCategory.MAIN,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    isAvailable: true,
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce and vegetables',
    price: 16.99,
    category: MenuCategory.MAIN,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    isAvailable: true,
  },
  {
    name: 'Beef Tacos',
    description: 'Three soft tacos with seasoned beef, cheese, and salsa',
    price: 9.99,
    category: MenuCategory.MAIN,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    isAvailable: true,
  },
  {
    name: 'Vegetable Stir Fry',
    description: 'Mixed vegetables in Asian sauce with rice',
    price: 10.99,
    category: MenuCategory.MAIN,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    isAvailable: true,
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate layer cake with chocolate ganache',
    price: 6.99,
    category: MenuCategory.DESSERT,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    isAvailable: true,
  },
  {
    name: 'Vanilla Ice Cream',
    description: 'Creamy vanilla ice cream with chocolate sauce',
    price: 4.99,
    category: MenuCategory.DESSERT,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    isAvailable: true,
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee and mascarpone',
    price: 7.99,
    category: MenuCategory.DESSERT,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    isAvailable: true,
  },
  {
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    price: 6.99,
    category: MenuCategory.DESSERT,
    imageUrl: 'https://images.unsplash.com/photo-1533134242820-f8a7e1f3e1e3?w=400',
    isAvailable: true,
  },
  {
    name: 'Coca Cola',
    description: 'Classic Coca Cola (330ml)',
    price: 2.99,
    category: MenuCategory.BEVERAGE,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    isAvailable: true,
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 4.99,
    category: MenuCategory.BEVERAGE,
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    isAvailable: true,
  },
  {
    name: 'Coffee',
    description: 'Freshly brewed coffee',
    price: 3.99,
    category: MenuCategory.BEVERAGE,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    isAvailable: true,
  },
  {
    name: 'Iced Tea',
    description: 'Refreshing iced tea with lemon',
    price: 3.49,
    category: MenuCategory.BEVERAGE,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    isAvailable: true,
  },
];

async function seed() {
  try {
    await connectDatabase();
    console.log('Starting database seed...');

    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    await Order.deleteMany({});
    console.log('Cleared existing orders');

    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`Created ${createdItems.length} menu items`);

    const sampleOrders = [
      {
        orderNumber: 'ORD202602240001',
        items: [
          {
            menuItem: createdItems[3]._id,
            quantity: 2,
            priceAtOrder: createdItems[3].price,
          },
          {
            menuItem: createdItems[13]._id,
            quantity: 2,
            priceAtOrder: createdItems[13].price,
          },
        ],
        customer: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St, New York, NY 10001',
        },
        totalAmount: createdItems[3].price * 2 + createdItems[13].price * 2,
        status: OrderStatus.PREPARING,
        statusHistory: [
          { status: OrderStatus.RECEIVED, timestamp: new Date(Date.now() - 1800000) },
          { status: OrderStatus.PREPARING, timestamp: new Date(Date.now() - 900000) },
        ],
      },
      {
        orderNumber: 'ORD202602240002',
        items: [
          {
            menuItem: createdItems[4]._id,
            quantity: 1,
            priceAtOrder: createdItems[4].price,
          },
          {
            menuItem: createdItems[9]._id,
            quantity: 1,
            priceAtOrder: createdItems[9].price,
          },
        ],
        customer: {
          name: 'Jane Smith',
          phone: '0987654321',
          address: '456 Oak Avenue, Los Angeles, CA 90001',
        },
        totalAmount: createdItems[4].price + createdItems[9].price,
        status: OrderStatus.OUT_FOR_DELIVERY,
        statusHistory: [
          { status: OrderStatus.RECEIVED, timestamp: new Date(Date.now() - 3600000) },
          { status: OrderStatus.PREPARING, timestamp: new Date(Date.now() - 2700000) },
          { status: OrderStatus.OUT_FOR_DELIVERY, timestamp: new Date(Date.now() - 900000) },
        ],
      },
    ];

    await Order.insertMany(sampleOrders);
    console.log(`Created ${sampleOrders.length} sample orders`);

    console.log('Database seed completed successfully!');
    console.log(`Total menu items: ${createdItems.length}`);
    console.log(`Total orders: ${sampleOrders.length}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

seed();
