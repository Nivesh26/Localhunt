-- Add vendor like support to review_likes table
-- This migration adds liked_by_type and vendor_id columns

-- Step 1: Add liked_by_type column (default to 'USER' for existing records)
ALTER TABLE review_likes 
ADD COLUMN liked_by_type VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Step 2: Make user_id nullable (since vendor_id will be used for vendor likes)
ALTER TABLE review_likes 
MODIFY COLUMN user_id BIGINT NULL;

-- Step 3: Add vendor_id column (nullable, only set when liked_by_type is 'VENDOR')
ALTER TABLE review_likes 
ADD COLUMN vendor_id BIGINT NULL;

-- Step 4: Add foreign key constraint for vendor_id
ALTER TABLE review_likes 
ADD CONSTRAINT FK_review_likes_vendor 
FOREIGN KEY (vendor_id) REFERENCES sellers(id) ON DELETE CASCADE;

-- Step 5: Add unique constraint for vendor likes (vendor can like a review only once)
ALTER TABLE review_likes 
ADD UNIQUE KEY unique_vendor_review (vendor_id, review_id);

-- Step 6: Update existing constraint to allow NULL user_id
-- Note: MySQL doesn't support modifying unique constraints directly, 
-- so we may need to drop and recreate if needed
-- For now, the existing unique constraint on (user_id, review_id) will work with NULL values
