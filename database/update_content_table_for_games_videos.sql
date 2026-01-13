-- تحديث جدول المحتوى لدعم الألعاب والفيديوهات
USE kids_learning;

-- إضافة حقول جديدة إذا لم تكن موجودة
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS content_type ENUM('لعبة', 'فيديو') DEFAULT 'لعبة' AFTER content_name_ar;

ALTER TABLE content 
ADD COLUMN IF NOT EXISTS content_url VARCHAR(500) DEFAULT NULL AFTER content_type;

ALTER TABLE content 
ADD COLUMN IF NOT EXISTS content_category ENUM('عربي', 'علوم', 'رياضيات') DEFAULT NULL AFTER category;

-- تحديث content_name_ar ليكون اسم الفئة الأساسية
-- ونستخدم content_category للفئة التعليمية

