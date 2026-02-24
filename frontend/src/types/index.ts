export const MenuCategory = {
  APPETIZER: 'appetizer',
  MAIN: 'main',
  DESSERT: 'dessert',
  BEVERAGE: 'beverage',
} as const;

export type MenuCategory = (typeof MenuCategory)[keyof typeof MenuCategory];


export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export const OrderStatus = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const; 

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItem {
  menuItem: MenuItem | string;
  quantity: number;
  priceAtOrder: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: Customer;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CreateOrderDTO {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  customer: Customer;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}
