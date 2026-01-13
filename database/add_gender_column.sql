-- إضافة عمود الجندر للجدول الموجود
-- استخدم هذا الكود إذا كان لديك جدول parents موجود بالفعل

USE kids_learning;

ALTER TABLE parents 
ADD COLUMN gender ENUM('أب', 'أم') NOT NULL AFTER password;

