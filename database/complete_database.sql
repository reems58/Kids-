-- إكمال قاعدة البيانات حسب المخطط
-- استخدم هذا الملف لتحديث الجداول الموجودة
USE kids_learning;

-- ============================================
-- 1. تحديث جدول Content
-- ============================================
-- إضافة الحقول الجديدة (إذا لم تكن موجودة)
ALTER TABLE content 
ADD COLUMN title VARCHAR(200) DEFAULT NULL AFTER content_name_ar;

ALTER TABLE content 
ADD COLUMN topic VARCHAR(200) DEFAULT NULL AFTER title;

ALTER TABLE content 
ADD COLUMN category VARCHAR(100) DEFAULT NULL AFTER topic;

ALTER TABLE content 
ADD COLUMN difficulty ENUM('سهل', 'متوسط', 'صعب') DEFAULT 'سهل' AFTER category;

ALTER TABLE content 
ADD COLUMN min_age INT(3) DEFAULT 3 AFTER difficulty;

ALTER TABLE content 
ADD COLUMN max_age INT(3) DEFAULT 12 AFTER min_age;

-- ============================================
-- 2. تحديث جدول Tasks
-- ============================================
ALTER TABLE tasks 
ADD COLUMN status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending' AFTER order_index;

ALTER TABLE tasks 
ADD COLUMN time_completed INT(11) DEFAULT NULL COMMENT 'الوقت المستغرق بالدقائق' AFTER status;

ALTER TABLE tasks 
ADD COLUMN parent_note TEXT DEFAULT NULL AFTER time_completed;

-- إنشاء جدول child_tasks لربط المهام بالأطفال والوالدين
CREATE TABLE IF NOT EXISTS child_tasks (
    child_task_id INT(11) NOT NULL AUTO_INCREMENT,
    child_id INT(11) NOT NULL,
    task_id INT(11) NOT NULL,
    parent_id INT(11) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    time_completed INT(11) DEFAULT NULL COMMENT 'الوقت المستغرق بالدقائق',
    parent_note TEXT DEFAULT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (child_task_id),
    KEY child_id (child_id),
    KEY task_id (task_id),
    KEY parent_id (parent_id),
    CONSTRAINT fk_child_tasks_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_child_tasks_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_child_tasks_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. تحديث جدول Sessions
-- ============================================
ALTER TABLE sessions 
ADD COLUMN parent_id INT(11) DEFAULT NULL AFTER child_id;

ALTER TABLE sessions 
ADD COLUMN content_id INT(11) DEFAULT NULL AFTER task_id;

-- إضافة المفاتيح الخارجية (إذا لم تكن موجودة)
ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_content FOREIGN KEY (content_id) REFERENCES content (content_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- إضافة فهارس
ALTER TABLE sessions 
ADD INDEX parent_id_idx (parent_id);

ALTER TABLE sessions 
ADD INDEX content_id_idx (content_id);

-- ============================================
-- 4. تحديث جدول Badges
-- ============================================
ALTER TABLE badges 
ADD COLUMN min_star INT(11) DEFAULT 0 COMMENT 'الحد الأدنى للنجوم' AFTER max_value;

ALTER TABLE badges 
ADD COLUMN max_star INT(11) DEFAULT 100 COMMENT 'الحد الأقصى للنجوم' AFTER min_star;

-- ============================================
-- 5. إنشاء جدول Reports
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    report_id INT(11) NOT NULL AUTO_INCREMENT,
    parent_id INT(11) NOT NULL,
    child_id INT(11) NOT NULL,
    session_id INT(11) DEFAULT NULL,
    achievement TEXT DEFAULT NULL COMMENT 'الإنجازات',
    report_data JSON DEFAULT NULL COMMENT 'بيانات التقرير',
    pages_rendered INT(11) DEFAULT 0 COMMENT 'عدد الصفحات المعروضة',
    total_time INT(11) DEFAULT 0 COMMENT 'الوقت الإجمالي بالدقائق',
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    viewed_by_parent TINYINT(1) DEFAULT 0 COMMENT 'تمت مشاهدته من قبل الأهل',
    viewed_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (report_id),
    KEY parent_id (parent_id),
    KEY child_id (child_id),
    KEY session_id (session_id),
    CONSTRAINT fk_reports_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reports_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reports_session FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. إنشاء جدول child_badges (إذا لم يكن موجوداً)
-- ============================================
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

-- ============================================
-- 7. إنشاء جدول task_completions (للمهام المكتملة)
-- ============================================
CREATE TABLE IF NOT EXISTS task_completions (
    completion_id INT(11) NOT NULL AUTO_INCREMENT,
    child_id INT(11) NOT NULL,
    task_id INT(11) NOT NULL,
    session_id INT(11) DEFAULT NULL,
    parent_id INT(11) NOT NULL,
    completion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_taken_minutes INT(11) DEFAULT 0,
    score INT(11) DEFAULT 0 COMMENT 'النتيجة من 0 إلى 100',
    PRIMARY KEY (completion_id),
    KEY child_id (child_id),
    KEY task_id (task_id),
    KEY session_id (session_id),
    KEY parent_id (parent_id),
    CONSTRAINT fk_completions_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_completions_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_completions_session FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_completions_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
