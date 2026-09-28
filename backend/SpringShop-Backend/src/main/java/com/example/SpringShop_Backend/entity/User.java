package com.example.SpringShop_Backend.entity;

import com.example.SpringShop_Backend.enumm.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String phone;

    @Column(length = 1000)
    private String bio;

    @Column(length = 500)
    private String address;

    private String gender;

    private LocalDate dateOfBirth;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String otpCode;

    private LocalDateTime otpExpiryTime;

    @Column(columnDefinition = "integer default 0")
    private Integer otpAttempts;

    @Column(columnDefinition = "integer default 0")
    private Integer loginAttempts;

    private LocalDateTime lockoutTime;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean verified;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
