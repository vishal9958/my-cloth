// context/CartContext.js (FIXED PRICE CALCULATION)

import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null); 

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const addToCart = (product, size, color) => {
    const newItem = {
      id: Date.now().toString(),
      ...product,
      selectedSize: size,
      selectedColor: color,
    };
    setCartItems([...cartItems, newItem]);
    showToast(`✅ Added to Cart!`);
  };

  const removeFromCart = (cartId) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== cartId));
    showToast("🗑️ Item Removed");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // --- PRICE FIX LOGIC ---
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // Ye line kisi bhi text (jaise "Rs.", ",", " ") ko hata degi aur sirf number legi
      const priceString = String(item.price).replace(/[^0-9]/g, ''); 
      const priceValue = parseInt(priceString, 10);
      
      // Agar price NaN (gadbad) hai to 0 maano
      return total + (isNaN(priceValue) ? 0 : priceValue);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getTotalPrice, notification }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);