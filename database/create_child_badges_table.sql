-- إنشاء جدول child_badges (شارات الأطفال)
-- نفذ هذا الملف إذا ظهر خطأ أن الجدول غير موجود

USE kids_learning;

-- جدول شارات الأطفال
CREATE TABLE IF NOT EXISTS child_badges (
    child_badge_id INT(11) NOT NULL AUTO_INCREMENT,
    child_id INT(11) NOT NULL,
    badge_id INT(11) NOT NULL,
    stars_earned INT(11) DEFAULT 0 COMMENT 'عدد النجوم المكتسبة',
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (child_badge_id),
    UNIQUE KEY unique_child_badge (child_id, badge_id),
    KEY child_id (child_id),
    KEY badge_id (badge_id),
    CONSTRAINT fk_child_badges_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_child_badges_badge FOREIGN KEY (badge_id) REFERENCES badges (badge_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

