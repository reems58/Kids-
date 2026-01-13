-- إدراج البيانات الافتراضية

USE kids_learning;

-- إدراج المحتوى التعليمي
INSERT INTO content (content_name, content_name_ar, icon) VALUES
('Arabic', 'عربي', '📚'),
('Math', 'رياضيات', '🔢'),
('Science', 'علوم', '🔬');

-- إدراج بعض المهام الافتراضية
-- مهام عربي
INSERT INTO tasks (content_id, task_name, task_name_ar, description, duration_minutes, order_index) VALUES
(1, 'Learn Letters', 'تعلم الحروف', 'تعلم الحروف العربية', 15, 1),
(1, 'Read Words', 'قراءة الكلمات', 'قراءة كلمات بسيطة', 20, 2),
(1, 'Write Sentences', 'كتابة الجمل', 'كتابة جمل قصيرة', 25, 3);

-- مهام رياضيات
INSERT INTO tasks (content_id, task_name, task_name_ar, description, duration_minutes, order_index) VALUES
(2, 'Count Numbers', 'عد الأرقام', 'تعلم العد من 1 إلى 10', 15, 1),
(2, 'Simple Addition', 'الجمع البسيط', 'جمع أرقام بسيطة', 20, 2),
(2, 'Simple Subtraction', 'الطرح البسيط', 'طرح أرقام بسيطة', 20, 3);

-- مهام علوم
INSERT INTO tasks (content_id, task_name, task_name_ar, description, duration_minutes, order_index) VALUES
(3, 'Learn Colors', 'تعلم الألوان', 'تعلم الألوان الأساسية', 15, 1),
(3, 'Learn Animals', 'تعلم الحيوانات', 'تعلم أسماء الحيوانات', 20, 2),
(3, 'Learn Nature', 'تعلم الطبيعة', 'تعلم عن الطبيعة', 25, 3);

-- إدراج الشارات الافتراضية
INSERT INTO badges (badge_name, badge_name_ar, badge_icon, min_value, max_value, start_value, color_code, level, description) VALUES
('First Task', 'المهمة الأولى', '⭐', 0, 1, 0, '#f59e0b', 1, 'أكمل أول مهمة'),
('Session Master', 'بطل الجلسة', '🏆', 1, 5, 0, '#6366f1', 2, 'أكمل 5 جلسات'),
('Time Champion', 'بطل الوقت', '⏰', 30, 100, 0, '#10b981', 3, 'أمضى 30 دقيقة في التعلم'),
('Content Expert', 'خبير المحتوى', '🎓', 10, 20, 0, '#ec4899', 4, 'أكمل 10 مهام'),
('Perfect Score', 'النتيجة المثالية', '💯', 100, 100, 0, '#ef4444', 5, 'حصل على 100% في مهمة'),
('Quick Learner', 'المتعلم السريع', '⚡', 5, 10, 0, '#8b5cf6', 2, 'أكمل 5 مهام بسرعة');

