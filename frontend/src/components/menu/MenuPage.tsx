import React, { useState, useEffect, useCallback } from 'react';
import type { MenuCategory, MenuItem } from '../../types/index';
import apiClient from '../../services/api';
import { MenuGrid } from './MenuGrid';
import { CategoryFilter } from './CategoryFilter';
import { Loading } from '../shared/Loading';
import { ErrorMessage } from '../shared/ErrorMessage';

export const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: {
        isAvailable: boolean;
        category?: MenuCategory;
        search?: string;
      } = {
        isAvailable: true,
      };

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      const trimmedSearch = debouncedSearch.trim();
      if (trimmedSearch) {
        filters.search = trimmedSearch;
      }

      const items = await apiClient.getMenuItems(filters);
      setMenuItems(items);
    } catch (err) {
      setError('Failed to load menu items. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  if (loading && isInitialLoad) {
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
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <MenuGrid menuItems={menuItems} />
    </div>
  );
};
