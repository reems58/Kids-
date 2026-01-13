-- حذف فيديوهات YouTube للعمر 4 سنوات
-- هذا الملف يحذف جميع فيديوهات YouTube الخاصة بالعمر 4 سنوات
-- تحذير: سيتم حذف المهام المرتبطة بهذه الفيديوهات تلقائياً بسبب ON DELETE CASCADE

USE kids_learning;

-- عرض الفيديوهات التي سيتم حذفها (للتحقق قبل الحذف)
SELECT 
    content_id,
    content_name_ar,
    content_type,
    content_url,
    content_category,
    min_age,
    max_age
FROM content
WHERE 
    content_type = 'فيديو'
    AND min_age = 4
    AND max_age = 4
    AND (
        content_url LIKE '%youtube.com%' 
        OR content_url LIKE '%youtu.be%'
    )
ORDER BY content_category, content_id;

-- حذف فيديوهات YouTube للعمر 4 سنوات
-- تحذير: سيتم حذف المهام المرتبطة بهذه الفيديوهات تلقائياً بسبب ON DELETE CASCADE
DELETE FROM content
WHERE 
    content_type = 'فيديو'
    AND min_age = 4
    AND max_age = 4
    AND (
        content_url LIKE '%youtube.com%' 
        OR content_url LIKE '%youtu.be%'
    );

-- عرض عدد المحتويات المتبقية
SELECT COUNT(*) as remaining_content_count FROM content;

-- عرض عدد فيديوهات YouTube المتبقية للعمر 4
SELECT COUNT(*) as remaining_age_4_videos 
FROM content
WHERE 
    content_type = 'فيديو'
    AND min_age = 4
    AND max_age = 4
    AND (
        content_url LIKE '%youtube.com%' 
        OR content_url LIKE '%youtu.be%'
    );

