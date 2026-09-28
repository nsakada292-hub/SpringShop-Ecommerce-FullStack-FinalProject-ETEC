package com.example.SpringShop_Backend.repository;

import com.example.SpringShop_Backend.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUser_Id(Long userId);

    Optional<WishlistItem> findByUser_IdAndProduct_Id(Long userId, Long productId);
}