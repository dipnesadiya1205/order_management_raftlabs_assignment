import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { Layout } from './components/shared/Layout';
import { MenuPage } from './components/menu/MenuPage';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/order/OrderTrackingPage';
import { OrderSuccessPage } from './components/order/OrderSuccessPage';

function App() {
  return (
    <Router>
      <CartProvider>
        <OrderProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/track" element={<OrderTrackingPage />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
            </Routes>
          </Layout>
        </OrderProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
