import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useOrder } from '../../contexts/OrderContext';
import { CheckoutForm } from './CheckoutForm';
import { OrderSummary } from './OrderSummary';
import type { Customer } from '../../types/index';
import apiClient from '../../services/api';
import { ErrorMessage } from '../shared/ErrorMessage';

export const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { setCurrentOrder } = useOrder();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate]);

  const handleSubmit = async (customer: Customer) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const orderData = {
        items: cartItems.map((item) => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity,
        })),
        customer,
      };

      const order = await apiClient.createOrder(orderData);
      setCurrentOrder(order);
      clearCart();
      navigate(`/order-success/${order.orderNumber}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  const total = getCartTotal();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      {error && <ErrorMessage message={error} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
        <div>
          <OrderSummary items={cartItems} total={total} />
        </div>
      </div>
    </div>
  );
};
