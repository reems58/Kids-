-- ============================================
-- تحديث روابط فيديوهات الرياضيات للعمر 4
-- استبدل YOUR_YOUTUBE_LINK_HERE برابط YouTube الحقيقي
-- ============================================

USE kids_learning;

-- فيديو 1: تعلم العد والأرقام للعمر 4
UPDATE content 
SET content_url = 'YOUR_YOUTUBE_LINK_HERE' 
WHERE content_name = 'video_riyadhiyat_4_1' 
  AND content_type = 'فيديو' 
  AND content_category = 'رياضيات' 
  AND min_age = 4;

-- فيديو 2: تعلم الجمع والطرح للعمر 4
UPDATE content 
SET content_url = 'YOUR_YOUTUBE_LINK_HERE' 
WHERE content_name = 'video_riyadhiyat_4_2' 
  AND content_type = 'فيديو' 
  AND content_category = 'رياضيات' 
  AND min_age = 4;

-- ============================================
-- أو يمكنك استخدام جملة واحدة لتحديث جميع فيديوهات الرياضيات للعمر 4:
-- (لكن هذا سيضع نفس الرابط لجميع الفيديوهات)
-- ============================================
-- UPDATE content 
-- SET content_url = 'YOUR_YOUTUBE_LINK_HERE' 
-- WHERE content_category = 'رياضيات' 
--   AND content_type = 'فيديو' 
--   AND min_age = 4;

