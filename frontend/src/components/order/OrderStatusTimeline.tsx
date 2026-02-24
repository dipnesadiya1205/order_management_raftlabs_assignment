import React from 'react';
import { OrderStatus, type StatusHistory } from '../../types/index';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory: StatusHistory[];
}

const statusSteps = [
  { status: OrderStatus.RECEIVED, label: 'Order Received', icon: '📝' },
  { status: OrderStatus.PREPARING, label: 'Preparing', icon: '👨‍🍳' },
  { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: '🚚' },
  { status: OrderStatus.DELIVERED, label: 'Delivered', icon: '✅' },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  statusHistory,
}) => {
  const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus);
  const isCancelled = currentStatus === OrderStatus.CANCELLED;

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (isCancelled) return 'pending';

    const step = statusSteps[index];
    const isDeliveredStep = step.status === OrderStatus.DELIVERED;

    if (index < currentIndex) return 'completed';

    if (index === currentIndex) {
      return isDeliveredStep ? 'completed' : 'current';
    }

    return 'pending';
  };

  const getTimestamp = (status: OrderStatus): string | null => {
    const history = statusHistory.find((h) => h.status === status);
    if (!history) return null;
    return new Date(history.timestamp).toLocaleString();
  };

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">❌</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Order Cancelled</h3>
        <p className="text-red-600">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusSteps.map((step, index) => {
        const status = getStepStatus(index);
        const timestamp = getTimestamp(step.status);

        return (
          <div key={step.status} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  status === 'completed'
                    ? 'bg-green-500 text-white'
                    : status === 'current'
                    ? 'bg-primary-600 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.icon}
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={`w-1 h-12 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h3
                className={`font-semibold ${
                  status === 'completed' || status === 'current'
                    ? 'text-gray-800'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </h3>
              {timestamp && (
                <p className="text-sm text-gray-600 mt-1">{timestamp}</p>
              )}
              {status === 'current' && (
                <p className="text-sm text-primary-600 mt-1">In progress...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
