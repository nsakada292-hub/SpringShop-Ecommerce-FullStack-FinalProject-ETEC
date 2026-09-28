package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.dto.request.ChangePasswordRequest;
import com.example.SpringShop_Backend.dto.request.UserRegisterRequest;
import com.example.SpringShop_Backend.dto.request.UserUpdateRequest;
import com.example.SpringShop_Backend.dto.response.UserResponse;
import com.example.SpringShop_Backend.entity.User;
import com.example.SpringShop_Backend.enumm.Role;
import com.example.SpringShop_Backend.exception.BadRequestException;
import com.example.SpringShop_Backend.exception.NotFoundException;
import com.example.SpringShop_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;
    private final InputSanitizer inputSanitizer;
    private final FileValidator fileValidator;

    private static final String AVATAR_UPLOAD_DIR = "uploads/avatars";
    private static final String BASE_URL = "http://localhost:8080";

    @Override
    public UserResponse register(UserRegisterRequest userRegisterRequest) {

        passwordPolicy.validate(userRegisterRequest.getPassword());

        if (userRepository.existsByEmail(userRegisterRequest.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .name(inputSanitizer.sanitize(userRegisterRequest.getName()))
                .email(userRegisterRequest.getEmail())
                .password(passwordEncoder.encode(userRegisterRequest.getPassword()))
                .role(Role.USER)
                .build();

        user = userRepository.save(user);

        return toResponse(user);
    }

    @Override
    public UserResponse getMyProfile() {

        User user = getCurrentUser();

        return toResponse(user);
    }

    @Override
    public UserResponse updateMyProfile(UserUpdateRequest userUpdateRequest) {

        User user = getCurrentUser();

        if (!user.getEmail().equals(userUpdateRequest.getEmail())
                && userRepository.existsByEmail(userUpdateRequest.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        user.setName(inputSanitizer.sanitize(userUpdateRequest.getName()));
        user.setEmail(userUpdateRequest.getEmail());
        user.setPhone(sanitizeNullable(userUpdateRequest.getPhone()));
        user.setBio(sanitizeMultilineNullable(userUpdateRequest.getBio()));
        user.setAddress(sanitizeNullable(userUpdateRequest.getAddress()));
        user.setGender(sanitizeNullable(userUpdateRequest.getGender()));
        user.setDateOfBirth(userUpdateRequest.getDateOfBirth());

        user = userRepository.save(user);

        return toResponse(user);
    }

    @Override
    public UserResponse updateMyAvatar(MultipartFile file) throws IOException {

        User user = getCurrentUser();

        String avatarUrl = saveAvatarFile(file);
        user.setAvatarUrl(avatarUrl);

        user = userRepository.save(user);

        return toResponse(user);
    }

    private String sanitizeNullable(String value) {
        return inputSanitizer.sanitize(value);
    }

    private String sanitizeMultilineNullable(String value) {
        return inputSanitizer.sanitizeMultiline(value);
    }

    private String saveAvatarFile(MultipartFile file) throws IOException {

        fileValidator.validateImage(file);

        String fileName = file.getOriginalFilename();
        String savedName = UUID.randomUUID().toString() + "-" + fileName;

        Path path = Paths.get(AVATAR_UPLOAD_DIR);

        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        Files.copy(file.getInputStream(), path.resolve(savedName));

        return BASE_URL + "/uploads/avatars/" + savedName;
    }

    @Override
    public void changePassword(ChangePasswordRequest changePasswordRequest) {

        User user = getCurrentUser();

        boolean matches = passwordEncoder.matches(
                changePasswordRequest.getCurrentPassword(),
                user.getPassword()
        );

        if (!matches) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (changePasswordRequest.getNewPassword().equals(changePasswordRequest.getCurrentPassword())) {
            throw new BadRequestException("New password must be different from the current password");
        }

        passwordPolicy.validate(changePasswordRequest.getNewPassword());

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));

        userRepository.save(user);
    }

    @Override
    public UserResponse getById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return toResponse(user);
    }

    @Override
    public List<UserResponse> getAll() {

        List<User> users = userRepository.findAll();
        List<UserResponse> responses = new ArrayList<>();

        for (User user : users) {
            responses.add(toResponse(user));
        }

        return responses;
    }

    @Override
    public UserResponse updateRole(Long id, Role role) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        User currentUser = getCurrentUser();

        if (user.getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot change your own role");
        }

        user.setRole(role);
        user = userRepository.save(user);

        return toResponse(user);
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private UserResponse toResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .bio(user.getBio())
                .address(user.getAddress())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }
}