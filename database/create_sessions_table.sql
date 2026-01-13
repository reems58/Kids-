-- إنشاء جدول الجلسات (Sessions)
USE kids_learning;

CREATE TABLE IF NOT EXISTS sessions (
    session_id INT(11) NOT NULL AUTO_INCREMENT,
    child_id INT(11) NOT NULL,
    parent_id INT(11) DEFAULT NULL,
    task_id INT(11) NOT NULL,
    content_id INT(11) DEFAULT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL DEFAULT NULL,
    duration_minutes INT(11) DEFAULT 0 COMMENT 'المدة بالدقائق',
    completed_percentage INT(11) DEFAULT 0 COMMENT 'نسبة الإكمال من 0 إلى 100',
    status ENUM('in_progress', 'completed', 'paused') DEFAULT 'in_progress',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id),
    KEY child_id (child_id),
    KEY parent_id (parent_id),
    KEY task_id (task_id),
    KEY content_id (content_id),
    CONSTRAINT fk_sessions_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sessions_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_sessions_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sessions_content FOREIGN KEY (content_id) REFERENCES content (content_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

