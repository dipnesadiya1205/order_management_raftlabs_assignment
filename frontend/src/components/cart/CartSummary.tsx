import React from 'react';
import { Card } from '../shared/Card';

interface CartSummaryProps {
  subtotal: number;
  tax?: number;
  total: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, tax = 0, total }) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
