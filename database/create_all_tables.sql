-- إنشاء جميع الجداول المطلوبة
-- استخدم هذا الملف لإنشاء جميع الجداول دفعة واحدة

USE kids_learning;

-- ============================================
-- 1. جدول المحتوى التعليمي (Content)
-- ============================================
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

-- ============================================
-- 2. جدول المهام (Tasks)
-- ============================================
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

-- ============================================
-- 3. جدول الشارات (Badges)
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
    badge_id INT(11) NOT NULL AUTO_INCREMENT,
    badge_name VARCHAR(100) NOT NULL COMMENT 'اسم الشارة بالإنجليزية',
    badge_name_ar VARCHAR(100) NOT NULL COMMENT 'اسم الشارة بالعربية',
    badge_icon VARCHAR(50) DEFAULT NULL COMMENT 'رمز الشارة',
    start_value INT(11) DEFAULT 0 COMMENT 'القيمة الابتدائية',
    min_star INT(11) DEFAULT 0 COMMENT 'الحد الأدنى للنجوم',
    max_star INT(11) DEFAULT 100 COMMENT 'الحد الأقصى للنجوم',
    color_code VARCHAR(7) DEFAULT '#f59e0b' COMMENT 'كود اللون',
    level INT(11) DEFAULT 1 COMMENT 'المستوى',
    description TEXT COMMENT 'وصف الشارة',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. جدول الجلسات (Sessions)
-- ============================================
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

-- ============================================
-- 5. جدول التقارير (Reports)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    report_id INT(11) NOT NULL AUTO_INCREMENT,
    parent_id INT(11) NOT NULL,
    child_id INT(11) NOT NULL,
    session_id INT(11) DEFAULT NULL,
    achievement TEXT DEFAULT NULL COMMENT 'الإنجازات',
    report_data JSON DEFAULT NULL COMMENT 'بيانات التقرير بصيغة JSON',
    pages_rendered INT(11) DEFAULT 0 COMMENT 'عدد الصفحات المعروضة',
    total_time INT(11) DEFAULT 0 COMMENT 'الوقت الإجمالي بالدقائق',
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    viewed_by_parent TINYINT(1) DEFAULT 0 COMMENT 'تمت مشاهدته من قبل الأهل (0 أو 1)',
    viewed_at TIMESTAMP NULL DEFAULT NULL COMMENT 'وقت المشاهدة',
    PRIMARY KEY (report_id),
    KEY parent_id (parent_id),
    KEY child_id (child_id),
    KEY session_id (session_id),
    CONSTRAINT fk_reports_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reports_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reports_session FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

