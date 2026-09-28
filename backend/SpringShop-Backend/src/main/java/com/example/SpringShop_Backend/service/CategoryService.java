package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.CategoryRequest;
import com.example.SpringShop_Backend.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryRequest categoryRequest);

    CategoryResponse update(Long id, CategoryRequest categoryRequest);

    void delete(Long id);

    CategoryResponse getById(Long id);

    List<CategoryResponse> getAll();

    List<CategoryResponse> getTopLevel();

    List<CategoryResponse> getSubCategories(Long parentCategoryId);
}