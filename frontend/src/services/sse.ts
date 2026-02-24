import type { Order } from '../types/index';
import { getEnvVar } from '../utils/env';

const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api');

export interface SSEEventData {
  order: Order;
}

export const createEventSource = (orderNumber: string): EventSource => {
  const url = `${API_BASE_URL}/orders/track/${orderNumber}/stream`;
  const eventSource = new EventSource(url);
  return eventSource;
};

export const closeEventSource = (eventSource: EventSource): void => {
  eventSource.close();
};

export const parseSSEMessage = (data: string): Order => {
  return JSON.parse(data);
};
