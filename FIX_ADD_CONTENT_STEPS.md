# خطوات إصلاح وإضافة المحتوى

## ⚠️ المشكلة:
"ما زبط" - يعني أن إضافة المحتوى لم تنجح

## ✅ الحل الصحيح:

### الخطوة 1: إضافة الأعمدة أولاً

افتح phpMyAdmin: `http://localhost/phpmyadmin`

اختر قاعدة البيانات: `kids_learning`

افتح تبويب **SQL** وانسخ هذا الكود:

```sql
USE kids_learning;

-- إضافة الأعمدة المطلوبة
ALTER TABLE content ADD COLUMN content_type ENUM('لعبة', 'فيديو') DEFAULT 'لعبة' AFTER content_name_ar;

ALTER TABLE content ADD COLUMN content_url VARCHAR(500) DEFAULT NULL AFTER content_type;

ALTER TABLE content ADD COLUMN content_category ENUM('عربي', 'علوم', 'رياضيات') DEFAULT NULL AFTER category;
```

**⚠️ إذا ظهر خطأ "Duplicate column name"**:
- هذا يعني أن الأعمدة موجودة بالفعل
- تجاهل الخطأ وانتقل للخطوة 2

---

### الخطوة 2: إضافة المحتوى

بعد إضافة الأعمدة (أو إذا كانت موجودة):

1. افتح الملف: `database/add_content_complete.sql`
2. انسخ **كل** المحتوى
3. الصق في phpMyAdmin (تبويب SQL)
4. اضغط **تنفيذ**

---

## 🔍 التحقق من النجاح:

بعد التنفيذ، نفّذ:

```sql
SELECT COUNT(*) as total FROM content;
```

يجب أن يظهر: **108** (أو أكثر)

---

## 📋 إذا استمرت المشكلة:

### الخيار 1: إضافة الأعمدة يدوياً
```sql
USE kids_learning;

-- تحقق من وجود الأعمدة
SHOW COLUMNS FROM content LIKE 'content_type';
SHOW COLUMNS FROM content LIKE 'content_url';
SHOW COLUMNS FROM content LIKE 'content_category';

-- إذا لم تكن موجودة، أضفها:
ALTER TABLE content ADD COLUMN content_type ENUM('لعبة', 'فيديو') DEFAULT 'لعبة';
ALTER TABLE content ADD COLUMN content_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE content ADD COLUMN content_category ENUM('عربي', 'علوم', 'رياضيات') DEFAULT NULL;
```

### الخيار 2: استخدم ملف fix_add_content_columns.sql
1. افتح: `database/fix_add_content_columns.sql`
2. انسخ المحتوى
3. نفّذه في phpMyAdmin
4. ثم نفّذ `add_content_complete.sql`

---

**ملف الحل الكامل**: `database/add_content_complete.sql`

**آخر تحديث**: 2025

