package com.example.SpringShop_Backend.controller;

import com.example.SpringShop_Backend.dto.request.ChangePasswordRequest;
import com.example.SpringShop_Backend.dto.request.UserRoleRequest;
import com.example.SpringShop_Backend.dto.request.UserUpdateRequest;
import com.example.SpringShop_Backend.dto.response.CouponResponse;
import com.example.SpringShop_Backend.dto.response.UserResponse;
import com.example.SpringShop_Backend.service.CouponService;
import com.example.SpringShop_Backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final CouponService couponService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {

        UserResponse response = userService.getMyProfile();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(@RequestBody @Valid UserUpdateRequest userUpdateRequest) {

        UserResponse response = userService.updateMyProfile(userUpdateRequest);

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateMyAvatar(@RequestParam("file") MultipartFile file) throws IOException {

        UserResponse response = userService.updateMyAvatar(file);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid ChangePasswordRequest changePasswordRequest) {

        userService.changePassword(changePasswordRequest);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/coupons")
    public ResponseEntity<List<CouponResponse>> getMyCoupons() {

        List<CouponResponse> responses = couponService.getMyCoupons();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable @Positive(message = "Invalid user ID") Long id) {

        UserResponse response = userService.getById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {

        List<UserResponse> responses = userService.getAll();

        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(@PathVariable @Positive(message = "Invalid user ID") Long id,
                                                   @RequestBody @Valid UserRoleRequest userRoleRequest) {

        UserResponse response = userService.updateRole(id, userRoleRequest.getRole());

        return ResponseEntity.ok(response);
    }
}