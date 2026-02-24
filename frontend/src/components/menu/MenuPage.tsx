import React, { useState, useEffect } from 'react';
import type { MenuCategory, MenuItem } from '../../types/index';
import apiClient from '../../services/api';
import { MenuGrid } from './MenuGrid';
import { CategoryFilter } from './CategoryFilter';
import { Loading } from '../shared/Loading';
import { ErrorMessage } from '../shared/ErrorMessage';

export const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await apiClient.getMenuItems({ isAvailable: true });
      setMenuItems(items);
      setFilteredItems(items);
    } catch (err) {
      setError('Failed to load menu items. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter((item) => item.category === selectedCategory));
    }
  }, [selectedCategory, menuItems]);

  if (loading) {
    return <Loading message="Loading menu..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchMenuItems} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Menu</h1>
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <MenuGrid menuItems={filteredItems} />
    </div>
  );
};
