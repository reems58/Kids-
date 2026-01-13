# تشخيص مشكلة عدم ظهور المحتوى

## المشكلة:
لا يظهر المحتوى في القائمة المنسدلة عند إضافة مهمة جديدة، رغم وجود الطفل.

## خطوات التشخيص:

### 1. التحقق من وجود المحتوى في قاعدة البيانات:

```sql
-- في phpMyAdmin، نفّذ:
USE kids_learning;

-- التحقق من وجود المحتوى
SELECT COUNT(*) as total_content FROM content;

-- التحقق من وجود محتوى للعمر 10 (مثلاً)
SELECT * FROM content WHERE min_age = 10 AND max_age = 10;

-- التحقق من الأعمدة المطلوبة
DESCRIBE content;
```

### 2. التحقق من API مباشرة:

افتح المتصفح واضغط F12، ثم جرّب:

```
http://localhost/kids_learning/api/tasks/get_content_by_age.php?age=10
```

يجب أن ترى JSON يحتوي على المحتوى.

### 3. فحص Console في المتصفح:

- اضغط F12
- افتح تبويب Console
- افتح نافذة "إدارة المهام"
- ابحث عن الرسائل التي تبدأ بـ "جاري تحميل المحتوى" أو "المحتوى المحمّل"

### 4. التحقق من إضافة المحتوى:

تأكد من تنفيذ ملف SQL للمحتوى:

```bash
# في terminal:
cd c:\xampp\htdocs\kids_learning\database
php generate_educational_content_2games_2videos.php
```

ثم في phpMyAdmin:
- افتح الملف المولّد: `insert_educational_content_2games_2videos.sql`
- نفّذه في قاعدة البيانات

---

## الحلول المحتملة:

### الحل 1: إضافة المحتوى
إذا لم يكن هناك محتوى في قاعدة البيانات:
1. نفّذ ملف SQL للمحتوى
2. تأكد من وجود محتوى للأعمار 4-12

### الحل 2: التحقق من الأعمدة
تأكد من وجود الأعمدة التالية في جدول `content`:
- `content_type` (ENUM أو VARCHAR)
- `content_url` (VARCHAR)
- `content_category` (VARCHAR)

إذا لم تكن موجودة، نفّذ:
```sql
database/fix_add_content_columns.sql
```

### الحل 3: التحقق من العمر
تأكد من أن:
- العمر محسوب بشكل صحيح
- العمر بين 4 و 12
- تاريخ الميلاد صحيح

---

**آخر تحديث**: 2025

