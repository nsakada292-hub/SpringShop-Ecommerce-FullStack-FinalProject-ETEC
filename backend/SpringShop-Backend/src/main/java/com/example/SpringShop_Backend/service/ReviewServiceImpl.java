package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.ReviewRequest;
import com.example.SpringShop_Backend.dto.response.ReviewResponse;
import com.example.SpringShop_Backend.entity.Product;
import com.example.SpringShop_Backend.entity.Review;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.ProductRepository;
import com.example.SpringShop_Backend.repository.ReviewRepository;
import com.example.SpringShop_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InputSanitizer inputSanitizer;

    @Override
    public ReviewResponse create(ReviewRequest reviewRequest) {

        User user = getCurrentUser();

        Product product = productRepository.findById(reviewRequest.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Review existing = reviewRepository
                .findByUser_IdAndProduct_Id(user.getId(), product.getId())
                .orElse(null);

        if (existing != null) {
            throw new BadRequestException("You already reviewed this product");
        }

        if (reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(reviewRequest.getRating())
                .comment(inputSanitizer.sanitizeMultiline(reviewRequest.getComment()))
                .build();

        review = reviewRepository.save(review);

        return toResponse(review);
    }

    @Override
    public ReviewResponse update(Long id, ReviewRequest reviewRequest) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        User currentUser = getCurrentUser();

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only edit your own review");
        }

        if (reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        review.setRating(reviewRequest.getRating());
        review.setComment(inputSanitizer.sanitizeMultiline(reviewRequest.getComment()));

        review = reviewRepository.save(review);

        return toResponse(review);
    }

    @Override
    public void delete(Long id) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        User currentUser = getCurrentUser();

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own review");
        }

        reviewRepository.delete(review);
    }

    @Override
    public List<ReviewResponse> getByProduct(Long productId) {

        List<Review> reviews = reviewRepository.findByProduct_Id(productId);
        List<ReviewResponse> responses = new ArrayList<>();

        for (Review review : reviews) {
            responses.add(toResponse(review));
        }

        return responses;
    }

    @Override
    public Double getAverageRating(Long productId) {

        List<Review> reviews = reviewRepository.findByProduct_Id(productId);

        if (reviews.isEmpty()) {
            return 0.0;
        }

        int total = 0;

        for (Review review : reviews) {
            total = total + review.getRating();
        }

        return (double) total / reviews.size();
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private ReviewResponse toResponse(Review review) {

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}