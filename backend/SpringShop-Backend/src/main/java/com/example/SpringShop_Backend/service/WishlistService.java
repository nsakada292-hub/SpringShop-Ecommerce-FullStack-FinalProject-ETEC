package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.response.WishlistItemResponse;

import java.util.List;

public interface WishlistService {

    List<WishlistItemResponse> getMyWishlist();

    List<WishlistItemResponse> addItem(Long productId);

    List<WishlistItemResponse> removeItem(Long productId);
}