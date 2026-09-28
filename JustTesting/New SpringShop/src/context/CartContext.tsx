import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '../types';
import { cartApi } from '../api/cartApi';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  isPulsing: boolean;
  isUpdating: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartApi.getMyCart();
      setCart(data);
    } catch (err) {
      console.warn('Could not fetch cart:', err);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const triggerPulse = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 900);
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const updated = await cartApi.addItem(productId, quantity);
      setCart(updated);
      triggerPulse();
      openCartDrawer();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const updated = await cartApi.updateItemQuantity(cartItemId, quantity);
      setCart(updated);
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const updated = await cartApi.removeItem(cartItemId);
      setCart(updated);
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearMyCart();
      setCart({ id: cart?.id || 0, userId: cart?.userId || 0, items: [], totalAmount: 0 });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart?.totalAmount || 0;

  return (
    <CartContext.Provider value={{
      cart,
      items,
      itemCount,
      totalAmount,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      isPulsing,
      isUpdating,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
