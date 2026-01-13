# كيفية إنشاء المحتوى التعليمي (270 محتوى)

## الخطوات:

### 1. تحديث جدول المحتوى:
```sql
-- تنفيذ الملف:
database/update_content_for_games_videos.sql
```

### 2. إنشاء ملف SQL للمحتوى:

**الطريقة 1: استخدام ملف PHP (موصى به)**
```bash
php database/generate_full_content.php
```
سيقوم بإنشاء ملف `database/insert_all_educational_content_full.sql`

**الطريقة 2: إنشاء ملف SQL يدوياً**
- فتح ملف `database/insert_all_educational_content.sql`
- إكمال باقي المحتويات (261 محتوى باقي)

### 3. تنفيذ ملف SQL:
```sql
-- تنفيذ الملف:
database/insert_all_educational_content_full.sql
```

### 4. التحقق:
- الذهاب إلى phpMyAdmin
- التحقق من جدول `content`
- يجب أن يكون هناك 270 محتوى

## التفاصيل:
- **3 فئات**: عربي، علوم، رياضيات
- **9 أعمار**: 4، 5، 6، 7، 8، 9، 10، 11، 12
- **لكل عمر وفئة**: 5 ألعاب + 5 فيديوهات = 10 محتويات
- **الإجمالي**: 270 محتوى

