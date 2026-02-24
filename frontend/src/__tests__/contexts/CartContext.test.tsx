import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../contexts/CartContext';
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

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockMenuItem, 2);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockMenuItem, 1);
    });

    act(() => {
      result.current.updateQuantity('1', 3);
    });

    expect(result.current.cartItems[0].quantity).toBe(3);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockMenuItem, 1);
    });

    act(() => {
      result.current.removeFromCart('1');
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it('calculates cart total correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockMenuItem, 2);
    });

    expect(result.current.getCartTotal()).toBe(25.98);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockMenuItem, 1);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
  });
});
