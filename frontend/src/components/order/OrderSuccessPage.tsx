import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../../contexts/OrderContext';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { currentOrder, startTracking } = useOrder();

  useEffect(() => {
    if (orderNumber && !currentOrder) {
      startTracking(orderNumber);
    }
  }, [orderNumber, currentOrder, startTracking]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your food is being prepared.
        </p>
        
        {orderNumber && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Your Order Number</p>
            <p className="text-2xl font-bold text-primary-600">{orderNumber}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link to={`/track`}>
            <Button className="w-full">Track Your Order</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" className="w-full">
              Back to Menu
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
