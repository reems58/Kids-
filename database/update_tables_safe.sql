-- كود تعديل الجداول الموجودة (نسخة آمنة)
-- هذا الملف يتعامل مع الأخطاء بشكل أفضل
-- استخدمه إذا ظهرت أخطاء في الملف السابق

USE kids_learning;

-- ============================================
-- 1. تعديل جدول Tasks
-- ============================================
-- التحقق من وجود parent_id قبل الإضافة
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'kids_learning' 
AND TABLE_NAME = 'tasks' 
AND COLUMN_NAME = 'parent_id';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tasks ADD COLUMN parent_id INT(11) DEFAULT NULL AFTER task_id',
    'SELECT "parent_id already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- التحقق من وجود child_id قبل الإضافة
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'kids_learning' 
AND TABLE_NAME = 'tasks' 
AND COLUMN_NAME = 'child_id';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tasks ADD COLUMN child_id INT(11) DEFAULT NULL AFTER parent_id',
    'SELECT "child_id already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- إضافة الفهارس
ALTER TABLE tasks ADD INDEX parent_id_idx (parent_id);
ALTER TABLE tasks ADD INDEX child_id_idx (child_id);

-- إضافة المفاتيح الخارجية (قد تظهر أخطاء إذا كانت موجودة - يمكن تجاهلها)
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_parent 
FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_child 
FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 2. تعديل جدول Badges
-- ============================================
-- حذف min_value
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'kids_learning' 
AND TABLE_NAME = 'badges' 
AND COLUMN_NAME = 'min_value';

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE badges DROP COLUMN min_value',
    'SELECT "min_value does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- حذف max_value
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'kids_learning' 
AND TABLE_NAME = 'badges' 
AND COLUMN_NAME = 'max_value';

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE badges DROP COLUMN max_value',
    'SELECT "max_value does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. تعديل جدول Reports
-- ============================================
-- التحقق من وجود pages_rendered قبل التغيير
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'kids_learning' 
AND TABLE_NAME = 'reports' 
AND COLUMN_NAME = 'pages_rendered';

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE reports CHANGE COLUMN pages_rendered badges_earned INT(11) DEFAULT 0 COMMENT "الشارات المكتسبة"',
    'SELECT "pages_rendered does not exist or already changed" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

