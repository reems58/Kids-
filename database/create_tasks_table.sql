-- إنشاء جدول المهام (Tasks)
USE kids_learning;

CREATE TABLE IF NOT EXISTS tasks (
    task_id INT(11) NOT NULL AUTO_INCREMENT,
    parent_id INT(11) DEFAULT NULL,
    child_id INT(11) DEFAULT NULL,
    content_id INT(11) NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    task_name_ar VARCHAR(200) NOT NULL,
    description TEXT COMMENT 'وصف المهمة',
    duration_minutes INT(11) DEFAULT 10 COMMENT 'المدة بالدقائق',
    order_index INT(11) DEFAULT 0 COMMENT 'ترتيب المهمة',
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending' COMMENT 'حالة المهمة',
    time_completed INT(11) DEFAULT NULL COMMENT 'الوقت المستغرق بالدقائق',
    parent_note TEXT DEFAULT NULL COMMENT 'ملاحظات الأهل',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id),
    KEY content_id (content_id),
    KEY parent_id (parent_id),
    KEY child_id (child_id),
    CONSTRAINT fk_tasks_content FOREIGN KEY (content_id) REFERENCES content (content_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

