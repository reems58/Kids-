-- ============================================
-- تحديث روابط فيديوهات الرياضيات للعمر 4
-- الجملة الصحيحة
-- ============================================

USE kids_learning;

-- فيديو 1: تعلم العد والأرقام للعمر 4
UPDATE content 
SET content_url = 'https://www.youtube.com/watch?v=IhV_nZS9OSQ' 
WHERE content_name = 'video_riyadhiyat_4_1' 
  AND content_type = 'فيديو';

-- فيديو 2: تعلم الجمع والطرح للعمر 4 (استبدل الرابط هنا)
UPDATE content 
SET content_url = 'https://www.youtube.com/watch?v=YOUR_SECOND_VIDEO_ID' 
WHERE content_name = 'video_riyadhiyat_4_2' 
  AND content_type = 'فيديو';

