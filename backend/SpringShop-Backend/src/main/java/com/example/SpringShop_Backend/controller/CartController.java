package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.CartItemRequest;
import com.example.SpringShop_Backend.dto.response.CartResponse;
import com.example.SpringShop_Backend.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Validated
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart() {

        CartResponse response = cartService.getMyCart();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@RequestBody @Valid CartItemRequest cartItemRequest) {

        CartResponse response = cartService.addItem(cartItemRequest);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @PathVariable @Positive(message = "Invalid cart item ID") Long cartItemId,
            @RequestParam @NotNull(message = "Quantity is required") Integer quantity
    ) {

        CartResponse response = cartService.updateItemQuantity(cartItemId, quantity);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable @Positive(message = "Invalid cart item ID") Long cartItemId) {

        CartResponse response = cartService.removeItem(cartItemId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearMyCart() {

        cartService.clearMyCart();

        return ResponseEntity.noContent().build();
    }
}