import { useEffect, useRef, useState, useCallback } from 'react';
import type { Order } from '../types/index';
import { OrderStatus } from '../types/index';
import { createEventSource, closeEventSource, parseSSEMessage } from '../services/sse';

const TERMINAL_STATUSES: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

export const SSEConnectionState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
} as const;

export type SSEConnectionState = typeof SSEConnectionState[keyof typeof SSEConnectionState];

export interface UseSSEOptions {
  onUpdate: (order: Order) => void;
  onError?: (error: Event) => void;
}

export interface UseSSEResult {
  connectionState: SSEConnectionState;
  lastUpdatedAt: Date | null;
}

export function useSSE(
  orderNumber: string | null,
  options: UseSSEOptions
): UseSSEResult {
  const { onUpdate, onError } = options;

  const [connectionState, setConnectionState] = useState<SSEConnectionState>(SSEConnectionState.CLOSED);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const eventSourceRef = useRef<EventSource | null>(null);
  const shouldStopRef = useRef(false);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      closeEventSource(eventSourceRef.current);
      eventSourceRef.current = null;
    }
    setConnectionState(SSEConnectionState.CLOSED);
  }, []);

  useEffect(() => {
    if (!orderNumber) {
      // Close existing connection (external system - OK to do synchronously)
      if (eventSourceRef.current) {
        closeEventSource(eventSourceRef.current);
        eventSourceRef.current = null;
      }
      // Update state asynchronously to avoid synchronous state update warning
      queueMicrotask(() => {
        setConnectionState(SSEConnectionState.CLOSED);
      });
      return;
    }

    shouldStopRef.current = false;
    
    const eventSource = createEventSource(orderNumber);
    eventSourceRef.current = eventSource;

    // Set CONNECTING state asynchronously to avoid synchronous state update warning
    queueMicrotask(() => {
      setConnectionState(SSEConnectionState.CONNECTING);
    });

    eventSource.onopen = () => {
      if (!shouldStopRef.current) {
        setConnectionState(SSEConnectionState.OPEN);
      }
    };

    eventSource.addEventListener('order-update', (event: MessageEvent) => {
      if (shouldStopRef.current) return;

      try {
        const order = parseSSEMessage(event.data);
        setLastUpdatedAt(new Date());
        onUpdateRef.current(order);

        if (TERMINAL_STATUSES.includes(order.status)) {
          shouldStopRef.current = true;
          cleanup();
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    });

    eventSource.onerror = (error: Event) => {
      console.error('SSE connection error:', error);
      onErrorRef.current?.(error);
      
      if (eventSource.readyState === EventSource.CLOSED) {
        setConnectionState(SSEConnectionState.CLOSED);
      }
    };

    return () => {
      shouldStopRef.current = true;
      cleanup();
    };
  }, [orderNumber, cleanup]);

  return {
    connectionState,
    lastUpdatedAt,
  };
}
