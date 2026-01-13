-- ============================================
-- نظام المحتوى التعليمي الشامل
-- 3 فئات (عربي، علوم، رياضيات) × 9 أعمار (4-12) × 10 محتويات = 270 محتوى
-- ============================================

USE kids_learning;

-- ============================================
-- 1. تحديث جدول content لإضافة الحقول الجديدة
-- ============================================

-- إضافة الحقول إذا لم تكن موجودة
ALTER TABLE content 
ADD COLUMN content_type ENUM('لعبة', 'فيديو') DEFAULT 'لعبة' AFTER content_name_ar;

ALTER TABLE content 
ADD COLUMN content_url VARCHAR(500) DEFAULT NULL AFTER content_type;

ALTER TABLE content 
ADD COLUMN content_category ENUM('عربي', 'علوم', 'رياضيات') DEFAULT NULL AFTER category;

-- ============================================
-- 2. إنشاء جدول منفصل للمحتوى التعليمي التفصيلي
-- ============================================

CREATE TABLE IF NOT EXISTS educational_content (
    ec_id INT(11) NOT NULL AUTO_INCREMENT,
    content_category ENUM('عربي', 'علوم', 'رياضيات') NOT NULL,
    content_type ENUM('لعبة', 'فيديو') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_url VARCHAR(500),
    age INT(3) NOT NULL,
    icon VARCHAR(50) DEFAULT NULL,
    difficulty ENUM('سهل', 'متوسط', 'صعب') DEFAULT 'سهل',
    duration_minutes INT(11) DEFAULT 15,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ec_id),
    KEY idx_category_age (content_category, age),
    KEY idx_type (content_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. إدراج المحتوى التعليمي (270 محتوى)
-- ============================================

-- ملاحظة: سيتم إنشاء ملف منفصل للمحتوى الكامل
-- هذا ملف الإعداد الأساسي

