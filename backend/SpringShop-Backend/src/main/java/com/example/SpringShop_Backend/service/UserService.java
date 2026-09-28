package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.ChangePasswordRequest;
import com.example.SpringShop_Backend.dto.request.UserRegisterRequest;
import com.example.SpringShop_Backend.dto.request.UserUpdateRequest;
import com.example.SpringShop_Backend.dto.response.UserResponse;
import com.example.SpringShop_Backend.enumm.Role;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserService {

    UserResponse register(UserRegisterRequest userRegisterRequest);

    UserResponse getMyProfile();

    UserResponse updateMyProfile(UserUpdateRequest userUpdateRequest);

    UserResponse updateMyAvatar(MultipartFile file) throws IOException;

    void changePassword(ChangePasswordRequest changePasswordRequest);

    UserResponse getById(Long id);

    List<UserResponse> getAll();

    UserResponse updateRole(Long id, Role role);
}