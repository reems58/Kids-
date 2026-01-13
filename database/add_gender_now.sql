-- إضافة عمود الجندر للجدول الموجود
-- انسخ هذا الكود والصقه في phpMyAdmin

USE kids_learning;

ALTER TABLE parents 
ADD COLUMN gender ENUM('أب', 'أم') NOT NULL AFTER password;

