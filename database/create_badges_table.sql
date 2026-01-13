-- إنشاء جدول الشارات (Badges)
USE kids_learning;

CREATE TABLE IF NOT EXISTS badges (
    badge_id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT 'اسم الشارة',
    icon VARCHAR(50) DEFAULT NULL COMMENT 'رمز الشارة',
    description TEXT COMMENT 'وصف الشارة',
    level INT(11) DEFAULT 1 COMMENT 'المستوى',
    color_code VARCHAR(7) DEFAULT '#f59e0b' COMMENT 'كود اللون',
    max_star INT(11) DEFAULT 100 COMMENT 'الحد الأقصى للنجوم',
    min_star INT(11) DEFAULT 0 COMMENT 'الحد الأدنى للنجوم',
    PRIMARY KEY (badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

