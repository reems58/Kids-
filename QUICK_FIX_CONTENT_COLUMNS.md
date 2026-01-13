# إصلاح سريع: إضافة الأعمدة المطلوبة

## المشكلة:
```
Unknown column 'content_type' in 'field list'
```

## الحل:

### الخطوة 1: تحديث جدول المحتوى
1. افتح phpMyAdmin: `http://localhost/phpmyadmin`
2. اختر قاعدة البيانات `kids_learning`
3. افتح تبويب **SQL**
4. انسخ محتوى الملف: `database/fix_add_content_columns.sql`
5. نفّذ الاستعلام

### أو استخدم هذا الكود مباشرة في SQL:

```sql
USE kids_learning;

-- إضافة عمود content_type
ALTER TABLE content ADD COLUMN content_type ENUM('لعبة', 'فيديو') DEFAULT 'لعبة' AFTER content_name_ar;

-- إضافة عمود content_url
ALTER TABLE content ADD COLUMN content_url VARCHAR(500) DEFAULT NULL AFTER content_type;

-- إضافة عمود content_category
ALTER TABLE content ADD COLUMN content_category ENUM('عربي', 'علوم', 'رياضيات') DEFAULT NULL AFTER category;
```

### الخطوة 2: التحقق
- اذهب إلى جدول `content` في phpMyAdmin
- تحقق من وجود الأعمدة الجديدة

### الخطوة 3: إنشاء المحتوى (اختياري)
- شغّل: `php database/generate_full_content.php`
- أو نفّذ ملف SQL للمحتوى

---

**ملاحظة**: إذا ظهرت رسالة "Duplicate column name" فهذا يعني أن العمود موجود بالفعل ويمكنك تجاهله.

