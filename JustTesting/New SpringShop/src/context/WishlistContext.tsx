import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { wishlistApi } from '../api/cartApi';

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isLoved: (productId: number) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isWishlistDrawerOpen: boolean;
  openWishlistDrawer: () => void;
  closeWishlistDrawer: () => void;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);

  const refreshWishlist = useCallback(async () => {
    try {
      const items = await wishlistApi.getWishlist();
      setWishlist(items);
    } catch (err) {
      console.warn('Could not fetch wishlist:', err);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const openWishlistDrawer = () => setIsWishlistDrawerOpen(true);
  const closeWishlistDrawer = () => setIsWishlistDrawerOpen(false);

  const isLoved = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    const loved = isLoved(product.id);
    // Optimistic update
    if (loved) {
      setWishlist(prev => prev.filter(p => p.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }

    try {
      const updated = await wishlistApi.toggleWishlist(product.id, loved);
      setWishlist(updated);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      // Revert if error
      refreshWishlist();
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      isLoved,
      toggleWishlist,
      isWishlistDrawerOpen,
      openWishlistDrawer,
      closeWishlistDrawer,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
