import React from 'react';
import { MenuCategory } from '../../types/index';
import { Input } from '../shared/Input';

interface CategoryFilterProps {
  selectedCategory: MenuCategory | 'all';
  onCategoryChange: (category: MenuCategory | 'all') => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  searchTerm,
  setSearchTerm,
}) => {
  const categories: Array<{ value: MenuCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: MenuCategory.APPETIZER, label: 'Appetizers' },
    { value: MenuCategory.MAIN, label: 'Main Courses' },
    { value: MenuCategory.DESSERT, label: 'Desserts' },
    { value: MenuCategory.BEVERAGE, label: 'Beverages' },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
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
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
