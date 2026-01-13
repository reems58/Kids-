-- إنشاء قاعدة البيانات والجدول
CREATE DATABASE IF NOT EXISTS kids_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kids_learning;

-- جدول الوالدين
CREATE TABLE IF NOT EXISTS parents (
    id INT(11) NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    gender ENUM('أب', 'أم') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأطفال
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

-- جدول المحتوى التعليمي (Content)
CREATE TABLE IF NOT EXISTS content (
    content_id INT(11) NOT NULL AUTO_INCREMENT,
    content_name VARCHAR(100) NOT NULL,
    content_name_ar VARCHAR(100) NOT NULL,
    title VARCHAR(200) DEFAULT NULL,
    topic VARCHAR(200) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    difficulty ENUM('سهل', 'متوسط', 'صعب') DEFAULT 'سهل',
    min_age INT(3) DEFAULT 3,
    max_age INT(3) DEFAULT 12,
    icon VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المهام
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT(11) NOT NULL AUTO_INCREMENT,
    content_id INT(11) NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    task_name_ar VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INT(11) DEFAULT 10,
    order_index INT(11) DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    time_completed INT(11) DEFAULT NULL COMMENT 'الوقت المستغرق بالدقائق',
    parent_note TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id),
    KEY content_id (content_id),
    CONSTRAINT fk_tasks_content FOREIGN KEY (content_id) REFERENCES content (content_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مهام الأطفال (ربط المهام بالأطفال والوالدين)
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

-- جدول ترتيب المهام للأطفال (من قبل الأهل)
CREATE TABLE IF NOT EXISTS child_task_order (
    order_id INT(11) NOT NULL AUTO_INCREMENT,
    child_id INT(11) NOT NULL,
    task_id INT(11) NOT NULL,
    order_index INT(11) NOT NULL DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id),
    UNIQUE KEY unique_child_task (child_id, task_id),
    KEY child_id (child_id),
    KEY task_id (task_id),
    CONSTRAINT fk_order_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الجلسات (Sessions)
CREATE TABLE IF NOT EXISTS sessions (
    session_id INT(11) NOT NULL AUTO_INCREMENT,
    child_id INT(11) NOT NULL,
    parent_id INT(11) DEFAULT NULL,
    task_id INT(11) NOT NULL,
    content_id INT(11) DEFAULT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL DEFAULT NULL,
    duration_minutes INT(11) DEFAULT 0,
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

-- جدول الشارات (Badges)
CREATE TABLE IF NOT EXISTS badges (
    badge_id INT(11) NOT NULL AUTO_INCREMENT,
    badge_name VARCHAR(100) NOT NULL,
    badge_name_ar VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(50) DEFAULT NULL,
    min_value INT(11) DEFAULT 0 COMMENT 'القيمة الدنيا',
    max_value INT(11) DEFAULT 100 COMMENT 'القيمة العليا',
    start_value INT(11) DEFAULT 0 COMMENT 'القيمة الابتدائية',
    min_star INT(11) DEFAULT 0 COMMENT 'الحد الأدنى للنجوم',
    max_star INT(11) DEFAULT 100 COMMENT 'الحد الأقصى للنجوم',
    color_code VARCHAR(7) DEFAULT '#f59e0b' COMMENT 'كود اللون',
    level INT(11) DEFAULT 1 COMMENT 'المستوى',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- جدول التقارير (Reports)
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

-- جدول إكمال المهام
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

