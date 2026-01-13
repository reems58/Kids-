-- إضافة حقل تاريخ الميلاد إلى جدول children
USE kids_learning;

ALTER TABLE children 
ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL AFTER gender;

