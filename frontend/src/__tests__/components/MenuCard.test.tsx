import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuCard } from '../../components/menu/MenuCard';
import { CartProvider } from '../../contexts/CartContext';
import { MenuCategory, type MenuItem } from '../../types/index';

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
  beforeEach(() => {
    // Clear cart before each test
    localStorage.clear();
  });

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

  it('adds item to cart when button is clicked', async () => {
    render(
      <CartProvider>
        <MenuCard menuItem={mockMenuItem} />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    // After clicking, quantity controls should appear (item is now in cart)
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('disables button when item is unavailable', () => {
    const unavailableItem = { ...mockMenuItem, isAvailable: false };
    
    render(
      <CartProvider>
        <MenuCard menuItem={unavailableItem} />
      </CartProvider>
    );

    // When unavailable, the button should show "Unavailable" and be disabled
    const button = screen.getByText('Unavailable');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Unavailable');
  });
});
