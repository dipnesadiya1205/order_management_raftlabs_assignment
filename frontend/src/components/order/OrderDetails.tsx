import React from 'react';
import type { Order, MenuItem } from '../../types/index';
import { Card } from '../shared/Card';

interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, index) => {
            const menuItem = item.menuItem as MenuItem;
            return (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={menuItem.imageUrl}
                    alt={menuItem.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{menuItem.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.priceAtOrder.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">
                  ${(item.priceAtOrder * item.quantity).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Information</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Name:</span> {order.customer.name}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {order.customer.phone}
          </p>
          <p>
            <span className="font-medium">Address:</span> {order.customer.address}
          </p>
        </div>
      </Card>
    </div>
  );
};
