-- إنشاء الجداول المفقودة (child_badges و reports)
-- نفذ هذا الملف إذا ظهرت أخطاء أن الجداول غير موجودة

USE kids_learning;

-- ============================================
-- 1. إنشاء جدول child_badges (شارات الأطفال)
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
-- 2. إنشاء جدول reports (التقارير)
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

