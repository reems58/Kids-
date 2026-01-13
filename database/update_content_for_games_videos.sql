-- ============================================
-- تحديث جدول المحتوى لدعم الألعاب والفيديوهات
-- ============================================

USE kids_learning;

-- إضافة الحقول الجديدة
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS content_type ENUM('لعبة', 'فيديو') DEFAULT 'لعبة' AFTER content_name_ar;

ALTER TABLE content 
ADD COLUMN IF NOT EXISTS content_url VARCHAR(500) DEFAULT NULL AFTER content_type;

ALTER TABLE content 
ADD COLUMN IF NOT EXISTS content_category ENUM('عربي', 'علوم', 'رياضيات') DEFAULT NULL AFTER category;

-- ملاحظة: إذا فشلت إضافة الحقول لأنها موجودة بالفعل، تجاهل الخطأ
-- واكمل تنفيذ باقي الملف

