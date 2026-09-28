package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.ReviewRequest;
import com.example.SpringShop_Backend.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse create(ReviewRequest reviewRequest);

    ReviewResponse update(Long id, ReviewRequest reviewRequest);

    void delete(Long id);

    List<ReviewResponse> getByProduct(Long productId);

    Double getAverageRating(Long productId);
}