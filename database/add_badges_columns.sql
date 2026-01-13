-- إضافة الأعمدة المطلوبة لجدول badges
-- نفذ هذا الملف أولاً إذا ظهر خطأ أن الأعمدة غير موجودة

USE kids_learning;

-- إضافة min_value (يمكن تجاهل الخطأ إذا كان موجوداً)
ALTER TABLE badges 
ADD COLUMN min_value INT(11) DEFAULT 0 COMMENT 'القيمة الدنيا' AFTER badge_icon;

-- إضافة max_value (يمكن تجاهل الخطأ إذا كان موجوداً)
ALTER TABLE badges 
ADD COLUMN max_value INT(11) DEFAULT 100 COMMENT 'القيمة العليا' AFTER min_value;

-- إضافة start_value (يمكن تجاهل الخطأ إذا كان موجوداً)
ALTER TABLE badges 
ADD COLUMN start_value INT(11) DEFAULT 0 COMMENT 'القيمة الابتدائية' AFTER max_value;

