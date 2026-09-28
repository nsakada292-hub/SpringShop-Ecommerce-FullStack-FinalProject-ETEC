package com.example.SpringShop_Backend.repository;

import com.example.SpringShop_Backend.enumm.PaymentAttemptStatus;
import com.example.SpringShop_Backend.entity.PaymentAttempt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {

    List<PaymentAttempt> findByOrder_IdOrderByIdDesc(Long orderId);

    Optional<PaymentAttempt> findByMd5(String md5);

    long countByOrder_IdAndStatus(Long orderId, PaymentAttemptStatus status);

    /**
     * Unsettled attempts still worth checking, oldest first, for the batch
     * reconciler. Bounded by {@code limit} so one pass cannot try to spend the
     * whole daily budget on a backlog.
     */
    @Query("""
            select a from PaymentAttempt a
            where a.status = com.example.SpringShop_Backend.enumm.PaymentAttemptStatus.PENDING
              and a.md5 is not null
              and a.createdAt >= :since
            order by a.id asc
            """)
    List<PaymentAttempt> findUnsettledSince(@Param("since") LocalDateTime since, Pageable pageable);
}
