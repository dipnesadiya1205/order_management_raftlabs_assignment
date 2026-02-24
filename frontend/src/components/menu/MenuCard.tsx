import React from 'react';
import type { MenuItem } from '../../types/index';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { useCart } from '../../contexts/CartContext';

interface MenuCardProps {
  menuItem: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ menuItem }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const cartItem = cartItems.find((item) => item.menuItem._id === menuItem._id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(menuItem);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleIncrement = () => {
    updateQuantity(menuItem._id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(menuItem._id, quantity - 1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <img
        src={menuItem.imageUrl}
        alt={menuItem.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{menuItem.name}</h3>
          <span className="text-lg font-bold text-primary-600">${menuItem.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{menuItem.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
            {menuItem.category}
          </span>
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors font-semibold"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold text-gray-800">{quantity}</span>
              <button
                onClick={handleIncrement}
                disabled={!menuItem.isAvailable}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={!menuItem.isAvailable || isAdding}
              size="sm"
            >
              {isAdding ? 'Added!' : menuItem.isAvailable ? 'Add to Cart' : 'Unavailable'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
