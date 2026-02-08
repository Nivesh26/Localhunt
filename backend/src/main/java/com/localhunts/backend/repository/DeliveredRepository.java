package com.localhunts.backend.repository;

import com.localhunts.backend.model.Delivered;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveredRepository extends JpaRepository<Delivered, Long> {
    List<Delivered> findByUser(User user);
    List<Delivered> findByUserId(Long userId);
    
    @Query("SELECT d FROM Delivered d WHERE d.product.seller = :seller")
    List<Delivered> findBySeller(@Param("seller") Seller seller);
    List<Delivered> findByProduct(Product product);

    /**
     * Total super admin commission (20% of subtotal) from all delivered orders.
     * Commission is earned only when order is delivered.
     */
    @Query("SELECT COALESCE(SUM(d.subtotal * 0.2), 0) FROM Delivered d")
    Double getTotalAdminCommission();
}
