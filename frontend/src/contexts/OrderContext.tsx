/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Order } from '../types/index';
import apiClient from '../services/api';
import { useSSE, SSEConnectionState } from '../hooks/useSSE';

interface OrderContextType {
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  trackingOrder: Order | null;
  startTracking: (orderNumber: string) => Promise<void>;
  stopTracking: () => void;
  refreshTracking: () => Promise<void>;
  /** True while tracking is active. */
  isTracking: boolean;
  /** SSE connection state. */
  connectionState: SSEConnectionState;
  /** Timestamp of the last successful update, or null before first update. */
  lastUpdatedAt: Date | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const handleSSEUpdate = useCallback((order: Order) => {
    setTrackingOrder(order);
  }, []);

  const handleSSEError = useCallback((error: Event) => {
    console.error('SSE connection error while tracking order:', error);
  }, []);

  const activeOrderNumber = isTracking && trackingOrder ? trackingOrder.orderNumber : null;

  const { connectionState, lastUpdatedAt } = useSSE(activeOrderNumber, {
    onUpdate: handleSSEUpdate,
    onError: handleSSEError,
  });

  const startTracking = async (orderNumber: string) => {
    try {
      const order = await apiClient.trackOrder(orderNumber);
      setTrackingOrder(order);
      setIsTracking(true);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      throw error;
    }
  };

  const refreshTracking = async () => {
    if (!trackingOrder) return;
    try {
      const updatedOrder = await apiClient.trackOrder(trackingOrder.orderNumber);
      setTrackingOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to refresh tracking:', error);
    }
  };

  const stopTracking = () => {
    setTrackingOrder(null);
    setIsTracking(false);
  };

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        setCurrentOrder,
        trackingOrder,
        startTracking,
        stopTracking,
        refreshTracking,
        isTracking,
        connectionState,
        lastUpdatedAt,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
