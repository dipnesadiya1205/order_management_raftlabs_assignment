import React, { useState, useEffect } from 'react';
import { useOrder } from '../../contexts/OrderContext';
import { SSEConnectionState } from '../../hooks/useSSE';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { OrderDetails } from './OrderDetails';
import { Card } from '../shared/Card';
import { OrderStatus, type ApiError } from '../../types/index';
import type { AxiosError } from 'axios';

const TERMINAL_STATUSES: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

/** Returns a human-readable "X seconds/minutes ago" string. */
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0); // forces re-render so "X ago" stays fresh

  const { trackingOrder, startTracking, stopTracking, connectionState, lastUpdatedAt } = useOrder();

  // Refresh the "last updated" label every second.
  useEffect(() => {
    if (!lastUpdatedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [lastUpdatedAt]);

  const isTerminal = trackingOrder ? TERMINAL_STATUSES.includes(trackingOrder.status) : false;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await startTracking(orderNumber);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.error?.message || 'Order not found. Please check the order number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    stopTracking();
    setOrderNumber('');
    setError(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Track Your Order</h1>

      {!trackingOrder ? (
        <Card className="p-6 max-w-md mx-auto">
          <form onSubmit={handleTrack} className="space-y-4">
            <Input
              label="Order Number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORD202402240001"
              error={error || undefined}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
        </Card>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Order #{trackingOrder.orderNumber}
              </h2>
              <p className="text-gray-600">
                Placed on {new Date(trackingOrder.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleReset}>
                Track Another Order
              </Button>
            </div>
          </div>

          {/* Last updated timestamp */}
          {lastUpdatedAt && (
            <p
              className="text-xs text-gray-400 mb-4"
              // tick is used only to trigger re-renders; the actual value is unused in JSX
              data-tick={tick}
            >
              Last updated: {timeAgo(lastUpdatedAt)}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Status</h2>
              <OrderStatusTimeline
                currentStatus={trackingOrder.status}
                statusHistory={trackingOrder.statusHistory}
              />
            </Card>
            <OrderDetails order={trackingOrder} />
          </div>
        </div>
      )}
    </div>
  );
};
