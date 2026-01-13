-- إنشاء جدول المحتوى التعليمي (Content)
USE kids_learning;

CREATE TABLE IF NOT EXISTS content (
    content_id INT(11) NOT NULL AUTO_INCREMENT,
    content_name VARCHAR(100) NOT NULL,
    content_name_ar VARCHAR(100) NOT NULL,
    title VARCHAR(200) DEFAULT NULL COMMENT 'العنوان',
    topic VARCHAR(200) DEFAULT NULL COMMENT 'الموضوع',
    category VARCHAR(100) DEFAULT NULL COMMENT 'الفئة',
    difficulty ENUM('سهل', 'متوسط', 'صعب') DEFAULT 'سهل' COMMENT 'الصعوبة',
    min_age INT(3) DEFAULT 3 COMMENT 'الحد الأدنى للعمر',
    max_age INT(3) DEFAULT 12 COMMENT 'الحد الأقصى للعمر',
    icon VARCHAR(50) DEFAULT NULL COMMENT 'الأيقونة',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

