-- ============================================
-- إضافة فيديو يوتيوب للرياضيات للعمر 4-6 سنوات
-- ============================================

USE kids_learning;

-- إضافة فيديو يوتيوب للرياضيات للعمر 4-6 سنوات
INSERT INTO content (
    content_name, 
    content_name_ar, 
    content_type, 
    content_url, 
    title, 
    category, 
    min_age, 
    max_age, 
    icon, 
    content_category
) VALUES (
    'math_video_4_6', 
    'فيديو تعليمي للرياضيات - العمر 4-6', 
    'فيديو', 
    'https://youtu.be/2xgyEC9WCA4?feature=shared', 
    'فيديو تعليمي للرياضيات - العمر 4-6 سنوات', 
    'تعليمي', 
    4, 
    6, 
    '📺', 
    'رياضيات'
);

-- إضافة مهمة للفيديو لكل طفل في العمر 4-6 سنوات
-- ملاحظة: يجب أن يكون content_id موجوداً أولاً (من الاستعلام السابق)
INSERT INTO tasks (
    content_id,
    task_name,
    task_name_ar,
    description,
    duration_minutes,
    order_index,
    child_id,
    parent_id,
    status
)
SELECT 
    c.content_id,
    'Watch Math Video',
    'شاهد فيديو الرياضيات',
    'شاهد فيديو تعليمي للرياضيات للعمر 4-6 سنوات',
    10,
    0,
    ch.child_id,
    ch.parent_id,
    'pending'
FROM content c
CROSS JOIN children ch
WHERE c.content_name = 'math_video_4_6'
  AND ch.age >= 4 
  AND ch.age <= 6
  AND NOT EXISTS (
      SELECT 1 
      FROM tasks t 
      WHERE t.content_id = c.content_id 
        AND t.child_id = ch.child_id
  );

