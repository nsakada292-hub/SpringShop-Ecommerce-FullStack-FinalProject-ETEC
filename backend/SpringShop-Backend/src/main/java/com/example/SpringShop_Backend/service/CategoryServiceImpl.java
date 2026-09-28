package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.CategoryRequest;
import com.example.SpringShop_Backend.dto.response.CategoryResponse;
import com.example.SpringShop_Backend.entity.Category;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final InputSanitizer inputSanitizer;

    @Override
    public CategoryResponse create(CategoryRequest categoryRequest) {

        Category parentCategory = null;

        if (categoryRequest.getParentCategoryId() != null) {
            parentCategory = categoryRepository.findById(categoryRequest.getParentCategoryId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found"));
        }

        Category category = Category.builder()
                .categoryName(inputSanitizer.sanitize(categoryRequest.getCategoryName()))
                .parentCategory(parentCategory)
                .description(inputSanitizer.sanitizeMultiline(categoryRequest.getDescription()))
                .build();

        category = categoryRepository.save(category);

        return toResponse(category);
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest categoryRequest) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        Category parentCategory = null;

        if (categoryRequest.getParentCategoryId() != null) {
            parentCategory = categoryRepository.findById(categoryRequest.getParentCategoryId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found"));
        }

        category.setCategoryName(inputSanitizer.sanitize(categoryRequest.getCategoryName()));
        category.setParentCategory(parentCategory);
        category.setDescription(inputSanitizer.sanitizeMultiline(categoryRequest.getDescription()));

        category = categoryRepository.save(category);

        return toResponse(category);
    }

    @Override
    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        categoryRepository.delete(category);
    }

    @Override
    public CategoryResponse getById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        return toResponse(category);
    }

    @Override
    public List<CategoryResponse> getAll() {

        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponse> responses = new ArrayList<>();

        for (Category category : categories) {
            responses.add(toResponse(category));
        }

        return responses;
    }

    @Override
    public List<CategoryResponse> getTopLevel() {

        List<Category> categories = categoryRepository.findByParentCategoryIsNull();
        List<CategoryResponse> responses = new ArrayList<>();

        for (Category category : categories) {
            responses.add(toResponse(category));
        }

        return responses;
    }

    @Override
    public List<CategoryResponse> getSubCategories(Long parentCategoryId) {

        List<Category> categories = categoryRepository.findByParentCategory_Id(parentCategoryId);
        List<CategoryResponse> responses = new ArrayList<>();

        for (Category category : categories) {
            responses.add(toResponse(category));
        }

        return responses;
    }

    private CategoryResponse toResponse(Category category) {

        Long parentId = null;

        if (category.getParentCategory() != null) {
            parentId = category.getParentCategory().getId();
        }

        return CategoryResponse.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .parentCategoryId(parentId)
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}