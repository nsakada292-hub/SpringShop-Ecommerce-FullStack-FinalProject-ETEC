package com.example.SpringShop_Backend.repository;

import com.example.SpringShop_Backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProduct_Id(Long productId);

    Optional<Review> findByUser_IdAndProduct_Id(Long userId, Long productId);
}