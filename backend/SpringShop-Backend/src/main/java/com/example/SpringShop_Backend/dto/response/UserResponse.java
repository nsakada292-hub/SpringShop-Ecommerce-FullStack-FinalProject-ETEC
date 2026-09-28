package com.example.SpringShop_Backend.dto.response;

import com.example.SpringShop_Backend.enumm.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String bio;
    private String address;
    private String gender;
    private LocalDate dateOfBirth;
    private String avatarUrl;
    private Role role;
}