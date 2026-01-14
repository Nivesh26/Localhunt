package com.localhunts.backend.repository;

import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySeller(Seller seller);
    List<Product> findByStatus(String status);
    List<Product> findByCategory(String category);
    List<Product> findByStatusAndCategory(String status, String category);
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
}
