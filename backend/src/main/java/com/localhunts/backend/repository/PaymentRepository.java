package com.localhunts.backend.repository;

import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUser(User user);
    List<Payment> findByUserId(Long userId);
}
