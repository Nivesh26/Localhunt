package com.localhunts.backend.repository;

import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Review;
import com.localhunts.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProduct(Product product);
    List<Review> findByProductOrderByCreatedAtDesc(Product product);
    Optional<Review> findByUserAndProduct(User user, Product product);
    boolean existsByUserAndProduct(User user, Product product);
    List<Review> findAllByOrderByCreatedAtDesc();
    List<Review> findByProductSellerIdOrderByCreatedAtDesc(Long sellerId);
}
