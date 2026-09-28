package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.ReviewRequest;
import com.example.SpringShop_Backend.dto.response.ReviewResponse;
import com.example.SpringShop_Backend.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Validated
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> create(@RequestBody @Valid ReviewRequest reviewRequest) {

        ReviewResponse response = reviewService.create(reviewRequest);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> update(
            @PathVariable @Positive(message = "Invalid review ID") Long id,
            @RequestBody @Valid ReviewRequest reviewRequest
    ) {

        ReviewResponse response = reviewService.update(id, reviewRequest);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive(message = "Invalid review ID") Long id) {

        reviewService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getByProduct(@PathVariable @Positive(message = "Invalid product ID") Long productId) {

        List<ReviewResponse> responses = reviewService.getByProduct(productId);

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable @Positive(message = "Invalid product ID") Long productId) {

        Double average = reviewService.getAverageRating(productId);

        return ResponseEntity.ok(average);
    }
}