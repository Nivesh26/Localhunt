package com.localhunts.backend.repository;

import com.localhunts.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByContactEmail(String email);
    boolean existsByContactEmail(String email);
    List<Seller> findByApprovedFalse();
}
