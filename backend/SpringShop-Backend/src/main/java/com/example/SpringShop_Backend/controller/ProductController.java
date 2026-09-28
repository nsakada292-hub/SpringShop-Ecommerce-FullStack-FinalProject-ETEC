package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.DiscountRequest;
import com.example.SpringShop_Backend.dto.request.ProductRequest;
import com.example.SpringShop_Backend.dto.response.ProductResponse;
import com.example.SpringShop_Backend.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> create(
            @ModelAttribute @Valid ProductRequest productRequest,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        ProductResponse response = productService.create(productRequest, file);

        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> update(
            @PathVariable @Positive(message = "Invalid product ID") Long id,
            @ModelAttribute @Valid ProductRequest productRequest,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {

        ProductResponse response = productService.update(id, productRequest, file);

        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}/discount")
    public ResponseEntity<ProductResponse> updateDiscount(
            @PathVariable @Positive(message = "Invalid product ID") Long id,
            @RequestBody @Valid DiscountRequest discountRequest) {

        ProductResponse response = productService.updateDiscount(id, discountRequest);

        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/category/{categoryId}/discount")
    public ResponseEntity<List<ProductResponse>> updateDiscountByCategory(
            @PathVariable @Positive(message = "Invalid category ID") Long categoryId,
            @RequestBody @Valid DiscountRequest discountRequest) {

        List<ProductResponse> responses = productService.updateDiscountByCategory(categoryId, discountRequest);

        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive(message = "Invalid product ID") Long id) {

        productService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable @Positive(message = "Invalid product ID") Long id) {

        ProductResponse response = productService.getById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {

        List<ProductResponse> responses = productService.getAll();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getByCategory(@PathVariable @Positive(message = "Invalid category ID") Long categoryId) {

        List<ProductResponse> responses = productService.getByCategory(categoryId);

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> search(
            @RequestParam @NotBlank(message = "Search keyword is required")
            @Size(min = 1, max = 100, message = "Search keyword must be between 1 and 100 characters") String keyword) {

        List<ProductResponse> responses = productService.search(keyword);

        return ResponseEntity.ok(responses);
    }
}