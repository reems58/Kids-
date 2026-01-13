# 🔗 روابط الصفحات الرئيسية

## 🌐 الصفحة الرئيسية (نقطة البداية):
```
http://localhost/kids_learning/html/index.html
```

---

## 📄 روابط الصفحات الرئيسية

### 1. صفحة تسجيل الدخول / إنشاء حساب:
```
http://localhost/kids_learning/html/index.html
```

### 2. لوحة تحكم الأهل (الأهم):
```
http://localhost/kids_learning/html/parent_dashboard.html
```

### 3. لوحة التحكم الرئيسية:
```
http://localhost/kids_learning/html/dashboard.html
```

### 4. واجهة الطفل:
```
http://localhost/kids_learning/html/child_view.html
```

### 5. صفحة المحتوى التعليمي (الألعاب والفيديوهات):
```
http://localhost/kids_learning/html/content_view.html?child_id=1
```

---

## 🗄️ phpMyAdmin (لإدارة قاعدة البيانات):

```
http://localhost/phpmyadmin
```

**لتحديث الجدول (إضافة الأعمدة)**:
1. افتح phpMyAdmin
2. اختر قاعدة البيانات: `kids_learning`
3. اضغط على تبويب **SQL**
4. انسخ محتوى الملف: `database/fix_add_content_columns.sql`
5. اضغط **تنفيذ**

---

## 🔌 روابط API (للاختبار):

### جلب محتوى الطفل حسب العمر:
```
http://localhost/kids_learning/api/get_child_content.php?child_id=1
```

### جلب قائمة الأطفال:
```
http://localhost/kids_learning/api/get_children.php?parent_id=1
```

### جلب المحتوى حسب العمر:
```
http://localhost/kids_learning/api/tasks/get_content_by_age.php?age=5
```

---

## 📝 ملاحظات مهمة:

1. **تأكد من تشغيل XAMPP** (Apache و MySQL)
2. **إذا كان البورت مختلف**: استخدم `http://localhost:8080/...`
3. **قاعدة البيانات**: `kids_learning`

---

## 🚀 البداية السريعة:

1. افتح المتصفح
2. اذهب إلى: **`http://localhost/kids_learning/html/index.html`**
3. سجل الدخول أو أنشئ حساب
4. ستنتقل إلى لوحة تحكم الأهل تلقائياً

---

**آخر تحديث**: 2025

