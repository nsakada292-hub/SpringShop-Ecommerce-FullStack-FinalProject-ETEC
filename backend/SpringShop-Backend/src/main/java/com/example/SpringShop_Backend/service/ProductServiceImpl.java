package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.DiscountRequest;
import com.example.SpringShop_Backend.dto.request.ProductRequest;
import com.example.SpringShop_Backend.dto.response.CategoryResponse;
import com.example.SpringShop_Backend.dto.response.ProductResponse;
import com.example.SpringShop_Backend.entity.Category;
import com.example.SpringShop_Backend.entity.Product;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.CategoryRepository;
import com.example.SpringShop_Backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileValidator fileValidator;
    private final InputSanitizer inputSanitizer;

    private static final String UPLOAD_DIR = "uploads/products";
    private static final String BASE_URL = "http://localhost:8080";

    @Override
    public ProductResponse create(ProductRequest productRequest, MultipartFile file) throws IOException {

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        String imageUrl = saveFile(file);

        Product product = Product.builder()
                .productName(inputSanitizer.sanitize(productRequest.getProductName()))
                .description(inputSanitizer.sanitizeMultiline(productRequest.getDescription()))
                .price(productRequest.getPrice())
                .discountPercentage(productRequest.getDiscountPercentage())
                .stockQuantity(productRequest.getStockQuantity())
                .category(category)
                .size(inputSanitizer.sanitize(productRequest.getSize()))
                .color(inputSanitizer.sanitize(productRequest.getColor()))
                .material(inputSanitizer.sanitize(productRequest.getMaterial()))
                .image(imageUrl)
                .build();

        product = productRepository.save(product);

        return toResponse(product);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest productRequest, MultipartFile file) throws IOException {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        product.setProductName(inputSanitizer.sanitize(productRequest.getProductName()));
        product.setDescription(inputSanitizer.sanitizeMultiline(productRequest.getDescription()));
        product.setPrice(productRequest.getPrice());
        product.setDiscountPercentage(productRequest.getDiscountPercentage());
        product.setStockQuantity(productRequest.getStockQuantity());
        product.setCategory(category);
        product.setSize(inputSanitizer.sanitize(productRequest.getSize()));
        product.setColor(inputSanitizer.sanitize(productRequest.getColor()));
        product.setMaterial(inputSanitizer.sanitize(productRequest.getMaterial()));

        if (file != null && !file.isEmpty()) {
            String imageUrl = saveFile(file);
            product.setImage(imageUrl);
        }

        product = productRepository.save(product);

        return toResponse(product);
    }

    @Override
    public ProductResponse updateDiscount(Long id, DiscountRequest discountRequest) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setDiscountPercentage(discountRequest.getDiscountPercentage());
        product = productRepository.save(product);

        return toResponse(product);
    }

    @Override
    public List<ProductResponse> updateDiscountByCategory(Long categoryId, DiscountRequest discountRequest) {

        List<Long> categoryIds = collectCategoryIds(categoryId);
        List<Product> products = productRepository.findByCategory_IdIn(categoryIds);
        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            product.setDiscountPercentage(discountRequest.getDiscountPercentage());
            responses.add(toResponse(productRepository.save(product)));
        }

        return responses;
    }

    @Override
    public void delete(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        productRepository.delete(product);
    }

    @Override
    public ProductResponse getById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        return toResponse(product);
    }

    @Override
    public List<ProductResponse> getAll() {

        List<Product> products = productRepository.findAll();
        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            responses.add(toResponse(product));
        }

        return responses;
    }

    @Override
    public List<ProductResponse> getByCategory(Long categoryId) {

        List<Long> categoryIds = collectCategoryIds(categoryId);
        List<Product> products = productRepository.findByCategory_IdIn(categoryIds);
        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            responses.add(toResponse(product));
        }

        return responses;
    }

    private List<Long> collectCategoryIds(Long categoryId) {

        List<Long> ids = new ArrayList<>();
        List<Long> pending = new ArrayList<>();
        pending.add(categoryId);

        while (!pending.isEmpty()) {

            Long parent = pending.remove(pending.size() - 1);
            if (ids.contains(parent)) {
                continue;
            }
            ids.add(parent);

            List<Category> children = categoryRepository.findByParentCategory_Id(parent);
            for (Category child : children) {
                pending.add(child.getId());
            }
        }

        return ids;
    }

    @Override
    public List<ProductResponse> search(String keyword) {

        List<Product> products = productRepository.findByProductNameContainingIgnoreCase(keyword);
        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            responses.add(toResponse(product));
        }

        return responses;
    }

    private String saveFile(MultipartFile file) throws IOException {

        fileValidator.validateImage(file);

        String fileName = file.getOriginalFilename();
        String savedName = UUID.randomUUID().toString() + "-" + fileName;

        Path path = Paths.get(UPLOAD_DIR);

        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        Files.copy(file.getInputStream(), path.resolve(savedName));

        return BASE_URL + "/uploads/products/" + savedName;
    }

    private ProductResponse toResponse(Product product) {

        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .categoryName(product.getCategory().getCategoryName())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPercentage(product.getDiscountPercentage())
                .salePrice(product.salePrice())
                .stockQuantity(product.getStockQuantity())
                .category(categoryResponse)
                .size(product.getSize())
                .color(product.getColor())
                .material(product.getMaterial())
                .image(product.getImage())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}