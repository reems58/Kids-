USE kids_learning;

-- Add stars column to sessions table
ALTER TABLE sessions 
ADD COLUMN stars INT(11) DEFAULT 0 COMMENT 'Stars from 1 to 5' AFTER completed_percentage;

-- Add total_stars and title columns to children table
ALTER TABLE children 
ADD COLUMN total_stars INT(11) DEFAULT 0 COMMENT 'Total stars' AFTER total_time,
ADD COLUMN title VARCHAR(50) DEFAULT NULL COMMENT 'Current title' AFTER total_stars;

-- Create index for better performance
CREATE INDEX idx_children_total_stars ON children(total_stars);

