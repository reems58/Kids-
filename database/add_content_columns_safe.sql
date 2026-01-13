-- ============================================
-- إضافة الأعمدة المطلوبة لجدول المحتوى (آمن - يتحقق من وجودها أولاً)
-- ============================================

USE kids_learning;

-- إضافة عمود content_type
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content'
    AND COLUMN_NAME = 'content_type'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE content ADD COLUMN content_type ENUM(''لعبة'', ''فيديو'') DEFAULT ''لعبة'' AFTER content_name_ar',
    'SELECT ''Column content_type already exists'' AS result'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- إضافة عمود content_url
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content'
    AND COLUMN_NAME = 'content_url'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE content ADD COLUMN content_url VARCHAR(500) DEFAULT NULL AFTER content_type',
    'SELECT ''Column content_url already exists'' AS result'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- إضافة عمود content_category
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content'
    AND COLUMN_NAME = 'content_category'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE content ADD COLUMN content_category ENUM(''عربي'', ''علوم'', ''رياضيات'') DEFAULT NULL AFTER category',
    'SELECT ''Column content_category already exists'' AS result'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- تم إضافة جميع الأعمدة المطلوبة

