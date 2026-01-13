-- كود تعديل الجداول الموجودة في قاعدة البيانات
-- استخدم هذا الملف لتحديث الجداول الموجودة
-- انسخه والصقه في phpMyAdmin

USE kids_learning;

-- ============================================
-- 1. تعديل جدول Tasks - إضافة parent_id و child_id
-- ============================================
-- إضافة parent_id (إذا لم يكن موجوداً)
ALTER TABLE tasks 
ADD COLUMN parent_id INT(11) DEFAULT NULL AFTER task_id;

-- إضافة child_id (إذا لم يكن موجوداً)
ALTER TABLE tasks 
ADD COLUMN child_id INT(11) DEFAULT NULL AFTER parent_id;

-- إضافة الفهارس (إذا لم تكن موجودة)
ALTER TABLE tasks 
ADD INDEX IF NOT EXISTS parent_id_idx (parent_id);

ALTER TABLE tasks 
ADD INDEX IF NOT EXISTS child_id_idx (child_id);

-- إضافة المفاتيح الخارجية (إذا لم تكن موجودة)
-- ملاحظة: إذا ظهر خطأ أن المفتاح موجود، يمكنك تجاهله
ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_child FOREIGN KEY (child_id) REFERENCES children (child_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 2. تعديل جدول Badges - حذف min_value و max_value
-- ============================================
-- حذف min_value (إذا كان موجوداً)
ALTER TABLE badges 
DROP COLUMN min_value;

-- حذف max_value (إذا كان موجوداً)
ALTER TABLE badges 
DROP COLUMN max_value;

-- ============================================
-- 3. تعديل جدول Reports - تغيير pages_rendered إلى badges_earned
-- ============================================
-- تغيير اسم الحقل من pages_rendered إلى badges_earned
ALTER TABLE reports 
CHANGE COLUMN pages_rendered badges_earned INT(11) DEFAULT 0 COMMENT 'الشارات المكتسبة';
