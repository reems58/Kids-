-- إنشاء جدول الأطفال
USE kids_learning;

CREATE TABLE IF NOT EXISTS children (
    child_id INT(11) NOT NULL AUTO_INCREMENT,
    child_name VARCHAR(200) NOT NULL,
    parent_id INT(11) NOT NULL,
    age INT(3) DEFAULT NULL,
    gender ENUM('ذكر', 'أنثى') DEFAULT NULL,
    birth_date DATE DEFAULT NULL,
    profile_img VARCHAR(255) DEFAULT NULL,
    last_activity TIMESTAMP NULL DEFAULT NULL,
    total_time INT(11) DEFAULT 0 COMMENT 'الوقت الإجمالي بالدقائق',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (child_id),
    KEY parent_id (parent_id),
    CONSTRAINT fk_children_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
