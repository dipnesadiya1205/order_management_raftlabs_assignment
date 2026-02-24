import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuCard } from '../../components/menu/MenuCard';
import { CartProvider } from '../../contexts/CartContext';
import type { MenuItem, MenuCategory } from '../../types/index';

const mockMenuItem: MenuItem = {
  _id: '1',
  name: 'Test Pizza',
  description: 'A delicious test pizza',
  price: 12.99,
  category: MenuCategory.MAIN,
  imageUrl: 'https://example.com/pizza.jpg',
  isAvailable: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('MenuCard', () => {
  it('renders menu item correctly', () => {
    render(
      <CartProvider>
        <MenuCard menuItem={mockMenuItem} />
      </CartProvider>
    );

    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
    expect(screen.getByText('A delicious test pizza')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
  });

  it('adds item to cart when button is clicked', () => {
    render(
      <CartProvider>
        <MenuCard menuItem={mockMenuItem} />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    expect(screen.getByText('Added!')).toBeInTheDocument();
  });

  it('disables button when item is unavailable', () => {
    const unavailableItem = { ...mockMenuItem, isAvailable: false };
    
    render(
      <CartProvider>
        <MenuCard menuItem={unavailableItem} />
      </CartProvider>
    );

    const button = screen.getByText('Unavailable');
    expect(button).toBeDisabled();
  });
});
