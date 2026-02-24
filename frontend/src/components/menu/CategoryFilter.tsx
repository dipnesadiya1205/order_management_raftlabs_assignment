import React from 'react';
import { MenuCategory } from '../../types/index';

interface CategoryFilterProps {
  selectedCategory: MenuCategory | 'all';
  onCategoryChange: (category: MenuCategory | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const categories: Array<{ value: MenuCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: MenuCategory.APPETIZER, label: 'Appetizers' },
    { value: MenuCategory.MAIN, label: 'Main Courses' },
    { value: MenuCategory.DESSERT, label: 'Desserts' },
    { value: MenuCategory.BEVERAGE, label: 'Beverages' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === category.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
