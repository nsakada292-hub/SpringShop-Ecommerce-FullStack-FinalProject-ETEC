package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.CartItemRequest;
import com.example.SpringShop_Backend.dto.response.CartResponse;

public interface CartService {

    CartResponse getMyCart();

    CartResponse addItem(CartItemRequest cartItemRequest);

    CartResponse updateItemQuantity(Long cartItemId, Integer quantity);

    CartResponse removeItem(Long cartItemId);

    void clearMyCart();
}