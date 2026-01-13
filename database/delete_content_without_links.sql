-- حذف المحتويات التي لا تحتوي على رابط صحيح
-- هذا الملف يحذف جميع المحتويات التي:
-- 1. لا تحتوي على content_url (NULL أو فارغ)
-- 2. تحتوي على روابط تجريبية (example.com أو VIDEO_ID_)

USE kids_learning;

-- عرض المحتويات التي سيتم حذفها (للتحقق)
SELECT 
    content_id,
    content_name_ar,
    content_type,
    content_url,
    category
FROM content
WHERE 
    content_url IS NULL 
    OR content_url = '' 
    OR content_url LIKE '%example.com%'
    OR content_url LIKE '%VIDEO_ID_%'
    OR content_url = 'YOUR_YOUTUBE_LINK_HERE'
ORDER BY content_id;

-- حذف المحتويات التي لا تحتوي على رابط صحيح
-- تحذير: سيتم حذف المهام المرتبطة بهذه المحتويات تلقائياً بسبب ON DELETE CASCADE
DELETE FROM content
WHERE 
    content_url IS NULL 
    OR content_url = '' 
    OR content_url LIKE '%example.com%'
    OR content_url LIKE '%VIDEO_ID_%'
    OR content_url = 'YOUR_YOUTUBE_LINK_HERE';

-- عرض عدد المحتويات المتبقية
SELECT COUNT(*) as remaining_content_count FROM content;

