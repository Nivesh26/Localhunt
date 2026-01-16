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
            String checkTableSql = "SELECT COUNT(*) FROM information_schema.TABLES " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivered'";
            
            Integer tableExists = jdbcTemplate.queryForObject(checkTableSql, Integer.class);
            
            if (tableExists != null && tableExists > 0) {
                // Modify user_id to allow NULL
                try {
                    jdbcTemplate.execute("ALTER TABLE delivered MODIFY COLUMN user_id BIGINT NULL");
                    System.out.println("✓ Modified delivered.user_id to allow NULL");
                } catch (Exception e) {
                    System.out.println("Note: user_id column modification: " + e.getMessage());
                }
                
                // Modify product_id to allow NULL
                try {
                    jdbcTemplate.execute("ALTER TABLE delivered MODIFY COLUMN product_id BIGINT NULL");
                    System.out.println("✓ Modified delivered.product_id to allow NULL");
                } catch (Exception e) {
                    System.out.println("Note: product_id column modification: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            // Log error but don't fail application startup
            System.err.println("Warning: Could not cleanup old address columns or modify delivered table: " + e.getMessage());
        }
    }
}
