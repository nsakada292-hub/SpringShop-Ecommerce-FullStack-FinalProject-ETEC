import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cartService";
import { normalizeCart } from "../utils/productMapping";
import { getCachedProduct } from "../services/productService";
import { readStore, writeStore } from "../utils/localStore";

export const CartContext = createContext(null);

const LOCAL_CART_KEY = "cart";

function imageFor(productId) {
  return getCachedProduct(productId)?.image || "";
}

function localItem(item) {
  return {
    id: item.productId,
    productId: item.productId,
    name: item.name || item.productName || item.product?.name || "Product",
    price: Number(item.price ?? item.productPrice ?? item.product?.price ?? 0),
    quantity: Number(item.quantity ?? 1),
    image: item.image || item.product?.image || imageFor(item.productId),
    size: item.size ?? null,
    color: item.color ?? null,
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Guest cart lives in localStorage (the backend cart is
  // authenticated-only). It is loaded on mount / when logging out.
  const loadLocal = useCallback(() => {
    setItems(readStore(LOCAL_CART_KEY, []));
  }, []);

  const persistLocal = useCallback((next) => {
    setItems(next);
    writeStore(LOCAL_CART_KEY, next);
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCart();
      const cart = normalizeCart(res.data, imageFor);
      setItems(cart.items);
      return cart;
    } catch {
      setItems([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      loadLocal();
    }
  }, [isAuthenticated, fetchCart, loadLocal]);

  const addItem = useCallback(
    async (item) => {
      if (isAuthenticated) {
        const res = await addToCart({
          productId: item.productId,
          quantity: item.quantity || 1,
        });
        await fetchCart();
        return res.data;
      }
      const next = [...items];
      const existing = next.find(
        (i) => i.productId === item.productId && (i.size || null) === (item.size || null)
      );
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        next.unshift(localItem(item));
      }
      persistLocal(next);
      return null;
    },
    [isAuthenticated, items, fetchCart, persistLocal]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      if (isAuthenticated) {
        const res = await updateCartItem(itemId, quantity);
        await fetchCart();
        return res.data;
      }
      const next = items.map((i) =>
        i.id === itemId
          ? { ...i, quantity: Number(quantity) > 0 ? Number(quantity) : i.quantity }
          : i
      );
      persistLocal(next.filter((i) => i.quantity > 0));
      return null;
    },
    [isAuthenticated, items, fetchCart, persistLocal]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (isAuthenticated) {
        try {
          await removeCartItem(itemId);
        } catch {
          // keep going; back-end may already be inconsistent
        }
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return;
      }
      persistLocal(items.filter((i) => i.id !== itemId));
    },
    [isAuthenticated, items, persistLocal]
  );

  const clearLocalCart = useCallback(() => {
    persistLocal([]);
  }, [persistLocal]);

  const clear = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearCart();
      } catch {
        // ignore
      }
    }
    persistLocal([]);
  }, [isAuthenticated, persistLocal]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      addItem,
      updateItem,
      removeItem,
      clear,
      totalItems,
      totalPrice,
      fetchCart,
      isAuthenticated,
    }),
    [items, loading, addItem, updateItem, removeItem, clear, totalItems, totalPrice, fetchCart, isAuthenticated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}