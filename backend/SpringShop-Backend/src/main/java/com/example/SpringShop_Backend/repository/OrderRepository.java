package com.example.SpringShop_Backend.repository;

import com.example.SpringShop_Backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser_Id(Long userId);

    @Query("select coalesce(max(o.orderNumber), 0) + 1 from Order o where o.user.id = :userId")
    long nextOrderNumber(@Param("userId") Long userId);
}