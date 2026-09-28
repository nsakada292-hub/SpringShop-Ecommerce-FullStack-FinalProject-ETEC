package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.OrderRequest;
import com.example.SpringShop_Backend.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(OrderRequest orderRequest);

    OrderResponse getById(Long id);

    List<OrderResponse> getMyOrders();

    List<OrderResponse> getAll();

    OrderResponse updateStatus(Long id, String status);

    void cancelOrder(Long id);
}