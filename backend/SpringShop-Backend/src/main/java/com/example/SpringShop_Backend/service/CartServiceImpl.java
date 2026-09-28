package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.response.CartItemResponse;
import com.example.SpringShop_Backend.dto.request.CartItemRequest;
import com.example.SpringShop_Backend.dto.response.CartResponse;
import com.example.SpringShop_Backend.entity.Cart;
import com.example.SpringShop_Backend.entity.CartItem;
import com.example.SpringShop_Backend.entity.Product;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.CartItemRepository;
import com.example.SpringShop_Backend.repository.CartRepository;
import com.example.SpringShop_Backend.repository.ProductRepository;
import com.example.SpringShop_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponse getMyCart() {

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        return toResponse(cart);
    }

    @Override
    public CartResponse addItem(CartItemRequest cartItemRequest) {

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(cartItemRequest.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        CartItem existingItem = cartItemRepository
                .findByCart_IdAndProduct_Id(cart.getId(), product.getId())
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + cartItemRequest.getQuantity();
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(cartItemRequest.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return toResponse(cart);
    }

    @Override
    public CartResponse updateItemQuantity(Long cartItemId, Integer quantity) {

        User currentUser = getCurrentUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        if (!cartItem.getCart().getUser().getId().equals(currentUser.getId())) {
            throw new NotFoundException("Cart item not found");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return toResponse(cartItem.getCart());
    }

    @Override
    public CartResponse removeItem(Long cartItemId) {

        User currentUser = getCurrentUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        if (!cartItem.getCart().getUser().getId().equals(currentUser.getId())) {
            throw new NotFoundException("Cart item not found");
        }

        Cart cart = cartItem.getCart();

        cartItemRepository.delete(cartItem);

        return toResponse(cart);
    }

    @Override
    public void clearMyCart() {

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        cartItemRepository.deleteByCart_Id(cart.getId());
    }

    private Cart getOrCreateCart(User user) {

        Cart cart = cartRepository.findByUser_Id(user.getId()).orElse(null);

        if (cart == null) {
            cart = Cart.builder()
                    .user(user)
                    .build();
            cart = cartRepository.save(cart);
        }

        return cart;
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private CartResponse toResponse(Cart cart) {

        List<CartItem> cartItems = cartItemRepository.findByCart_Id(cart.getId());
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem item : cartItems) {

            BigDecimal unitPrice = item.getProduct().salePrice();
            BigDecimal subtotal = unitPrice
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            totalAmount = totalAmount.add(subtotal);

            CartItemResponse itemResponse = CartItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getProductName())
                    .productPrice(unitPrice)
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build();

            itemResponses.add(itemResponse);
        }

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .totalAmount(totalAmount)
                .build();
    }
}