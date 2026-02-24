import React from 'react';
import type { CartItem } from '../../types/index';
import { Card } from '../shared/Card';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, total }) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.menuItem._id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.menuItem.name} x {item.quantity}
            </span>
            <span className="font-medium text-gray-800">
              ${(item.menuItem.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3">
        <div className="flex justify-between text-lg font-bold text-gray-800">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};
