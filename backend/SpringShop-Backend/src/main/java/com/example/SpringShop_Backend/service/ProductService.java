package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.DiscountRequest;
import com.example.SpringShop_Backend.dto.request.ProductRequest;
import com.example.SpringShop_Backend.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ProductService {

    ProductResponse create(ProductRequest productRequest, MultipartFile file) throws IOException;

    ProductResponse update(Long id, ProductRequest productRequest, MultipartFile file) throws IOException;

    ProductResponse updateDiscount(Long id, DiscountRequest discountRequest);

    List<ProductResponse> updateDiscountByCategory(Long categoryId, DiscountRequest discountRequest);

    void delete(Long id);

    ProductResponse getById(Long id);

    List<ProductResponse> getAll();

    List<ProductResponse> getByCategory(Long categoryId);

    List<ProductResponse> search(String keyword);
}