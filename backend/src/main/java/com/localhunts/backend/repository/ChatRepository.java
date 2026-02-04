package com.localhunts.backend.repository;

import com.localhunts.backend.model.Chat;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    // Get all messages for a conversation (user + seller) - grouped by user-seller, not product
    List<Chat> findByUserAndSellerOrderByCreatedAtAsc(User user, Seller seller);

    // Get messages before a certain message ID (for pagination) - returns in ascending order
    @Query("SELECT c FROM Chat c WHERE c.user = :user AND c.seller = :seller AND c.id < :beforeId ORDER BY c.createdAt ASC")
    List<Chat> findByUserAndSellerAndIdLessThanOrderByCreatedAtAsc(@Param("user") User user, @Param("seller") Seller seller, @Param("beforeId") Long beforeId, Pageable pageable);

    // Get conversations for a seller (all unique users)
    @Query("SELECT DISTINCT c.user FROM Chat c WHERE c.seller = :seller AND c.deletedBySeller = false")
    List<User> findDistinctUsersForSeller(@Param("seller") Seller seller);

    // Get conversations for a user (all unique sellers)
    @Query("SELECT DISTINCT c.seller FROM Chat c WHERE c.user = :user AND c.deletedByUser = false")
    List<Seller> findDistinctSellersForUser(@Param("user") User user);

    // Get unread count for seller with specific user
    @Query("SELECT COUNT(c) FROM Chat c WHERE c.seller = :seller AND c.user = :user AND c.readBySeller = false AND c.deletedBySeller = false AND c.senderType = 'USER'")
    Long countUnreadForSellerWithUser(@Param("seller") Seller seller, @Param("user") User user);

    // Get unread count for user with specific seller
    @Query("SELECT COUNT(c) FROM Chat c WHERE c.user = :user AND c.seller = :seller AND c.readByUser = false AND c.deletedByUser = false AND c.senderType = 'SELLER'")
    Long countUnreadForUserWithSeller(@Param("user") User user, @Param("seller") Seller seller);

    // Get last message for a conversation (user-seller)
    Chat findFirstByUserAndSellerAndDeletedByUserFalseAndDeletedBySellerFalseOrderByCreatedAtDesc(User user, Seller seller);

    // Mark messages as read by seller
    @Modifying
    @Query("UPDATE Chat c SET c.readBySeller = true WHERE c.seller = :seller AND c.user = :user AND c.readBySeller = false")
    void markAsReadBySeller(@Param("seller") Seller seller, @Param("user") User user);

    // Mark messages as read by user
    @Modifying
    @Query("UPDATE Chat c SET c.readByUser = true WHERE c.user = :user AND c.seller = :seller AND c.readByUser = false")
    void markAsReadByUser(@Param("user") User user, @Param("seller") Seller seller);

    List<Chat> findByUser(User user);
    List<Chat> findBySeller(Seller seller);
    List<Chat> findByProduct(Product product);
}
