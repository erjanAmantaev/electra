import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  type CartItem,
  type CartSummary,
} from '../lib/storeApi';

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productSlug: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearAll: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY_CART = {
  items: [] as CartItem[],
  itemCount: 0,
  subtotal: 0,
};

function mapSummary(summary: CartSummary) {
  return {
    items: summary.items,
    itemCount: summary.item_count,
    subtotal: Number(summary.subtotal),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>(EMPTY_CART.items);
  const [itemCount, setItemCount] = useState(EMPTY_CART.itemCount);
  const [subtotal, setSubtotal] = useState(EMPTY_CART.subtotal);
  const [loading, setLoading] = useState(false);

  const resetCart = () => {
    setItems(EMPTY_CART.items);
    setItemCount(EMPTY_CART.itemCount);
    setSubtotal(EMPTY_CART.subtotal);
  };

  const applyCartSummary = (summary: CartSummary) => {
    const mapped = mapSummary(summary);
    setItems(mapped.items);
    setItemCount(mapped.itemCount);
    setSubtotal(mapped.subtotal);
  };

  const refreshCart = async () => {
    if (!isAuthenticated || !token) {
      resetCart();
      return;
    }

    setLoading(true);
    try {
      const summary = await getCart(token);
      applyCartSummary(summary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      resetCart();
      setLoading(false);
      return;
    }

    void refreshCart();
  }, [isAuthenticated, token]);

  const addItemHandler = async (productSlug: string, quantity = 1) => {
    if (!token) {
      throw new Error('Please sign in to add products to your cart.');
    }

    const summary = await addCartItem(token, productSlug, quantity);
    applyCartSummary(summary);
  };

  const updateItemQuantityHandler = async (itemId: number, quantity: number) => {
    if (!token) {
      throw new Error('Please sign in to update your cart.');
    }

    const summary = await updateCartItem(token, itemId, quantity);
    applyCartSummary(summary);
  };

  const removeItemHandler = async (itemId: number) => {
    if (!token) {
      throw new Error('Please sign in to update your cart.');
    }

    const summary = await removeCartItem(token, itemId);
    applyCartSummary(summary);
  };

  const clearAllHandler = async () => {
    if (!token) {
      throw new Error('Please sign in to update your cart.');
    }

    const summary = await clearCart(token);
    applyCartSummary(summary);
  };

  const value: CartContextType = {
    items,
    itemCount,
    subtotal,
    loading,
    refreshCart,
    addItem: addItemHandler,
    updateItemQuantity: updateItemQuantityHandler,
    removeItem: removeItemHandler,
    clearAll: clearAllHandler,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
