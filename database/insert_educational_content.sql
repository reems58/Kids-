-- إدراج محتوى تعليمي شامل للألعاب والفيديوهات
-- 3 فئات (عربي، علوم، رياضيات) × 9 أعمار (4-12) × 10 محتويات (5 ألعاب + 5 فيديوهات) = 270 محتوى

USE kids_learning;

-- أولاً: إدراج الفئات الأساسية (إذا لم تكن موجودة)
INSERT IGNORE INTO content (content_name, content_name_ar, icon, content_category) VALUES
('Arabic', 'عربي', '📚', 'عربي'),
('Math', 'رياضيات', '🔢', 'رياضيات'),
('Science', 'علوم', '🔬', 'علوم');

-- الحصول على معرفات الفئات
SET @arabic_id = (SELECT content_id FROM content WHERE content_category = 'عربي' LIMIT 1);
SET @math_id = (SELECT content_id FROM content WHERE content_category = 'رياضيات' LIMIT 1);
SET @science_id = (SELECT content_id FROM content WHERE content_category = 'علوم' LIMIT 1);

-- جدول المحتوى التعليمي الشامل
-- سنقوم بإنشاء 270 محتوى موزعة على الفئات والأعمار

