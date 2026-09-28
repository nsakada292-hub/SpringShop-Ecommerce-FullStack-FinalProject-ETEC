package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.response.CategoryResponse;
import com.example.SpringShop_Backend.dto.response.ProductResponse;
import com.example.SpringShop_Backend.dto.response.WishlistItemResponse;
import com.example.SpringShop_Backend.entity.Product;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.entity.WishlistItem;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.ProductRepository;
import com.example.SpringShop_Backend.repository.UserRepository;
import com.example.SpringShop_Backend.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public List<WishlistItemResponse> getMyWishlist() {

        User user = getCurrentUser();

        return toResponseList(wishlistItemRepository.findByUser_Id(user.getId()));
    }

    @Override
    public List<WishlistItemResponse> addItem(Long productId) {

        User user = getCurrentUser();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        boolean alreadyAdded = wishlistItemRepository
                .findByUser_IdAndProduct_Id(user.getId(), productId)
                .isPresent();

        if (!alreadyAdded) {
            wishlistItemRepository.save(WishlistItem.builder()
                    .user(user)
                    .product(product)
                    .build());
        }

        return getMyWishlist();
    }

    @Override
    public List<WishlistItemResponse> removeItem(Long productId) {

        User user = getCurrentUser();

        wishlistItemRepository.findByUser_IdAndProduct_Id(user.getId(), productId)
                .ifPresent(wishlistItemRepository::delete);

        return getMyWishlist();
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private List<WishlistItemResponse> toResponseList(List<WishlistItem> wishlistItems) {

        List<WishlistItemResponse> responses = new ArrayList<>();

        for (WishlistItem item : wishlistItems) {

            WishlistItemResponse response = WishlistItemResponse.builder()
                    .id(item.getId())
                    .product(toProductResponse(item.getProduct()))
                    .addedAt(item.getCreatedAt())
                    .build();

            responses.add(response);
        }

        return responses;
    }

    private ProductResponse toProductResponse(Product product) {

        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .categoryName(product.getCategory().getCategoryName())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .category(categoryResponse)
                .size(product.getSize())
                .color(product.getColor())
                .material(product.getMaterial())
                .image(product.getImage())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}