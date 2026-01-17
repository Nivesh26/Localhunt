package com.localhunts.backend.repository;

import com.localhunts.backend.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndOtpCodeAndUsedFalse(String email, String otpCode);
    
    Optional<Otp> findFirstByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
    
    @Modifying
    @Transactional
    @Query("UPDATE Otp o SET o.used = true WHERE o.email = :email AND o.used = false")
    void markAllAsUsedByEmail(@Param("email") String email);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Otp o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(LocalDateTime now);
}
