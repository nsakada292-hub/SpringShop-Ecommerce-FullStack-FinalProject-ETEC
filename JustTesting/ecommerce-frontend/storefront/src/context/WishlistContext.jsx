import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getWishlist()
      .then((res) => {
        if (active) setProducts(res.data || []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isInWishlist = useCallback(
    (productId) => products.some((p) => p.id === productId),
    [products]
  );

  const toggleWishlist = useCallback(
    async (productId, product) => {
      const wasLoved = products.some((p) => p.id === productId);
      // Optimistic update.
      if (wasLoved) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else if (product) {
        setProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
      }
      try {
        if (wasLoved) {
          await removeFromWishlist(productId);
        } else {
          await addToWishlist(product || { id: productId });
        }
      } catch {
        // Re-sync from the source of truth.
        const res = await getWishlist();
        setProducts(res.data || []);
      }
    },
    [products]
  );

  const removeItem = useCallback(
    async (productId) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      try {
        await removeFromWishlist(productId);
      } catch {
        const res = await getWishlist();
        setProducts(res.data || []);
      }
    },
    []
  );

  const count = useMemo(() => products.length, [products]);

  const value = useMemo(
    () => ({
      products,
      loading,
      count,
      isInWishlist,
      toggleWishlist,
      removeItem,
      fetchWishlist: () => getWishlist().then((res) => setProducts(res.data || [])),
    }),
    [products, loading, count, isInWishlist, toggleWishlist, removeItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}