import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { getEnvVar, isDev } from '../utils/env';
import type {
  MenuItem,
  Order,
  CreateOrderDTO,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  OrderStatus,
  MenuCategory,
} from '../types/index';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const apiBaseUrl = getEnvVar('VITE_API_BASE_URL', 'https://order-management-raftlabs-assignment.onrender.com/api');
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.client.interceptors.request.use(
      (config) => {
        if (isDev()) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        if (isDev()) {
          console.log(`[API Response] ${response.config.url}`, response.data);
        }
        return response;
      },
      (error: AxiosError<ApiError>) => {
        if (isDev()) {
          console.error('[API Error]', error.response?.data || error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async getMenuItems(filters?: {
    category?: MenuCategory;
    isAvailable?: boolean;
  }): Promise<MenuItem[]> {
    const response = await this.client.get<ApiResponse<MenuItem[]>>('/menu', {
      params: filters,
    });
    return response.data.data;
  }

  async getMenuItemById(id: string): Promise<MenuItem> {
    const response = await this.client.get<ApiResponse<MenuItem>>(`/menu/${id}`);
    return response.data.data;
  }

  async createMenuItem(data: Omit<MenuItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const response = await this.client.post<ApiResponse<MenuItem>>('/menu', data);
    return response.data.data;
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const response = await this.client.put<ApiResponse<MenuItem>>(`/menu/${id}`, data);
    return response.data.data;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await this.client.delete(`/menu/${id}`);
  }

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    const response = await this.client.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await this.client.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  }

  async getAllOrders(filters?: {
    status?: OrderStatus;
    customerPhone?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get<PaginatedResponse<Order>>('/orders', {
      params: filters,
    });
    return response.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await this.client.patch<ApiResponse<Order>>(`/orders/${id}/status`, {
      status,
    });
    return response.data.data;
  }

  async trackOrder(orderNumber: string): Promise<Order> {
    const response = await this.client.get<ApiResponse<Order>>(`/orders/track/${orderNumber}`);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
