package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.CategoryRequest;
import com.example.SpringShop_Backend.dto.response.CategoryResponse;
import com.example.SpringShop_Backend.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@RequestBody @Valid CategoryRequest categoryRequest) {

        CategoryResponse response = categoryService.create(categoryRequest);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable @Positive(message = "Invalid category ID") Long id,
            @RequestBody @Valid CategoryRequest categoryRequest
    ) {

        CategoryResponse response = categoryService.update(id, categoryRequest);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive(message = "Invalid category ID") Long id) {

        categoryService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable @Positive(message = "Invalid category ID") Long id) {

        CategoryResponse response = categoryService.getById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll() {

        List<CategoryResponse> responses = categoryService.getAll();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/top-level")
    public ResponseEntity<List<CategoryResponse>> getTopLevel() {

        List<CategoryResponse> responses = categoryService.getTopLevel();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<CategoryResponse>> getSubCategories(@PathVariable @Positive(message = "Invalid category ID") Long id) {

        List<CategoryResponse> responses = categoryService.getSubCategories(id);

        return ResponseEntity.ok(responses);
    }
}