-- إضافة الأعمدة المطلوبة لجدول badges (آمن - يتحقق من وجود الأعمدة أولاً)
-- نفذ هذا الملف إذا ظهر خطأ أن الأعمدة غير موجودة

USE kids_learning;

-- التحقق من وجود min_value وإضافته إذا لم يكن موجوداً
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'kids_learning' 
    AND TABLE_NAME = 'badges' 
    AND COLUMN_NAME = 'min_value'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE badges ADD COLUMN min_value INT(11) DEFAULT 0 COMMENT ''القيمة الدنيا'' AFTER badge_icon',
    'SELECT ''Column min_value already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- التحقق من وجود max_value وإضافته إذا لم يكن موجوداً
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'kids_learning' 
    AND TABLE_NAME = 'badges' 
    AND COLUMN_NAME = 'max_value'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE badges ADD COLUMN max_value INT(11) DEFAULT 100 COMMENT ''القيمة العليا'' AFTER min_value',
    'SELECT ''Column max_value already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- التحقق من وجود start_value وإضافته إذا لم يكن موجوداً
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'kids_learning' 
    AND TABLE_NAME = 'badges' 
    AND COLUMN_NAME = 'start_value'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE badges ADD COLUMN start_value INT(11) DEFAULT 0 COMMENT ''القيمة الابتدائية'' AFTER max_value',
    'SELECT ''Column start_value already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

