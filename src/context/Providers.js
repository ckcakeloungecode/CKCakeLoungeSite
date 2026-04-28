'use client';

import { CartProvider } from './CartContext';
import FloatingCart from '../components/FloatingCart';

export function Providers({ children }) {
  return (
    <CartProvider>
      {children}
      <FloatingCart />
    </CartProvider>
  );
}
