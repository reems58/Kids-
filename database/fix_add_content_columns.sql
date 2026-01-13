-- ============================================
-- إضافة الأعمدة المطلوبة لجدول المحتوى
-- حل سريع للمشكلة: Unknown column 'content_type' in 'field list'
-- ============================================

USE kids_learning;

-- إضافة عمود content_type (نوع المحتوى: لعبة أو فيديو)
ALTER TABLE content ADD COLUMN content_type ENUM('لعبة', 'فيديو') DEFAULT 'لعبة' AFTER content_name_ar;

-- إضافة عمود content_url (رابط المحتوى)
ALTER TABLE content ADD COLUMN content_url VARCHAR(500) DEFAULT NULL AFTER content_type;

-- إضافة عمود content_category (فئة المحتوى: عربي، علوم، رياضيات)
ALTER TABLE content ADD COLUMN content_category ENUM('عربي', 'علوم', 'رياضيات') DEFAULT NULL AFTER category;

-- ملاحظة: إذا ظهر خطأ "Duplicate column name" فهذا يعني أن العمود موجود بالفعل
-- ويمكنك تجاهل الخطأ ومتابعة العمل

