-- ============================================
-- الخطوة 1: تحديث جدول المحتوى لدعم الألعاب والفيديوهات
-- ============================================

USE kids_learning;

-- إضافة الحقول الجديدة (سيتم تجاهل الخطأ إذا كانت موجودة)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'kids_learning' 
               AND TABLE_NAME = 'content' 
               AND COLUMN_NAME = 'content_type');

SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE content ADD COLUMN content_type ENUM(''لعبة'', ''فيديو'') DEFAULT ''لعبة'' AFTER content_name_ar',
    'SELECT "Column content_type already exists" AS message');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'kids_learning' 
               AND TABLE_NAME = 'content' 
               AND COLUMN_NAME = 'content_url');

SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE content ADD COLUMN content_url VARCHAR(500) DEFAULT NULL AFTER content_type',
    'SELECT "Column content_url already exists" AS message');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'kids_learning' 
               AND TABLE_NAME = 'content' 
               AND COLUMN_NAME = 'content_category');

SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE content ADD COLUMN content_category ENUM(''عربي'', ''علوم'', ''رياضيات'') DEFAULT NULL AFTER category',
    'SELECT "Column content_category already exists" AS message');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ملاحظة: تم إضافة جميع الحقول المطلوبة

