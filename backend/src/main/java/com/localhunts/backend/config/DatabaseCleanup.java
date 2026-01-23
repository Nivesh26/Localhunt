package com.localhunts.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseCleanup {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void cleanupOldAddressColumns() {
        try {
            // Check if old columns exist before attempting to drop them
            String checkColumnSql = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = 'users' " +
                    "AND COLUMN_NAME IN ('address_line1', 'address_line2', 'postal_code', 'country')";

            Integer columnCount = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);

            if (columnCount != null && columnCount > 0) {
                // Drop old address columns
                String dropSql = "ALTER TABLE users " +
                        "DROP COLUMN IF EXISTS address_line1, " +
                        "DROP COLUMN IF EXISTS address_line2, " +
                        "DROP COLUMN IF EXISTS postal_code, " +
                        "DROP COLUMN IF EXISTS country";
                
                jdbcTemplate.execute(dropSql);
                System.out.println("✓ Old address columns (address_line1, address_line2, postal_code, country) have been removed from users table.");
            } else {
                System.out.println("✓ Old address columns do not exist. Database is up to date.");
            }
            
            // Modify delivered table to allow NULL for user_id and product_id
            // Check if delivered table exists
            String checkDeliveredTableSql = "SELECT COUNT(*) FROM information_schema.TABLES " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivered'";
            
            Integer deliveredTableExists = jdbcTemplate.queryForObject(checkDeliveredTableSql, Integer.class);
            
            if (deliveredTableExists != null && deliveredTableExists > 0) {
                // Modify user_id to allow NULL
                try {
                    jdbcTemplate.execute("ALTER TABLE delivered MODIFY COLUMN user_id BIGINT NULL");
                    System.out.println("✓ Modified delivered.user_id to allow NULL");
                } catch (Exception e) {
                    System.out.println("Note: delivered.user_id column modification: " + e.getMessage());
                }
                
                // Modify product_id to allow NULL
                try {
                    jdbcTemplate.execute("ALTER TABLE delivered MODIFY COLUMN product_id BIGINT NULL");
                    System.out.println("✓ Modified delivered.product_id to allow NULL");
                } catch (Exception e) {
                    System.out.println("Note: delivered.product_id column modification: " + e.getMessage());
                }
            }
            
            // Modify payment table to allow NULL for product_id
            // Check if payment table exists
            String checkPaymentTableSql = "SELECT COUNT(*) FROM information_schema.TABLES " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment'";
            
            Integer paymentTableExists = jdbcTemplate.queryForObject(checkPaymentTableSql, Integer.class);
            
            if (paymentTableExists != null && paymentTableExists > 0) {
                // Modify product_id to allow NULL
                try {
                    jdbcTemplate.execute("ALTER TABLE payment MODIFY COLUMN product_id BIGINT NULL");
                    System.out.println("✓ Modified payment.product_id to allow NULL");
                } catch (Exception e) {
                    System.out.println("Note: payment.product_id column modification: " + e.getMessage());
                }
            }
            
            // Add vendor like support to review_likes table
            // Check if review_likes table exists
            String checkReviewLikesTableSql = "SELECT COUNT(*) FROM information_schema.TABLES " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'review_likes'";
            
            Integer reviewLikesTableExists = jdbcTemplate.queryForObject(checkReviewLikesTableSql, Integer.class);
            
            if (reviewLikesTableExists != null && reviewLikesTableExists > 0) {
                // Check if liked_by_type column exists
                String checkLikedByTypeSql = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() " +
                        "AND TABLE_NAME = 'review_likes' " +
                        "AND COLUMN_NAME = 'liked_by_type'";
                
                Integer likedByTypeExists = jdbcTemplate.queryForObject(checkLikedByTypeSql, Integer.class);
                
                if (likedByTypeExists == null || likedByTypeExists == 0) {
                    // Step 1: Add liked_by_type column (default to 'USER' for existing records)
                    try {
                        jdbcTemplate.execute("ALTER TABLE review_likes ADD COLUMN liked_by_type VARCHAR(20) NOT NULL DEFAULT 'USER'");
                        System.out.println("✓ Added liked_by_type column to review_likes table");
                    } catch (Exception e) {
                        System.out.println("Note: liked_by_type column addition: " + e.getMessage());
                    }
                }
                
                // Step 2: Make user_id nullable (since vendor_id will be used for vendor likes)
                try {
                    jdbcTemplate.execute("ALTER TABLE review_likes MODIFY COLUMN user_id BIGINT NULL");
                    System.out.println("✓ Modified review_likes.user_id to allow NULL");
                } catch (Exception e) {
                    System.out.println("Note: review_likes.user_id column modification: " + e.getMessage());
                }
                
                // Step 3: Check if vendor_id column exists
                String checkVendorIdSql = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() " +
                        "AND TABLE_NAME = 'review_likes' " +
                        "AND COLUMN_NAME = 'vendor_id'";
                
                Integer vendorIdExists = jdbcTemplate.queryForObject(checkVendorIdSql, Integer.class);
                
                if (vendorIdExists == null || vendorIdExists == 0) {
                    // Add vendor_id column (nullable, only set when liked_by_type is 'VENDOR')
                    try {
                        jdbcTemplate.execute("ALTER TABLE review_likes ADD COLUMN vendor_id BIGINT NULL");
                        System.out.println("✓ Added vendor_id column to review_likes table");
                    } catch (Exception e) {
                        System.out.println("Note: vendor_id column addition: " + e.getMessage());
                    }
                }
                
                // Step 4: Add foreign key constraint for vendor_id if it doesn't exist
                try {
                    String checkFkSql = "SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE " +
                            "WHERE TABLE_SCHEMA = DATABASE() " +
                            "AND TABLE_NAME = 'review_likes' " +
                            "AND CONSTRAINT_NAME = 'FK_review_likes_vendor'";
                    
                    Integer fkExists = jdbcTemplate.queryForObject(checkFkSql, Integer.class);
                    
                    if (fkExists == null || fkExists == 0) {
                        jdbcTemplate.execute("ALTER TABLE review_likes " +
                                "ADD CONSTRAINT FK_review_likes_vendor " +
                                "FOREIGN KEY (vendor_id) REFERENCES sellers(id) ON DELETE CASCADE");
                        System.out.println("✓ Added foreign key constraint for review_likes.vendor_id");
                    }
                } catch (Exception e) {
                    System.out.println("Note: Foreign key constraint for vendor_id: " + e.getMessage());
                }
                
                // Step 5: Add unique constraint for vendor likes if it doesn't exist
                try {
                    String checkUniqueSql = "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS " +
                            "WHERE TABLE_SCHEMA = DATABASE() " +
                            "AND TABLE_NAME = 'review_likes' " +
                            "AND CONSTRAINT_NAME = 'unique_vendor_review'";
                    
                    Integer uniqueExists = jdbcTemplate.queryForObject(checkUniqueSql, Integer.class);
                    
                    if (uniqueExists == null || uniqueExists == 0) {
                        jdbcTemplate.execute("ALTER TABLE review_likes " +
                                "ADD UNIQUE KEY unique_vendor_review (vendor_id, review_id)");
                        System.out.println("✓ Added unique constraint for vendor likes");
                    }
                } catch (Exception e) {
                    System.out.println("Note: Unique constraint for vendor likes: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            // Log error but don't fail application startup
            System.err.println("Warning: Could not cleanup old address columns or modify delivered table: " + e.getMessage());
        }
    }
}
