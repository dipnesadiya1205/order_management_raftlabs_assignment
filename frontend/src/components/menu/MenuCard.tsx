import React from 'react';
import type { MenuItem } from '../../types/index';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { useCart } from '../../contexts/CartContext';

interface MenuCardProps {
  menuItem: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ menuItem }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(menuItem);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <img
        src={menuItem.imageUrl}
        alt={menuItem.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{menuItem.name}</h3>
          <span className="text-lg font-bold text-primary-600">${menuItem.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{menuItem.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
            {menuItem.category}
          </span>
          <Button
            onClick={handleAddToCart}
            disabled={!menuItem.isAvailable || isAdding}
            size="sm"
          >
            {isAdding ? 'Added!' : menuItem.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
