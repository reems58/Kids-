-- ============================================
-- تحديث روابط فيديوهات الرياضيات للعمر 4 سنوات
-- ============================================

USE kids_learning;

-- فيديو 1: تعلم الأعداد والعد
UPDATE content 
SET content_url = 'https://www.youtube.com/watch?v=IhV_nZS9OSQ' 
WHERE content_name = 'video_riyadhiyat_4_1' 
  AND content_type = 'فيديو' 
  AND content_category = 'رياضيات' 
  AND min_age = 4;

-- فيديو 2: الجمع والطرح
UPDATE content 
SET content_url = 'https://www.youtube.com/watch?v=ljxYmNhbeFo' 
WHERE content_name = 'video_riyadhiyat_4_2' 
  AND content_type = 'فيديو' 
  AND content_category = 'رياضيات' 
  AND min_age = 4;

