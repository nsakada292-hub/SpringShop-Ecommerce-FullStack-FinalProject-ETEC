package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.response.WishlistItemResponse;
import com.example.SpringShop_Backend.service.WishlistService;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Validated
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemResponse>> getMyWishlist() {

        List<WishlistItemResponse> response = wishlistService.getMyWishlist();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<List<WishlistItemResponse>> addItem(
            @PathVariable @Positive(message = "Invalid product ID") Long productId
    ) {

        List<WishlistItemResponse> response = wishlistService.addItem(productId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<List<WishlistItemResponse>> removeItem(
            @PathVariable @Positive(message = "Invalid product ID") Long productId
    ) {

        List<WishlistItemResponse> response = wishlistService.removeItem(productId);

        return ResponseEntity.ok(response);
    }
}