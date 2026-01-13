-- ============================================
-- تحديث رابط فيديو الرياضيات للعمر 4 سنوات
-- ============================================

USE kids_learning;

-- فيديو تعلم العد والأرقام للعمر 4
UPDATE content 
SET content_url = 'https://www.youtube.com/watch?v=IhV_nZS9OSQ' 
WHERE content_name = 'video_riyadhiyat_4_1' 
  AND content_type = 'فيديو' 
  AND content_category = 'رياضيات' 
  AND min_age = 4;

