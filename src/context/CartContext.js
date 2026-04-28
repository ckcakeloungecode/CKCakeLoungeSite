'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ckcakelounge_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('ckcakelounge_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant, quantity) => {
    setCart((prevCart) => {
      // Check if item already exists in cart (same product and same variant)
      const existingItemIndex = prevCart.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.variant?.size === variant?.size && 
          item.variant?.flavor === variant?.flavor
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item
        return [...prevCart, { product, variant, quantity, id: Date.now().toString() }];
      }
    });
    
    // Automatically open the cart so they see it was added
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) => 
      prevCart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item)
    );
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.variant ? item.variant.price : item.product.base_price;
    return total + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartTotal, 
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
