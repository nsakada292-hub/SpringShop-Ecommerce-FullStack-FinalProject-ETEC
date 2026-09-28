package com.example.SpringShop_Backend.repository;

import com.example.SpringShop_Backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    Optional<RefreshToken> findByTokenId(String tokenId);

    List<RefreshToken> findByUser_Id(Long userId);

    List<RefreshToken> findByUser_IdAndRevokedFalse(Long userId);

    void deleteByUser_IdAndRevokedTrue(Long userId);

    boolean existsByTokenHash(String tokenHash);
}
