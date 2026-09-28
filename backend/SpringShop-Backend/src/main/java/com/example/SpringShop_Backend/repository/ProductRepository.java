package com.example.SpringShop_Backend.repository;

import com.example.SpringShop_Backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory_Id(Long categoryId);

    List<Product> findByCategory_IdIn(Collection<Long> categoryIds);

    List<Product> findByProductNameContainingIgnoreCase(String keyword);
}