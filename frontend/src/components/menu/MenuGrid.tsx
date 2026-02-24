import React from 'react';
import type { MenuItem } from '../../types/index';
import { MenuCard } from './MenuCard';

interface MenuGridProps {
  menuItems: MenuItem[];
}

export const MenuGrid: React.FC<MenuGridProps> = ({ menuItems }) => {
  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No menu items available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {menuItems.map((item) => (
        <MenuCard key={item._id} menuItem={item} />
      ))}
    </div>
  );
};
