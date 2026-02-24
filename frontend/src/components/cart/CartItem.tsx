import React from 'react';
import type { CartItem as CartItemType } from '../../types/index';
import { Button } from '../shared/Button';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemove: (menuItemId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const { menuItem, quantity } = item;
  const subtotal = menuItem.price * quantity;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <img
        src={menuItem.imageUrl}
        alt={menuItem.name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{menuItem.name}</h3>
        <p className="text-sm text-gray-600">${menuItem.price.toFixed(2)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onUpdateQuantity(menuItem._id, quantity - 1)}
          disabled={quantity <= 1}
        >
          -
        </Button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onUpdateQuantity(menuItem._id, quantity + 1)}
        >
          +
        </Button>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-800">${subtotal.toFixed(2)}</p>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onRemove(menuItem._id)}
          className="mt-2"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
