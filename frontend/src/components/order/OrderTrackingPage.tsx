import React, { useState } from 'react';
import { useOrder } from '../../contexts/OrderContext';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { OrderDetails } from './OrderDetails';
import { Loading } from '../shared/Loading';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Card } from '../shared/Card';

export const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { trackingOrder, startTracking, stopTracking } = useOrder();

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
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Order not found. Please check the order number.');
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Order #{trackingOrder.orderNumber}
              </h2>
              <p className="text-gray-600">
                Placed on {new Date(trackingOrder.createdAt).toLocaleString()}
              </p>
            </div>
            <Button variant="secondary" onClick={handleReset}>
              Track Another Order
            </Button>
          </div>

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
