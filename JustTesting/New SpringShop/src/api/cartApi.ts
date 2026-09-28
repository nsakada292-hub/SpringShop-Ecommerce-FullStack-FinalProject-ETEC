import axiosClient from './axiosClient';
import { Cart, Product } from '../types';

export const cartApi = {
  getMyCart: async () => {
    const res = await axiosClient.get<Cart>('/cart');
    return res.data;
  },

  addItem: async (productId: number, quantity: number = 1) => {
    const res = await axiosClient.post<Cart>('/cart/items', { productId, quantity });
    return res.data;
  },

  updateItemQuantity: async (cartItemId: number, quantity: number) => {
    const res = await axiosClient.put<Cart>(`/cart/items/${cartItemId}`, null, {
      params: { quantity }
    });
    return res.data;
  },

  removeItem: async (cartItemId: number) => {
    const res = await axiosClient.delete<Cart>(`/cart/items/${cartItemId}`);
    return res.data;
  },

  clearMyCart: async () => {
    await axiosClient.delete('/cart');
  }
};

export const wishlistApi = {
  getWishlist: async () => {
    const res = await axiosClient.get<Product[]>('/wishlist');
    return res.data;
  },

  toggleWishlist: async (productId: number, isLoved: boolean) => {
    if (isLoved) {
      const res = await axiosClient.delete<Product[]>(`/wishlist/${productId}`);
      return res.data;
    } else {
      const res = await axiosClient.post<Product[]>(`/wishlist/${productId}`);
      return res.data;
    }
  }
};
