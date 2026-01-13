# مخططات التصميم المنطقي - Logical Design Diagrams
## منصة التعلم للأطفال - Kids Learning Platform

---

## 📊 1. مخطط قاعدة البيانات المنطقي (Database Logical Design - ERD)

### 1.1. مخطط علاقات الكيانات الكامل (Complete Entity Relationship Diagram)

```mermaid
erDiagram
    PARENTS ||--o{ CHILDREN : "has"
    PARENTS ||--o{ CHILD_TASKS : "assigns"
    PARENTS ||--o{ REPORTS : "views"
    PARENTS ||--o{ TASK_COMPLETIONS : "monitors"
    
    CHILDREN ||--o{ SESSIONS : "participates_in"
    CHILDREN ||--o{ CHILD_BADGES : "earns"
    CHILDREN ||--o{ CHILD_TASKS : "assigned_to"
    CHILDREN ||--o{ CHILD_TASK_ORDER : "has_order"
    CHILDREN ||--o{ TASK_COMPLETIONS : "completes"
    CHILDREN ||--o{ REPORTS : "generates"
    
    CONTENT ||--o{ TASKS : "contains"
    CONTENT ||--o{ SESSIONS : "used_in"
    
    TASKS ||--o{ CHILD_TASKS : "assigned_as"
    TASKS ||--o{ CHILD_TASK_ORDER : "ordered_in"
    TASKS ||--o{ SESSIONS : "executed_in"
    TASKS ||--o{ TASK_COMPLETIONS : "completed_as"
    
    BADGES ||--o{ CHILD_BADGES : "awarded_as"
    
    SESSIONS ||--o{ REPORTS : "generates"
    SESSIONS ||--o{ TASK_COMPLETIONS : "records"
    
    PARENTS {
        int id PK "المعرف الرئيسي"
        string first_name "الاسم الأول"
        string last_name "اسم العائلة"
        string email UK "البريد الإلكتروني (فريد)"
        string phone UK "رقم الهاتف (فريد)"
        string password "كلمة المرور (مشفرة)"
        enum gender "الجنس (أب/أم)"
        timestamp created_at "تاريخ الإنشاء"
        timestamp updated_at "تاريخ التحديث"
    }
    
    CHILDREN {
        int child_id PK "معرف الطفل"
        string child_name "اسم الطفل"
        int parent_id FK "معرف الوالد"
        int age "العمر"
        enum gender "الجنس (ذكر/أنثى)"
        date birth_date "تاريخ الميلاد"
        string profile_img "صورة الملف الشخصي"
        timestamp last_activity "آخر نشاط"
        int total_time "الوقت الإجمالي (بالدقائق)"
        int total_stars "إجمالي النجوم"
        string title "اللقب"
        timestamp created_at "تاريخ الإنشاء"
        timestamp updated_at "تاريخ التحديث"
    }
    
    CONTENT {
        int content_id PK "معرف المحتوى"
        string content_name "اسم المحتوى (إنجليزي)"
        string content_name_ar "اسم المحتوى (عربي)"
        string title "العنوان"
        string topic "الموضوع"
        string category "الفئة"
        enum difficulty "الصعوبة (سهل/متوسط/صعب)"
        int min_age "الحد الأدنى للعمر"
        int max_age "الحد الأقصى للعمر"
        string icon "الأيقونة"
        timestamp created_at "تاريخ الإنشاء"
    }
    
    TASKS {
        int task_id PK "معرف المهمة"
        int parent_id FK "معرف الوالد (اختياري)"
        int child_id FK "معرف الطفل (اختياري)"
        int content_id FK "معرف المحتوى"
        string task_name "اسم المهمة (إنجليزي)"
        string task_name_ar "اسم المهمة (عربي)"
        text description "الوصف"
        int duration_minutes "المدة بالدقائق"
        int order_index "ترتيب المهمة"
        enum status "الحالة (pending/in_progress/completed/skipped)"
        int time_completed "الوقت المستغرق"
        text parent_note "ملاحظات الأهل"
        timestamp created_at "تاريخ الإنشاء"
    }
    
    CHILD_TASKS {
        int child_task_id PK "معرف مهمة الطفل"
        int child_id FK "معرف الطفل"
        int task_id FK "معرف المهمة"
        int parent_id FK "معرف الوالد"
        enum status "الحالة"
        int time_completed "الوقت المستغرق"
        text parent_note "ملاحظات الأهل"
        timestamp assigned_at "تاريخ التعيين"
        timestamp completed_at "تاريخ الإكمال"
    }
    
    CHILD_TASK_ORDER {
        int order_id PK "معرف الترتيب"
        int child_id FK "معرف الطفل"
        int task_id FK "معرف المهمة"
        int order_index "ترتيب المهمة"
        tinyint is_active "نشط/غير نشط"
        timestamp created_at "تاريخ الإنشاء"
    }
    
    SESSIONS {
        int session_id PK "معرف الجلسة"
        int child_id FK "معرف الطفل"
        int parent_id FK "معرف الوالد (اختياري)"
        int task_id FK "معرف المهمة"
        int content_id FK "معرف المحتوى (اختياري)"
        timestamp start_time "وقت البدء"
        timestamp end_time "وقت الانتهاء"
        int duration_minutes "المدة بالدقائق"
        int completed_percentage "نسبة الإكمال (0-100)"
        enum status "الحالة (in_progress/completed/paused)"
        timestamp created_at "تاريخ الإنشاء"
    }
    
    BADGES {
        int badge_id PK "معرف الشارة"
        string badge_name "اسم الشارة (إنجليزي)"
        string badge_name_ar "اسم الشارة (عربي)"
        string badge_icon "رمز الشارة"
        int start_value "القيمة الابتدائية"
        int min_star "الحد الأدنى للنجوم"
        int max_star "الحد الأقصى للنجوم"
        string color_code "كود اللون"
        int level "المستوى"
        text description "الوصف"
        timestamp created_at "تاريخ الإنشاء"
    }
    
    CHILD_BADGES {
        int child_badge_id PK "معرف شارة الطفل"
        int child_id FK "معرف الطفل"
        int badge_id FK "معرف الشارة"
        int stars_earned "عدد النجوم المكتسبة"
        timestamp awarded_at "تاريخ الحصول"
    }
    
    REPORTS {
        int report_id PK "معرف التقرير"
        int parent_id FK "معرف الوالد"
        int child_id FK "معرف الطفل"
        int session_id FK "معرف الجلسة (اختياري)"
        text achievement "الإنجازات"
        json report_data "بيانات التقرير (JSON)"
        int pages_rendered "عدد الصفحات المعروضة"
        int total_time "الوقت الإجمالي"
        timestamp generated_at "تاريخ الإنشاء"
        tinyint viewed_by_parent "تمت المشاهدة"
        timestamp viewed_at "تاريخ المشاهدة"
    }
    
    TASK_COMPLETIONS {
        int completion_id PK "معرف الإكمال"
        int child_id FK "معرف الطفل"
        int task_id FK "معرف المهمة"
        int session_id FK "معرف الجلسة (اختياري)"
        int parent_id FK "معرف الوالد"
        timestamp completion_time "وقت الإكمال"
        int duration_taken_minutes "المدة المستغرقة"
        int score "النتيجة (0-100)"
    }
```

### 1.2. هيكل الجداول والعلاقات (Table Structure & Relationships)

```mermaid
graph TB
    subgraph "Core Entities - الكيانات الأساسية"
        P[PARENTS<br/>الوالدين]
        C[CHILDREN<br/>الأطفال]
        CNT[CONTENT<br/>المحتوى]
    end
    
    subgraph "Task Management - إدارة المهام"
        T[TASKS<br/>المهام]
        CT[CHILD_TASKS<br/>مهام الأطفال]
        CTO[CHILD_TASK_ORDER<br/>ترتيب المهام]
    end
    
    subgraph "Learning Activities - أنشطة التعلم"
        S[SESSIONS<br/>الجلسات]
        TC[TASK_COMPLETIONS<br/>إكمال المهام]
    end
    
    subgraph "Rewards System - نظام المكافآت"
        B[BADGES<br/>الشارات]
        CB[CHILD_BADGES<br/>شارات الأطفال]
    end
    
    subgraph "Reporting - التقارير"
        R[REPORTS<br/>التقارير]
    end
    
    P -->|1:N| C
    P -->|1:N| CT
    P -->|1:N| R
    P -->|1:N| TC
    
    C -->|1:N| S
    C -->|1:N| CB
    C -->|1:N| CT
    C -->|1:N| CTO
    C -->|1:N| TC
    C -->|1:N| R
    
    CNT -->|1:N| T
    CNT -->|1:N| S
    
    T -->|1:N| CT
    T -->|1:N| CTO
    T -->|1:N| S
    T -->|1:N| TC
    
    B -->|1:N| CB
    
    S -->|1:N| R
    S -->|1:N| TC
    
    style P fill:#667eea,stroke:#764ba2,color:#fff
    style C fill:#f59e0b,stroke:#ff9800,color:#fff
    style CNT fill:#10b981,stroke:#059669,color:#fff
    style T fill:#ec4899,stroke:#db2777,color:#fff
    style CT fill:#ec4899,stroke:#db2777,color:#fff
    style S fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style B fill:#f59e0b,stroke:#ff9800,color:#fff
    style CB fill:#f59e0b,stroke:#ff9800,color:#fff
    style R fill:#06b6d4,stroke:#0891b2,color:#fff
```

---

## 🏗️ 2. التصميم المعماري المنطقي (System Architecture Logical Design)

### 2.1. هيكل النظام الكامل (Complete System Architecture)

```mermaid
graph TB
    subgraph "Presentation Layer - طبقة العرض"
        HTML[HTML Pages<br/>صفحات HTML]
        CSS[CSS Styles<br/>التنسيقات]
        JS[JavaScript<br/>البرمجة النصية]
    end
    
    subgraph "Application Layer - طبقة التطبيق"
        AUTH[Authentication Module<br/>وحدة المصادقة]
        CHILD_MGMT[Child Management<br/>إدارة الأطفال]
        TASK_MGMT[Task Management<br/>إدارة المهام]
        SESSION_MGMT[Session Management<br/>إدارة الجلسات]
        GAME_ENGINE[Game Engine<br/>محرك الألعاب]
        REPORTING[Reporting Module<br/>وحدة التقارير]
        BADGE_SYS[Badge System<br/>نظام الشارات]
        STATS[Statistics Module<br/>وحدة الإحصائيات]
    end
    
    subgraph "API Layer - طبقة واجهات البرمجة"
        AUTH_API[Authentication API<br/>login.php, signup.php]
        CHILD_API[Child API<br/>get_children.php, add_child.php]
        TASK_API[Task API<br/>get_child_tasks.php, add_task.php]
        SESSION_API[Session API<br/>start_session.php, complete_task.php]
        REPORT_API[Report API<br/>get_child_sessions.php, get_statistics.php]
        BADGE_API[Badge API<br/>get_child_badges.php]
    end
    
    subgraph "Data Access Layer - طبقة الوصول للبيانات"
        DB_CONN[Database Connection<br/>config/database.php]
        PDO[PDO Interface<br/>واجهة PDO]
    end
    
    subgraph "Data Storage Layer - طبقة التخزين"
        DB[(MySQL Database<br/>قاعدة البيانات)]
    end
    
    HTML --> JS
    CSS --> HTML
    JS --> AUTH
    JS --> CHILD_MGMT
    JS --> TASK_MGMT
    JS --> SESSION_MGMT
    JS --> GAME_ENGINE
    JS --> REPORTING
    JS --> BADGE_SYS
    JS --> STATS
    
    AUTH --> AUTH_API
    CHILD_MGMT --> CHILD_API
    TASK_MGMT --> TASK_API
    SESSION_MGMT --> SESSION_API
    GAME_ENGINE --> SESSION_API
    REPORTING --> REPORT_API
    BADGE_SYS --> BADGE_API
    STATS --> REPORT_API
    
    AUTH_API --> DB_CONN
    CHILD_API --> DB_CONN
    TASK_API --> DB_CONN
    SESSION_API --> DB_CONN
    REPORT_API --> DB_CONN
    BADGE_API --> DB_CONN
    
    DB_CONN --> PDO
    PDO --> DB
    
    style HTML fill:#667eea,stroke:#764ba2,color:#fff
    style CSS fill:#667eea,stroke:#764ba2,color:#fff
    style JS fill:#667eea,stroke:#764ba2,color:#fff
    style AUTH fill:#10b981,stroke:#059669,color:#fff
    style CHILD_MGMT fill:#10b981,stroke:#059669,color:#fff
    style TASK_MGMT fill:#10b981,stroke:#059669,color:#fff
    style SESSION_MGMT fill:#10b981,stroke:#059669,color:#fff
    style GAME_ENGINE fill:#10b981,stroke:#059669,color:#fff
    style REPORTING fill:#10b981,stroke:#059669,color:#fff
    style BADGE_SYS fill:#10b981,stroke:#059669,color:#fff
    style STATS fill:#10b981,stroke:#059669,color:#fff
    style AUTH_API fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHILD_API fill:#f59e0b,stroke:#ff9800,color:#fff
    style TASK_API fill:#f59e0b,stroke:#ff9800,color:#fff
    style SESSION_API fill:#f59e0b,stroke:#ff9800,color:#fff
    style REPORT_API fill:#f59e0b,stroke:#ff9800,color:#fff
    style BADGE_API fill:#f59e0b,stroke:#ff9800,color:#fff
    style DB fill:#6366f1,stroke:#4f46e5,color:#fff
```

### 2.2. هيكل الوحدات والاعتماديات (Module Structure & Dependencies)

```mermaid
graph LR
    subgraph "Frontend Modules - وحدات الواجهة"
        AUTH_UI[Auth UI<br/>واجهة المصادقة]
        PARENT_UI[Parent Dashboard<br/>لوحة تحكم الأهل]
        CHILD_UI[Child View<br/>واجهة الطفل]
        GAME_UI[Game Views<br/>واجهات الألعاب]
    end
    
    subgraph "Business Logic - منطق الأعمال"
        AUTH_LOGIC[Auth Logic<br/>منطق المصادقة]
        CHILD_LOGIC[Child Logic<br/>منطق الأطفال]
        TASK_LOGIC[Task Logic<br/>منطق المهام]
        SESSION_LOGIC[Session Logic<br/>منطق الجلسات]
        BADGE_LOGIC[Badge Logic<br/>منطق الشارات]
        STATS_LOGIC[Stats Logic<br/>منطق الإحصائيات]
    end
    
    subgraph "Data Services - خدمات البيانات"
        USER_SERVICE[User Service<br/>خدمة المستخدم]
        CHILD_SERVICE[Child Service<br/>خدمة الأطفال]
        TASK_SERVICE[Task Service<br/>خدمة المهام]
        SESSION_SERVICE[Session Service<br/>خدمة الجلسات]
        CONTENT_SERVICE[Content Service<br/>خدمة المحتوى]
    end
    
    AUTH_UI --> AUTH_LOGIC
    PARENT_UI --> CHILD_LOGIC
    PARENT_UI --> TASK_LOGIC
    PARENT_UI --> STATS_LOGIC
    CHILD_UI --> SESSION_LOGIC
    GAME_UI --> SESSION_LOGIC
    
    AUTH_LOGIC --> USER_SERVICE
    CHILD_LOGIC --> CHILD_SERVICE
    TASK_LOGIC --> TASK_SERVICE
    TASK_LOGIC --> CONTENT_SERVICE
    SESSION_LOGIC --> SESSION_SERVICE
    SESSION_LOGIC --> BADGE_LOGIC
    BADGE_LOGIC --> CHILD_SERVICE
    STATS_LOGIC --> SESSION_SERVICE
    STATS_LOGIC --> CHILD_SERVICE
    
    style AUTH_UI fill:#667eea,stroke:#764ba2,color:#fff
    style PARENT_UI fill:#667eea,stroke:#764ba2,color:#fff
    style CHILD_UI fill:#667eea,stroke:#764ba2,color:#fff
    style GAME_UI fill:#667eea,stroke:#764ba2,color:#fff
    style AUTH_LOGIC fill:#10b981,stroke:#059669,color:#fff
    style CHILD_LOGIC fill:#10b981,stroke:#059669,color:#fff
    style TASK_LOGIC fill:#10b981,stroke:#059669,color:#fff
    style SESSION_LOGIC fill:#10b981,stroke:#059669,color:#fff
    style BADGE_LOGIC fill:#10b981,stroke:#059669,color:#fff
    style STATS_LOGIC fill:#10b981,stroke:#059669,color:#fff
    style USER_SERVICE fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHILD_SERVICE fill:#f59e0b,stroke:#ff9800,color:#fff
    style TASK_SERVICE fill:#f59e0b,stroke:#ff9800,color:#fff
    style SESSION_SERVICE fill:#f59e0b,stroke:#ff9800,color:#fff
    style CONTENT_SERVICE fill:#f59e0b,stroke:#ff9800,color:#fff
```

---

## 🔄 3. مخطط تدفق البيانات المنطقي (Data Flow Logical Design)

### 3.1. تدفق بيانات المصادقة (Authentication Data Flow)

```mermaid
flowchart TD
    START([User Action<br/>إجراء المستخدم]) --> INPUT[Enter Credentials<br/>إدخال البيانات]
    INPUT --> VALIDATE{Validate Input<br/>التحقق من البيانات}
    VALIDATE -->|Invalid| ERROR[Show Error<br/>عرض خطأ]
    ERROR --> INPUT
    VALIDATE -->|Valid| API[Send to API<br/>إرسال للواجهة]
    API --> DB_CHECK{Check Database<br/>التحقق من قاعدة البيانات}
    DB_CHECK -->|Not Found| ERROR
    DB_CHECK -->|Found| VERIFY[Verify Password<br/>التحقق من كلمة المرور]
    VERIFY -->|Incorrect| ERROR
    VERIFY -->|Correct| SESSION[Create Session<br/>إنشاء جلسة]
    SESSION --> STORE[Store in Session<br/>حفظ في الجلسة]
    STORE --> REDIRECT[Redirect to Dashboard<br/>إعادة التوجيه للوحة التحكم]
    REDIRECT --> END([Success<br/>نجاح])
    
    style START fill:#10b981,stroke:#059669,color:#fff
    style END fill:#10b981,stroke:#059669,color:#fff
    style VALIDATE fill:#f59e0b,stroke:#ff9800,color:#fff
    style DB_CHECK fill:#f59e0b,stroke:#ff9800,color:#fff
    style VERIFY fill:#f59e0b,stroke:#ff9800,color:#fff
    style ERROR fill:#ef4444,stroke:#dc2626,color:#fff
```

### 3.2. تدفق بيانات جلسة التعلم (Learning Session Data Flow)

```mermaid
flowchart TD
    START([Start Session<br/>بدء الجلسة]) --> ASSIGN[Parent Assigns Task<br/>الوالد يعين المهمة]
    ASSIGN --> SAVE_TASK[Save to child_tasks<br/>حفظ في مهام الأطفال]
    SAVE_TASK --> CHILD_VIEW[Child Views Task<br/>الطفل يعرض المهمة]
    CHILD_VIEW --> START_BTN[Child Clicks Start<br/>الطفل ينقر ابدأ]
    START_BTN --> CREATE_SESSION[Create Session Record<br/>إنشاء سجل الجلسة]
    CREATE_SESSION --> GET_CONTENT[Get Content Data<br/>جلب بيانات المحتوى]
    GET_CONTENT --> OPEN_GAME[Open Game Page<br/>فتح صفحة اللعبة]
    OPEN_GAME --> INIT_GAME[Initialize Game<br/>تهيئة اللعبة]
    INIT_GAME --> START_TIMER[Start Timer<br/>بدء المؤقت]
    START_TIMER --> GAME_LOOP[Game Loop<br/>حلقة اللعبة]
    
    GAME_LOOP --> ANSWER{Answer Question<br/>الإجابة على السؤال}
    ANSWER -->|Correct| ADD_POINTS[Add Points<br/>إضافة نقاط]
    ANSWER -->|Wrong| SHOW_CORRECT[Show Correct Answer<br/>عرض الإجابة الصحيحة]
    ADD_POINTS --> CHECK_MORE{More Questions?<br/>المزيد من الأسئلة؟}
    SHOW_CORRECT --> CHECK_MORE
    CHECK_MORE -->|Yes| GAME_LOOP
    CHECK_MORE -->|No| CALCULATE[Calculate Results<br/>حساب النتائج]
    
    CALCULATE --> CALC_STARS[Calculate Stars<br/>حساب النجوم]
    CALC_STARS --> UPDATE_SESSION[Update Session<br/>تحديث الجلسة]
    UPDATE_SESSION --> CHECK_BADGES[Check for Badges<br/>التحقق من الشارات]
    CHECK_BADGES --> AWARD_BADGES{Award Badges?<br/>منح الشارات؟}
    AWARD_BADGES -->|Yes| UPDATE_BADGES[Update Child Badges<br/>تحديث شارات الطفل]
    AWARD_BADGES -->|No| UPDATE_STATS[Update Statistics<br/>تحديث الإحصائيات]
    UPDATE_BADGES --> UPDATE_STATS
    UPDATE_STATS --> SHOW_RESULTS[Show Results<br/>عرض النتائج]
    SHOW_RESULTS --> END([End Session<br/>إنهاء الجلسة])
    
    style START fill:#10b981,stroke:#059669,color:#fff
    style END fill:#10b981,stroke:#059669,color:#fff
    style ANSWER fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_MORE fill:#f59e0b,stroke:#ff9800,color:#fff
    style AWARD_BADGES fill:#f59e0b,stroke:#ff9800,color:#fff
```

### 3.3. تدفق بيانات التقارير (Reports Data Flow)

```mermaid
flowchart LR
    PARENT[Parent Request<br/>طلب الوالد] --> API[Report API<br/>واجهة التقرير]
    API --> QUERY[Query Sessions<br/>استعلام الجلسات]
    QUERY --> JOIN[Join Tables<br/>ربط الجداول]
    JOIN --> FILTER[Filter by Child<br/>تصفية حسب الطفل]
    FILTER --> CALC[Calculate Stats<br/>حساب الإحصائيات]
    CALC --> FORMAT[Format Data<br/>تنسيق البيانات]
    FORMAT --> JSON[JSON Response<br/>استجابة JSON]
    JSON --> UI[Display in UI<br/>عرض في الواجهة]
    UI --> CARDS[Statistics Cards<br/>بطاقات الإحصائيات]
    UI --> LIST[Session List<br/>قائمة الجلسات]
    
    style PARENT fill:#667eea,stroke:#764ba2,color:#fff
    style API fill:#f59e0b,stroke:#ff9800,color:#fff
    style UI fill:#10b981,stroke:#059669,color:#fff
```

### 3.4. تنفيذ واجهة المستخدم (UI Implementation)

تم تصميم واجهة المستخدم (UI) لمنصة التعلم للأطفال بفلسفة مزدوجة: توفير بيئة احترافية تركز على البيانات للوالدين مع الحفاظ على تجربة نابضة بالحياة وجذابة ومبسطة للأطفال.

#### 3.4.1. لغة التصميم البصري (Visual Design Language)

لإنشاء هوية علامة تجارية متماسكة، تم تطبيق نظام تصميم موحد عالمياً عبر المنصة:

**لوحة الألوان (Color Palette)**: يستخدم الموضوع الأساسي تدرجاً لونياً حديثاً باللون البنفسجي-الأزرق (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`). تم اختيار هذه الألوان لتكون محفزة للأطفال لكن نظيفة بما يكفي لتقارير الوالدين.

**الطباعة (Typography)**: خط Cairo (مأخوذ من Google Fonts) هو الخط الأساسي. تم اختياره خصيصاً لوضوحه الهندسي في العربية، مما يضمن أن المتعلمين الصغار يمكنهم قراءة تعليمات المهام والتعليقات بسهولة.

**هندسة البطاقات (Card Architecture)**: لتنظيم المعلومات، تستخدم الواجهة تخطيطاً قائماً على "البطاقات". المكونات تتميز بخلفية بيضاء، زوايا دائرية (15px)، وظلال خفيفة لخلق إحساس بالعمق والتسلسل الهرمي.

#### 3.4.2. تنفيذ لوحة تحكم الوالدين (Parent Dashboard Implementation)

تركز لوحة تحكم الوالدين على الإدارة والتحليلات. وهي مقسمة إلى ثلاث مناطق وظيفية رئيسية:

**نظرة عامة على الأطفال (Children Overview)**: يعرض كل طفل كبطاقة ديناميكية تحتوي على صورة ملفه الشخصي، اسمه، وأزرار الوصول السريع للتقارير.

**تعيين المهام (Task Assignment)**: واجهة منظمة حيث يمكن للوالدين اختيار المحتوى التعليمي وتحديد حدود الوقت.

**نظام التقارير (Reporting System)**: يستخدم تخطيطاً شبكياً لعرض مقاييس الأداء، بما في ذلك النجوم المكتسبة ونسب الإكمال.

**مثال الكود (Code Snippet)**:

```css
/* تنسيقات بطاقات لوحة تحكم الوالدين */
.child-card {
    background: white;
    border-radius: 16px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    cursor: pointer;
}

.child-card:hover {
    transform: translateY(-5px); /* تفاعل بصري عند المرور */
    box-shadow: 0 20px 25px rgba(0,0,0,0.1);
}
```

#### 3.4.3. تنفيذ واجهة الطفل (Child Interface Implementation)

تم تبسيط عرض الطفل عن قصد لتقليل العبء المعرفي وإبقاء المستخدم مركزاً على نشاط التعلم:

**إبراز المهمة الحالية (Current Task Highlight)**: يتم تقديم المهمة النشطة في بطاقة كبيرة وذات تباين عالي لضمان أن تكون المحور الرئيسي.

**عناصر الألعاب (Gamified Elements)**: يتم عرض الشارات والنجوم بشكل بارز لتوفير مكافآت بصرية فورية للجهد.

**التنقل (Navigation)**: يستخدم أزراراً كبيرة وملائمة للمس مع أيقونات لتسهيل الاستخدام للأطفال الذين قد لا يزالون في طور تطوير مهاراتهم الحركية.

#### 3.4.4. هيكل واجهة الألعاب التعليمية (Educational Game UI Structure)

كل لعبة (العربية، الرياضيات، العلوم، إلخ) تتبع قالب UI موحد لضمان ألا يضطر الطفل لإعادة تعلم التنقل لمواضيع مختلفة:

**رأس اللعبة (Game Header)**: يعرض اسم اللعبة الحالية ومؤقتاً بصرياً في الوقت الفعلي يديره `task_timer.js`.

**منطقة اللعب التفاعلية (Interactive Play Area)**: منطقة مركزية حيث يتم عرض الأسئلة والرسوم المتحركة وعناصر السحب والإفلات.

**نافذة النتائج (Results Modal)**: طبقة علوية تظهر في نهاية الجلسة، تعرض النجوم المكتسبة (1-5) وزر "العودة إلى الرئيسية".

---

### 3.5. كيفية تطوير الوظائف الرئيسية (How Main Functionalities Have Been Developed)

تم تطوير المنصة باستخدام نهج معياري (Modular Approach)، حيث تم تطوير كل ميزة أساسية كمجموعة من API في الخادم (PHP/PDO) ووحدة تحكم في الواجهة الأمامية (JavaScript). يضمن هذا فصلًا واضحًا بين معالجة البيانات والتفاعل مع المستخدم.

#### 3.5.1. منطق نظام المصادقة (Authentication System Logic)

تم تصميم طبقة الأمان لحماية بيانات الوالدين وملفات الأطفال. تم تطبيق عملية أمان من خطوتين:

**تشفير البيانات (Data Encryption)**: أثناء عملية إنشاء الحساب، يستخدم النظام دالة `password_hash()` لتشفير كلمات المرور. يضمن هذا أن كلمات المرور تبقى آمنة حتى في حالة الوصول إلى قاعدة البيانات.

**أمان الجلسة (Session Security)**: بعد تسجيل الدخول، يبدأ النظام جلسة `$_SESSION` في PHP للتحقق من هوية المستخدم عبر الصفحات المختلفة.

**مثال الكود (Code Snippet)**:

```php
// api/login.php - منطق التحقق
$stmt = $pdo->prepare("SELECT * FROM parents WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    session_start();
    $_SESSION['parent_id'] = $user['id'];
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
    echo json_encode(['success' => true]);
}
```

#### 3.5.2. منطق إدارة الأطفال المتعددين (Multi-Child Management Logic)

لتمكين الوالدين من إدارة عدة أطفال، تم تطوير نظام ربط ديناميكي:

**ربط الوالد-الطفل (Parent-Child Linking)**: كل سجل طفل في جدول `children` مرتبط بـ `parent_id`.

**التحميل الديناميكي (Dynamic Loading)**: تستخدم لوحة التحكم Fetch API لطلب فقط الأطفال الذين ينتمون إلى الجلسة النشطة، ثم يتم عرضهم كبطاقات تفاعلية.

#### 3.5.3. نظام الجلسة والمؤقت الدقيق (Precision Session and Timer System)

هذا هو الجزء الأكثر أهمية في المنصة، حيث يراقب وقت تعلم الطفل بدقة:

**الدقة على الخادم (Server-Side Accuracy)**: لمنع الأطفال من تجاوز المؤقت، يسجل النظام `start_time` على الخادم في اللحظة التي تبدأ فيها اللعبة.

**حساب المدة (Duration Calculation)**: عند انتهاء المهمة، لا يعتمد النظام على ساعة العميل. بدلاً من ذلك، يستخدم استعلام SQL لحساب الفرق بين وقت البداية والنهاية.

**مثال الكود (Code Snippet)**:

```sql
-- حساب الوقت الدقيق باستخدام SQL
UPDATE sessions 
SET end_time = NOW(), 
    duration_minutes = GREATEST(?, CEIL(TIMESTAMPDIFF(SECOND, start_time, NOW()) / 60.0)),
    completed_percentage = ?,
    stars = ?,
    status = 'completed' 
WHERE session_id = ?;
```

#### 3.5.4. منطق تكامل الألعاب التعليمية (Educational Games Integration Logic)

يتم دمج الألعاب التعليمية (العربية، الرياضيات، العلوم، إلخ) باستخدام "نمط الجسر" (Bridge Pattern):

**معاملات URL (URL Parameters)**: عندما يبدأ الطفل لعبة، يمرر النظام `session_id` عبر URL.

**واجهة موحدة (Unified API)**: بغض النظر عن نوع اللعبة، جميع الألعاب تستدعي نفس API `complete_task.php` في النهاية لحفظ النتائج، مما يضمن تقارير متسقة للوالد.

**مثال الكود (Code Snippet)**:

```javascript
// js/task_timer.js - مزامنة نتائج اللعبة مع قاعدة البيانات
async function finishLearningSession(stars, progress) {
    const sessionID = new URLSearchParams(window.location.search).get('session_id');
    
    await fetch('../api/complete_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'session_id': sessionID,
            'stars': stars,
            'completed_percentage': progress
        })
    });
}
```

#### 3.5.5. منطق الشارات والمكافآت الآلي (Automated Badges and Reward Logic)

نظام التحفيز آلي بالكامل. بعد كل جلسة، يتم تشغيل سكريبت "Badge Trigger" لتقييم تقدم الطفل:

**فحص الإنجاز (Achievement Check)**: يستعلم النظام عن إجمالي النجوم المكتسبة من قبل الطفل.

**منح الشارة (Badge Awarding)**: إذا وصل الإجمالي إلى عتبة معينة (مثل 50 نجمة)، يتحقق النظام من وجود الشارة لدى الطفل. إذا لم تكن موجودة، يتم منحها وحفظها في جدول `child_badges`.

#### 3.5.6. مخطط التدفق التشغيلي للنظام (System Operational Flowchart)

يوضح المخطط التالي منطق التشغيل الشامل للمنصة، مع إظهار التفاعل بين لوحة تحكم الوالد، واجهة الطفل، وقاعدة البيانات.

```mermaid
flowchart TD
    START([بداية العملية<br/>Process Start]) --> LOGIN[تسجيل دخول الوالد<br/>Parent Login]
    LOGIN --> VALIDATE{التحقق من البيانات<br/>Validate Credentials}
    VALIDATE -->|فشل<br/>Failed| ERROR[عرض خطأ<br/>Show Error]
    ERROR --> LOGIN
    VALIDATE -->|نجح<br/>Success| DASHBOARD[لوحة تحكم الوالد<br/>Parent Dashboard]
    
    DASHBOARD --> GET_CHILDREN[جلب بيانات الأطفال<br/>api/get_children.php]
    GET_CHILDREN --> DISPLAY_CHILDREN[عرض ملفات الأطفال<br/>Display Child Profiles]
    
    DISPLAY_CHILDREN --> ASSIGN_TASK[تعيين مهمة<br/>Assign Task]
    ASSIGN_TASK --> CREATE_TASK[إنشاء مهمة في قاعدة البيانات<br/>Create Task Record]
    CREATE_TASK --> CHILD_INTERFACE[واجهة الطفل<br/>Child Interface]
    
    CHILD_INTERFACE --> CLICK_START[الطفل ينقر ابدأ<br/>Child Clicks Start]
    CLICK_START --> START_SESSION[api/start_session.php<br/>بدء الجلسة]
    START_SESSION --> RECORD_START[تسجيل start_time<br/>Record Start Time]
    RECORD_START --> GENERATE_ID[إنشاء session_id<br/>Generate Session ID]
    
    GENERATE_ID --> LOAD_GAME[تحميل اللعبة<br/>Load Educational Game]
    LOAD_GAME --> GAME_LOOP[حلقة اللعبة<br/>Game Loop]
    
    GAME_LOOP --> TRACK_TIME[تتبع الوقت محلياً<br/>task_timer.js<br/>Track Time Locally]
    GAME_LOOP --> CALCULATE_POINTS[حساب النقاط والنجوم<br/>Calculate Points & Stars]
    
    CALCULATE_POINTS --> COMPLETE_GAME[انتهاء اللعبة<br/>Game Completed]
    COMPLETE_GAME --> COMPLETE_TASK[api/complete_task.php<br/>إكمال المهمة]
    
    COMPLETE_TASK --> CALC_DURATION[حساب المدة الفعلية<br/>TIMESTAMPDIFF<br/>Calculate Actual Duration]
    CALC_DURATION --> SAVE_STARS[حفظ النجوم والنسبة<br/>Save Stars & Percentage]
    
    SAVE_STARS --> BADGE_CHECK[فحص الشارات<br/>Badge Check]
    BADGE_CHECK --> CHECK_TOTAL{التحقق من الإجمالي<br/>Check Total Stars}
    CHECK_TOTAL -->|وصل العتبة<br/>Threshold Met| AWARD_BADGE[منح الشارة<br/>Award Badge<br/>child_badges Table]
    CHECK_TOTAL -->|لم يصل<br/>Not Met| UPDATE_STATS[تحديث الإحصائيات<br/>Update Statistics]
    AWARD_BADGE --> UPDATE_STATS
    
    UPDATE_STATS --> DISPLAY_REWARD[عرض المكافأة<br/>Display Reward on Profile]
    DISPLAY_REWARD --> END([النهاية<br/>End])
    
    style START fill:#10b981,stroke:#059669,color:#fff
    style END fill:#10b981,stroke:#059669,color:#fff
    style DASHBOARD fill:#6366f1,stroke:#4f46e5,color:#fff
    style CHILD_INTERFACE fill:#ec4899,stroke:#db2777,color:#fff
    style LOAD_GAME fill:#f59e0b,stroke:#d97706,color:#fff
    style BADGE_CHECK fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style AWARD_BADGE fill:#06b6d4,stroke:#0891b2,color:#fff
    style VALIDATE fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_TOTAL fill:#f59e0b,stroke:#ff9800,color:#fff
    style ERROR fill:#ef4444,stroke:#dc2626,color:#fff
```

**وصف التدفق المنطقي (Description of the Logical Flow)**:

1. **مرحلة المصادقة (Authentication Phase)**: تبدأ العملية بتسجيل دخول الوالد. يتحقق النظام من البيانات مقابل قاعدة البيانات. عند النجاح، يتم تهيئة لوحة تحكم الوالد، ويتم جلب ملفات الأطفال باستخدام `api/get_children.php`.

2. **تعيين المهمة (Task Assignment)**: يختار الوالد طفلاً ويعين مهمة تعليمية محددة (مثل لعبة الرياضيات). هذا ينشئ مهمة معلقة مرتبطة بمعرف الطفل.

3. **بدء الجلسة (Session Initiation)**: عندما يدخل الطفل إلى واجهته وينقر "ابدأ"، يتم تشغيل `api/start_session.php`. يسجل الخادم `start_time` وينشئ `session_id` فريداً.

4. **نشاط التعلم (Learning Activity)**: يتفاعل الطفل مع اللعبة التعليمية. خلال هذه المرحلة، يتتبع `task_timer.js` المدة محلياً بينما يحسب منطق اللعبة النقاط والنجوم.

5. **مزامنة البيانات (Data Synchronization)**: عند الإكمال، يتم استدعاء `api/complete_task.php`. يحسب الخادم المدة الفعلية باستخدام `TIMESTAMPDIFF` ويحفظ النجوم ونسبة الإكمال.

6. **منطق المكافآت (Badge Trigger)**: بعد حفظ الجلسة مباشرة، يتم تشغيل فحص الشارات. إذا وصل التقدم التراكمي إلى المعايير المحددة (مثل 50 نجمة إجمالية)، يتم إضافة سجل جديد إلى جدول `child_badges`، ويتم عرض المكافأة على ملف الطفل.

---

## 🔌 4. هيكل واجهات البرمجة (API Structure Logical Design)

### 4.1. هيكل API الكامل (Complete API Structure)

```mermaid
graph TB
    subgraph "Authentication APIs - واجهات المصادقة"
        LOGIN[login.php<br/>تسجيل الدخول]
        SIGNUP[signup.php<br/>إنشاء حساب]
        LOGOUT[logout.php<br/>تسجيل الخروج]
        GET_USER[get_current_user.php<br/>جلب المستخدم الحالي]
    end
    
    subgraph "Child Management APIs - واجهات إدارة الأطفال"
        GET_CHILDREN[get_children.php<br/>جلب قائمة الأطفال]
        ADD_CHILD[add_child.php<br/>إضافة طفل]
        UPDATE_CHILD[update_child.php<br/>تحديث طفل]
        DELETE_CHILD[delete_child.php<br/>حذف طفل]
        GET_CHILD_DETAILS[get_child_details.php<br/>تفاصيل الطفل]
        GET_CHILD_TITLE[get_child_title.php<br/>لقب الطفل]
    end
    
    subgraph "Task Management APIs - واجهات إدارة المهام"
        GET_TASKS[get_child_tasks.php<br/>جلب مهام الطفل]
        GET_CURRENT_TASK[get_current_task.php<br/>المهمة الحالية]
        ADD_TASK[tasks/add_task.php<br/>إضافة مهمة]
        DELETE_TASK[tasks/delete_task.php<br/>حذف مهمة]
        REORDER_TASK[tasks/reorder_task.php<br/>إعادة ترتيب المهام]
        GET_CONTENT[tasks/get_all_content.php<br/>جلب جميع المحتويات]
        GET_CONTENT_AGE[tasks/get_content_by_age.php<br/>المحتوى حسب العمر]
    end
    
    subgraph "Session Management APIs - واجهات إدارة الجلسات"
        START_SESSION[start_session.php<br/>بدء جلسة]
        COMPLETE_TASK[complete_task.php<br/>إكمال مهمة]
        GET_SESSIONS[get_child_sessions.php<br/>جلب جلسات الطفل]
    end
    
    subgraph "Content & Game APIs - واجهات المحتوى والألعاب"
        GET_CHILD_CONTENT[get_child_content.php<br/>محتوى الطفل]
        GET_ACHIEVEMENTS[get_child_achievements.php<br/>إنجازات الطفل]
    end
    
    subgraph "Rewards & Statistics APIs - واجهات المكافآت والإحصائيات"
        GET_BADGES[get_child_badges.php<br/>شارات الطفل]
        GET_STATISTICS[get_statistics.php<br/>الإحصائيات]
    end
    
    subgraph "Parent Profile APIs - واجهات ملف الوالد"
        UPDATE_PARENT_NAME[update_parent_name.php<br/>تحديث اسم الوالد]
        UPDATE_PARENT_EMAIL[update_parent_email.php<br/>تحديث بريد الوالد]
    end
    
    LOGIN --> DB[(Database)]
    SIGNUP --> DB
    GET_USER --> DB
    GET_CHILDREN --> DB
    ADD_CHILD --> DB
    UPDATE_CHILD --> DB
    DELETE_CHILD --> DB
    GET_TASKS --> DB
    ADD_TASK --> DB
    START_SESSION --> DB
    COMPLETE_TASK --> DB
    GET_BADGES --> DB
    GET_STATISTICS --> DB
    
    style LOGIN fill:#10b981,stroke:#059669,color:#fff
    style SIGNUP fill:#10b981,stroke:#059669,color:#fff
    style GET_CHILDREN fill:#f59e0b,stroke:#ff9800,color:#fff
    style ADD_CHILD fill:#f59e0b,stroke:#ff9800,color:#fff
    style GET_TASKS fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style START_SESSION fill:#ec4899,stroke:#db2777,color:#fff
    style COMPLETE_TASK fill:#ec4899,stroke:#db2777,color:#fff
    style GET_BADGES fill:#f59e0b,stroke:#ff9800,color:#fff
    style DB fill:#6366f1,stroke:#4f46e5,color:#fff
```

### 4.2. تدفق طلبات API (API Request Flow)

```mermaid
sequenceDiagram
    participant Client as Client (Frontend)
    participant API as API Endpoint
    participant Auth as Authentication
    participant DB as Database
    participant Session as Session Manager
    
    Client->>API: HTTP Request (JSON)
    API->>Auth: Check Authentication
    Auth->>Session: Validate Session
    Session-->>Auth: Session Valid/Invalid
    Auth-->>API: Auth Result
    
    alt Authentication Required & Valid
        API->>DB: Prepare SQL Query
        DB-->>API: Execute Query
        DB-->>API: Return Data
        API->>API: Process Data
        API->>API: Format Response
        API-->>Client: JSON Response (Success)
    else Authentication Invalid
        API-->>Client: JSON Response (Error: Unauthorized)
    else Validation Error
        API-->>Client: JSON Response (Error: Validation)
    end
```

---

## 🎯 5. منطق الأعمال الرئيسي (Core Business Logic)

### 5.1. منطق نظام الشارات والنجوم (Badge & Star Logic)

```mermaid
flowchart TD
    SESSION_COMPLETE[Session Completed<br/>اكتملت الجلسة] --> CALC_PERCENTAGE[Calculate Completion %<br/>حساب نسبة الإكمال]
    CALC_PERCENTAGE --> CALC_STARS[Calculate Stars<br/>حساب النجوم]
    
    CALC_STARS --> CHECK_100{100%?<br/>100%؟}
    CHECK_100 -->|Yes| STARS_5[5 Stars ⭐⭐⭐⭐⭐]
    CHECK_100 -->|No| CHECK_80{80-99%?}
    CHECK_80 -->|Yes| STARS_4[4 Stars ⭐⭐⭐⭐]
    CHECK_80 -->|No| CHECK_60{60-79%?}
    CHECK_60 -->|Yes| STARS_3[3 Stars ⭐⭐⭐]
    CHECK_60 -->|No| CHECK_40{40-59%?}
    CHECK_40 -->|Yes| STARS_2[2 Stars ⭐⭐]
    CHECK_40 -->|No| CHECK_1{1-39%?}
    CHECK_1 -->|Yes| STARS_1[1 Star ⭐]
    CHECK_1 -->|No| STARS_0[0 Stars]
    
    STARS_5 --> UPDATE_TOTAL[Update Total Stars<br/>تحديث إجمالي النجوم]
    STARS_4 --> UPDATE_TOTAL
    STARS_3 --> UPDATE_TOTAL
    STARS_2 --> UPDATE_TOTAL
    STARS_1 --> UPDATE_TOTAL
    STARS_0 --> UPDATE_TOTAL
    
    UPDATE_TOTAL --> CHECK_BADGES[Check Badge Criteria<br/>التحقق من معايير الشارات]
    CHECK_BADGES --> CHECK_FIRST{First Task?<br/>المهمة الأولى؟}
    CHECK_FIRST -->|Yes| AWARD_FIRST[Award First Task Badge<br/>منح شارة المهمة الأولى]
    CHECK_FIRST -->|No| CHECK_SESSIONS{5 Sessions?<br/>5 جلسات؟}
    CHECK_SESSIONS -->|Yes| AWARD_SESSION[Award Session Master<br/>منح بطل الجلسة]
    CHECK_SESSIONS -->|No| CHECK_TIME{30+ Minutes?<br/>30+ دقيقة؟}
    CHECK_TIME -->|Yes| AWARD_TIME[Award Time Champion<br/>منح بطل الوقت]
    CHECK_TIME -->|No| CHECK_PERFECT{Perfect Score?<br/>نتيجة مثالية؟}
    CHECK_PERFECT -->|Yes| AWARD_PERFECT[Award Perfect Score<br/>منح النتيجة المثالية]
    CHECK_PERFECT -->|No| END[End<br/>نهاية]
    
    AWARD_FIRST --> SAVE_BADGE[Save Badge to Database<br/>حفظ الشارة في قاعدة البيانات]
    AWARD_SESSION --> SAVE_BADGE
    AWARD_TIME --> SAVE_BADGE
    AWARD_PERFECT --> SAVE_BADGE
    SAVE_BADGE --> END
    
    style SESSION_COMPLETE fill:#10b981,stroke:#059669,color:#fff
    style END fill:#10b981,stroke:#059669,color:#fff
    style CHECK_100 fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_80 fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_60 fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_40 fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_1 fill:#f59e0b,stroke:#ff9800,color:#fff
```

### 5.2. منطق إدارة المهام (Task Management Logic)

```mermaid
flowchart TD
    PARENT_ACTION[Parent Action<br/>إجراء الوالد] --> SELECT_CONTENT{Select Content<br/>اختيار المحتوى}
    SELECT_CONTENT --> GET_AVAILABLE[Get Available Content<br/>جلب المحتوى المتاح]
    GET_AVAILABLE --> FILTER_AGE[Filter by Child Age<br/>تصفية حسب عمر الطفل]
    FILTER_AGE --> DISPLAY_CONTENT[Display Content List<br/>عرض قائمة المحتوى]
    DISPLAY_CONTENT --> PARENT_SELECTS[Parent Selects Content<br/>الوالد يختار المحتوى]
    PARENT_SELECTS --> CREATE_TASK[Create Task<br/>إنشاء مهمة]
    CREATE_TASK --> ASSIGN_CHILD[Assign to Child<br/>تعيين للطفل]
    ASSIGN_CHILD --> SAVE_CHILD_TASK[Save to child_tasks<br/>حفظ في مهام الأطفال]
    SAVE_CHILD_TASK --> SET_ORDER[Set Order Index<br/>تعيين ترتيب المهمة]
    SET_ORDER --> UPDATE_ORDER_TABLE[Update child_task_order<br/>تحديث جدول الترتيب]
    UPDATE_ORDER_TABLE --> CHILD_VIEW[Child Views Task<br/>الطفل يعرض المهمة]
    
    CHILD_VIEW --> GET_CURRENT[Get Current Task<br/>جلب المهمة الحالية]
    GET_CURRENT --> CHECK_STATUS{Task Status?<br/>حالة المهمة؟}
    CHECK_STATUS -->|Pending| SHOW_START[Show Start Button<br/>عرض زر البدء]
    CHECK_STATUS -->|In Progress| SHOW_RESUME[Show Resume Button<br/>عرض زر الاستئناف]
    CHECK_STATUS -->|Completed| SHOW_COMPLETED[Show Completed Status<br/>عرض حالة الإكمال]
    
    SHOW_START --> START_SESSION[Start Session<br/>بدء الجلسة]
    SHOW_RESUME --> RESUME_SESSION[Resume Session<br/>استئناف الجلسة]
    
    style PARENT_ACTION fill:#667eea,stroke:#764ba2,color:#fff
    style SELECT_CONTENT fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_STATUS fill:#f59e0b,stroke:#ff9800,color:#fff
```

---

## 📐 6. هيكل البيانات المنطقي (Data Structure Logical Design)

### 6.1. هيكل البيانات الرئيسي (Main Data Structures)

```mermaid
classDiagram
    class Parent {
        +int id
        +string first_name
        +string last_name
        +string email
        +string phone
        +string password
        +enum gender
        +timestamp created_at
        +timestamp updated_at
        +getChildren()
        +getStatistics()
        +assignTask()
    }
    
    class Child {
        +int child_id
        +string child_name
        +int parent_id
        +int age
        +enum gender
        +date birth_date
        +string profile_img
        +int total_time
        +int total_stars
        +string title
        +getTasks()
        +getSessions()
        +getBadges()
        +updateStats()
    }
    
    class Content {
        +int content_id
        +string content_name
        +string content_name_ar
        +string title
        +string topic
        +string category
        +enum difficulty
        +int min_age
        +int max_age
        +string icon
        +getTasks()
    }
    
    class Task {
        +int task_id
        +int content_id
        +string task_name
        +string task_name_ar
        +text description
        +int duration_minutes
        +int order_index
        +enum status
        +getContent()
        +getSessions()
    }
    
    class Session {
        +int session_id
        +int child_id
        +int task_id
        +int content_id
        +timestamp start_time
        +timestamp end_time
        +int duration_minutes
        +int completed_percentage
        +enum status
        +calculateStars()
        +complete()
    }
    
    class Badge {
        +int badge_id
        +string badge_name
        +string badge_name_ar
        +string badge_icon
        +int min_star
        +int max_star
        +string color_code
        +int level
        +checkCriteria()
    }
    
    Parent "1" --> "*" Child : has
    Parent "1" --> "*" Task : assigns
    Child "1" --> "*" Session : participates
    Child "1" --> "*" Badge : earns
    Content "1" --> "*" Task : contains
    Task "1" --> "*" Session : executed_in
    Session --> Badge : triggers
```

---

## 🔐 7. التصميم الأمني المنطقي (Security Logical Design)

### 7.1. تدفق الأمان والمصادقة (Security & Authentication Flow)

```mermaid
flowchart TD
    REQUEST[Incoming Request<br/>طلب وارد] --> CHECK_SESSION{Session Exists?<br/>الجلسة موجودة؟}
    CHECK_SESSION -->|No| REDIRECT_LOGIN[Redirect to Login<br/>إعادة توجيه لتسجيل الدخول]
    CHECK_SESSION -->|Yes| VALIDATE_SESSION{Validate Session<br/>التحقق من الجلسة}
    VALIDATE_SESSION -->|Invalid| REDIRECT_LOGIN
    VALIDATE_SESSION -->|Valid| CHECK_CSRF{CSRF Token Valid?<br/>رمز CSRF صحيح؟}
    CHECK_CSRF -->|No| REJECT[Reject Request<br/>رفض الطلب]
    CHECK_CSRF -->|Yes| SANITIZE[Sanitize Input<br/>تنظيف المدخلات]
    SANITIZE --> VALIDATE_INPUT{Validate Input<br/>التحقق من المدخلات}
    VALIDATE_INPUT -->|Invalid| ERROR[Return Error<br/>إرجاع خطأ]
    VALIDATE_INPUT -->|Valid| PREPARE_STMT[Prepare Statement<br/>إعداد الاستعلام]
    PREPARE_STMT --> EXECUTE[Execute Query<br/>تنفيذ الاستعلام]
    EXECUTE --> FILTER_OUTPUT[Filter Output<br/>تصفية المخرجات]
    FILTER_OUTPUT --> RESPONSE[Return Response<br/>إرجاع الاستجابة]
    
    style REQUEST fill:#10b981,stroke:#059669,color:#fff
    style RESPONSE fill:#10b981,stroke:#059669,color:#fff
    style CHECK_SESSION fill:#f59e0b,stroke:#ff9800,color:#fff
    style VALIDATE_SESSION fill:#f59e0b,stroke:#ff9800,color:#fff
    style CHECK_CSRF fill:#f59e0b,stroke:#ff9800,color:#fff
    style VALIDATE_INPUT fill:#f59e0b,stroke:#ff9800,color:#fff
    style REJECT fill:#ef4444,stroke:#dc2626,color:#fff
    style ERROR fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## 🎨 8. تصميم واجهة المستخدم (User Interface Design)

### 8.1. هيكل الصفحات والتنقل (Pages Structure & Navigation)

```mermaid
flowchart TD
    START([البداية]) --> INDEX[index.html<br/>الصفحة الرئيسية<br/>تسجيل الدخول/إنشاء حساب]
    
    INDEX -->|تسجيل دخول/إنشاء حساب| DASHBOARD[dashboard.html<br/>لوحة التحكم المؤقتة]
    DASHBOARD --> PARENT_DASHBOARD[parent_dashboard.html<br/>لوحة تحكم الأهل]
    
    PARENT_DASHBOARD -->|تسجيل الدخول| CHILD_VIEW[child_view.html<br/>واجهة الطفل]
    
    CHILD_VIEW -->|بدء مهمة| CONTENT[content_view.html<br/>عرض المحتوى]
    
    CONTENT -->|لعبة| ARABIC_GAME[arabic_game.html<br/>لعبة اللغة العربية]
    CONTENT -->|لعبة| ARABIC_WORD[arabic_word_formation_game.html<br/>لعبة تكوين الكلمات]
    CONTENT -->|لعبة| MATH_GAME[math_game.html<br/>لعبة الرياضيات]
    CONTENT -->|لعبة| MATH_COMP[math_comparison_game.html<br/>لعبة المقارنة]
    CONTENT -->|لعبة| SCIENCE_ANIMALS[science_animals_game.html<br/>لعبة الحيوانات]
    CONTENT -->|لعبة| SCIENCE_SENSES[science_senses_game.html<br/>لعبة الحواس]
    
    ARABIC_GAME -->|إكمال| CHILD_VIEW
    ARABIC_WORD -->|إكمال| CHILD_VIEW
    MATH_GAME -->|إكمال| CHILD_VIEW
    MATH_COMP -->|إكمال| CHILD_VIEW
    SCIENCE_ANIMALS -->|إكمال| CHILD_VIEW
    SCIENCE_SENSES -->|إكمال| CHILD_VIEW
    
    CHILD_VIEW -->|خروج| PARENT_DASHBOARD
    PARENT_DASHBOARD -->|تسجيل الخروج| INDEX
    
    style INDEX fill:#6366f1,stroke:#4f46e5,color:#fff
    style PARENT_DASHBOARD fill:#ec4899,stroke:#db2777,color:#fff
    style CHILD_VIEW fill:#10b981,stroke:#059669,color:#fff
    style CONTENT fill:#f59e0b,stroke:#d97706,color:#fff
    style ARABIC_GAME fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style MATH_GAME fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style SCIENCE_ANIMALS fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

### 8.2. هيكل صفحة تسجيل الدخول (Login Page Structure)

```mermaid
graph TB
    LOGIN_PAGE[index.html<br/>صفحة تسجيل الدخول]
    
    LOGIN_PAGE --> FEATURES[قسم المميزات<br/>Features Section]
    LOGIN_PAGE --> AUTH[قسم المصادقة<br/>Auth Section]
    
    FEATURES --> LOGO[شعار المنصة<br/>Platform Logo]
    FEATURES --> FEATURES_LIST[قائمة المميزات<br/>6 ميزات تعليمية]
    
    AUTH --> AUTH_TABS[تبويبات المصادقة<br/>Login/Signup Tabs]
    AUTH --> LOGIN_FORM[نموذج تسجيل الدخول<br/>Login Form]
    AUTH --> SIGNUP_FORM[نموذج إنشاء حساب<br/>Signup Form]
    
    LOGIN_FORM --> LOGIN_EMAIL[البريد الإلكتروني<br/>Email Input]
    LOGIN_FORM --> LOGIN_PASS[كلمة المرور<br/>Password Input]
    LOGIN_FORM --> REMEMBER[تذكرني<br/>Remember Me]
    LOGIN_FORM --> LOGIN_BTN[زر تسجيل الدخول<br/>Login Button]
    
    SIGNUP_FORM --> SIGNUP_NAME[الاسم الكامل<br/>Full Name]
    SIGNUP_FORM --> SIGNUP_EMAIL[البريد الإلكتروني<br/>Email]
    SIGNUP_FORM --> SIGNUP_PHONE[رقم الهاتف<br/>Phone]
    SIGNUP_FORM --> SIGNUP_GENDER[الجنس<br/>Gender]
    SIGNUP_FORM --> SIGNUP_PASS[كلمة المرور<br/>Password]
    SIGNUP_FORM --> SIGNUP_CONFIRM[تأكيد كلمة المرور<br/>Confirm Password]
    SIGNUP_FORM --> SIGNUP_BTN[زر إنشاء حساب<br/>Signup Button]
    
    style LOGIN_PAGE fill:#6366f1,stroke:#4f46e5,color:#fff
    style FEATURES fill:#f59e0b,stroke:#d97706,color:#fff
    style AUTH fill:#10b981,stroke:#059669,color:#fff
```

### 8.3. هيكل لوحة تحكم الأهل (Parent Dashboard Structure)

```mermaid
graph TB
    PARENT_DASH[parent_dashboard.html<br/>لوحة تحكم الأهل]
    
    PARENT_DASH --> HEADER[رأس الصفحة<br/>Header]
    PARENT_DASH --> NAV[التنقل<br/>Navigation Tabs]
    PARENT_DASH --> MAIN[المحتوى الرئيسي<br/>Main Content]
    PARENT_DASH --> MODALS[النوافذ المنبثقة<br/>Modals]
    
    HEADER --> HEADER_TITLE[عنوان المنصة<br/>Platform Title]
    HEADER --> HEADER_WELCOME[رسالة الترحيب<br/>Welcome Message]
    HEADER --> HEADER_SETTINGS[زر الإعدادات<br/>Settings Button]
    HEADER --> HEADER_LOGOUT[زر تسجيل الخروج<br/>Logout Button]
    
    NAV --> TAB_REPORTS[تبويب التقارير<br/>Reports Tab]
    NAV --> TAB_CHILDREN[تبويب الأطفال<br/>Children Tab]
    NAV --> TAB_PERSONAL[تبويب المعلومات الشخصية<br/>Personal Info Tab]
    
    MAIN --> SECTION_PERSONAL[قسم المعلومات الشخصية<br/>Personal Information Section]
    MAIN --> SECTION_CHILDREN[قسم إدارة الأطفال<br/>Children Management Section]
    MAIN --> SECTION_REPORTS[قسم التقارير<br/>Reports Section]
    
    SECTION_PERSONAL --> PERSONAL_INFO[معلومات الوالد<br/>Parent Info Grid]
    PERSONAL_INFO --> INFO_NAME[الاسم<br/>Name]
    PERSONAL_INFO --> INFO_GENDER[الجنس<br/>Gender]
    PERSONAL_INFO --> INFO_EMAIL[البريد<br/>Email]
    PERSONAL_INFO --> INFO_COUNT[عدد الأطفال<br/>Children Count]
    
    SECTION_CHILDREN --> CHILDREN_HEADER[رأس القسم<br/>Section Header]
    CHILDREN_HEADER --> BTN_ADD_CHILD[زر إضافة طفل<br/>Add Child Button]
    SECTION_CHILDREN --> CHILDREN_GRID[شبكة الأطفال<br/>Children Grid]
    CHILDREN_GRID --> CHILD_CARD[بطاقة الطفل<br/>Child Card]
    CHILD_CARD --> CHILD_AVATAR[صورة الطفل<br/>Avatar]
    CHILD_CARD --> CHILD_INFO[معلومات الطفل<br/>Child Info]
    CHILD_CARD --> CHILD_STATS[إحصائيات الطفل<br/>Child Stats]
    CHILD_CARD --> CHILD_BADGES[شارات الطفل<br/>Child Badges]
    CHILD_CARD --> CHILD_BTNS[أزرار الإدارة<br/>Action Buttons]
    CHILD_BTNS --> BTN_START[زر البدء<br/>Start Button]
    CHILD_BTNS --> BTN_MANAGE[زر الإدارة<br/>Manage Button]
    
    SECTION_REPORTS --> REPORTS_CONTAINER[حاوية التقارير<br/>Reports Container]
    
    MODALS --> MODAL_ADD_CHILD[نافذة إضافة طفل<br/>Add Child Modal]
    MODALS --> MODAL_EDIT_CHILD[نافذة تعديل طفل<br/>Edit Child Modal]
    MODALS --> MODAL_TASKS[نافذة إدارة المهام<br/>Tasks Management Modal]
    MODALS --> MODAL_SETTINGS[نافذة الإعدادات<br/>Settings Modal]
    
    MODAL_ADD_CHILD --> FORM_ADD_CHILD[نموذج إضافة طفل<br/>Add Child Form]
    FORM_ADD_CHILD --> INPUT_CHILD_NAME[اسم الطفل<br/>Child Name]
    FORM_ADD_CHILD --> INPUT_CHILD_GENDER[جنس الطفل<br/>Gender]
    FORM_ADD_CHILD --> INPUT_BIRTH_DATE[تاريخ الميلاد<br/>Birth Date]
    
    style PARENT_DASH fill:#ec4899,stroke:#db2777,color:#fff
    style HEADER fill:#6366f1,stroke:#4f46e5,color:#fff
    style SECTION_CHILDREN fill:#10b981,stroke:#059669,color:#fff
    style SECTION_REPORTS fill:#f59e0b,stroke:#d97706,color:#fff
    style MODALS fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

### 8.4. هيكل واجهة الطفل (Child View Structure)

```mermaid
graph TB
    CHILD_VIEW[child_view.html<br/>واجهة الطفل]
    
    CHILD_VIEW --> CHILD_HEADER[رأس الطفل<br/>Child Header]
    CHILD_VIEW --> CURRENT_TASK[المهمة الحالية<br/>Current Task Section]
    CHILD_VIEW --> ALL_TASKS[جميع المهام<br/>All Tasks Section]
    CHILD_VIEW --> BADGES_SECTION[قسم الشارات<br/>Badges Section]
    
    CHILD_HEADER --> CHILD_AVATAR_LARGE[صورة الطفل الكبيرة<br/>Large Avatar]
    CHILD_HEADER --> CHILD_NAME_DISPLAY[اسم الطفل<br/>Child Name]
    CHILD_HEADER --> CHILD_TITLE[لقب الطفل<br/>Child Title]
    CHILD_HEADER --> CHILD_STARS[النجوم الإجمالية<br/>Total Stars]
    CHILD_HEADER --> CHILD_STATS_DISPLAY[إحصائيات الطفل<br/>Child Stats]
    CHILD_HEADER --> BTN_EXIT[زر الخروج<br/>Exit Button]
    
    CURRENT_TASK --> TASK_CARD[بطاقة المهمة<br/>Task Card]
    TASK_CARD --> TASK_HEADER[رأس المهمة<br/>Task Header]
    TASK_HEADER --> TASK_ICON[أيقونة المهمة<br/>Task Icon]
    TASK_HEADER --> TASK_NAME[اسم المهمة<br/>Task Name]
    TASK_HEADER --> TASK_SUBJECT[موضوع المهمة<br/>Task Subject]
    
    TASK_CARD --> TASK_TIMER[مؤقت المهمة<br/>Task Timer]
    TASK_TIMER --> TIMER_CIRCLE[دائرة المؤقت<br/>Timer Circle]
    TASK_TIMER --> TIMER_TEXT[نص المؤقت<br/>Timer Text]
    
    TASK_CARD --> TASK_DESC[وصف المهمة<br/>Task Description]
    TASK_CARD --> PARENT_NOTE[ملاحظات الأهل<br/>Parent Note]
    TASK_CARD --> TASK_ACTIONS[أزرار المهمة<br/>Task Actions]
    TASK_ACTIONS --> BTN_START_TASK[زر البدء<br/>Start Task Button]
    TASK_ACTIONS --> BTN_PAUSE_TASK[زر الإيقاف<br/>Pause Button]
    TASK_ACTIONS --> BTN_COMPLETE_TASK[زر الإكمال<br/>Complete Button]
    
    ALL_TASKS --> TASKS_LIST[قائمة المهام<br/>Tasks List]
    TASKS_LIST --> TASK_ITEM[عنصر مهمة<br/>Task Item Card]
    TASK_ITEM --> TASK_NUMBER[رقم المهمة<br/>Task Number]
    TASK_ITEM --> TASK_ITEM_INFO[معلومات المهمة<br/>Task Info]
    TASK_ITEM --> TASK_STATUS[حالة المهمة<br/>Task Status]
    
    BADGES_SECTION --> BADGES_GRID[شبكة الشارات<br/>Badges Grid]
    BADGES_GRID --> BADGE_ITEM[بطاقة الشارة<br/>Badge Card]
    BADGE_ITEM --> BADGE_ICON[أيقونة الشارة<br/>Badge Icon]
    BADGE_ITEM --> BADGE_TITLE[عنوان الشارة<br/>Badge Title]
    BADGE_ITEM --> BADGE_STARS[نجوم الشارة<br/>Badge Stars]
    
    style CHILD_VIEW fill:#10b981,stroke:#059669,color:#fff
    style CHILD_HEADER fill:#6366f1,stroke:#4f46e5,color:#fff
    style CURRENT_TASK fill:#f59e0b,stroke:#d97706,color:#fff
    style ALL_TASKS fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style BADGES_SECTION fill:#ec4899,stroke:#db2777,color:#fff
```

### 8.5. هيكل صفحات الألعاب (Game Pages Structure)

```mermaid
graph TB
    GAME_PAGE[صفحة لعبة<br/>Game Page]
    
    GAME_PAGE --> GAME_HEADER[رأس اللعبة<br/>Game Header]
    GAME_PAGE --> GAME_STATS[إحصائيات اللعبة<br/>Game Stats]
    GAME_PAGE --> GAME_SCREEN[شاشة اللعبة<br/>Game Screen]
    GAME_PAGE --> GAME_OVER[شاشة انتهاء اللعبة<br/>Game Over Screen]
    
    GAME_HEADER --> GAME_TITLE[عنوان اللعبة<br/>Game Title]
    GAME_HEADER --> BTN_BACK[زر العودة<br/>Back Button]
    
    GAME_STATS --> STAT_SCORE[النقاط<br/>Score]
    GAME_STATS --> STAT_LEVEL[المستوى<br/>Level]
    GAME_STATS --> STAT_TIME[الوقت<br/>Time]
    GAME_STATS --> STAT_STARS[النجوم<br/>Stars]
    
    GAME_SCREEN --> GAME_CONTENT[محتوى اللعبة<br/>Game Content]
    GAME_CONTENT --> GAME_QUESTIONS[الأسئلة<br/>Questions]
    GAME_CONTENT --> GAME_ANSWERS[الإجابات<br/>Answers]
    GAME_CONTENT --> GAME_FEEDBACK[التغذية الراجعة<br/>Feedback]
    
    GAME_OVER --> OVER_CONTENT[محتوى النهاية<br/>Over Content]
    OVER_CONTENT --> OVER_SCORE[النقاط النهائية<br/>Final Score]
    OVER_CONTENT --> OVER_STARS[النجوم المكتسبة<br/>Stars Earned]
    OVER_CONTENT --> OVER_BADGE[الشارة المكتسبة<br/>Badge Earned]
    OVER_CONTENT --> OVER_BTNS[أزرار الإجراء<br/>Action Buttons]
    OVER_BTNS --> BTN_PLAY_AGAIN[لعب مرة أخرى<br/>Play Again]
    OVER_BTNS --> BTN_RETURN[العودة<br/>Return]
    
    style GAME_PAGE fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style GAME_SCREEN fill:#6366f1,stroke:#4f46e5,color:#fff
    style GAME_OVER fill:#f59e0b,stroke:#d97706,color:#fff
```

### 8.6. هيكل المكونات الرئيسية (Main Components Structure)

```mermaid
graph LR
    UI_COMPONENTS[مكونات الواجهة<br/>UI Components]
    
    UI_COMPONENTS --> LAYOUT[التخطيط<br/>Layout Components]
    UI_COMPONENTS --> FORMS[النماذج<br/>Form Components]
    UI_COMPONENTS --> CARDS[البطاقات<br/>Card Components]
    UI_COMPONENTS --> MODALS[النوافذ<br/>Modal Components]
    UI_COMPONENTS --> NAVIGATION[التنقل<br/>Navigation Components]
    
    LAYOUT --> HEADER_COMP[رأس الصفحة<br/>Header]
    LAYOUT --> FOOTER_COMP[تذييل الصفحة<br/>Footer]
    LAYOUT --> GRID_LAYOUT[تخطيط الشبكة<br/>Grid Layout]
    LAYOUT --> FLEX_LAYOUT[تخطيط Flex<br/>Flex Layout]
    
    FORMS --> INPUT_FIELD[حقل الإدخال<br/>Input Field]
    FORMS --> BUTTON[زر<br/>Button]
    FORMS --> SELECT[قائمة منسدلة<br/>Select]
    FORMS --> CHECKBOX[مربع اختيار<br/>Checkbox]
    
    CARDS --> CHILD_CARD_COMP[بطاقة الطفل<br/>Child Card]
    CARDS --> TASK_CARD_COMP[بطاقة المهمة<br/>Task Card]
    CARDS --> BADGE_CARD_COMP[بطاقة الشارة<br/>Badge Card]
    CARDS --> STAT_CARD_COMP[بطاقة الإحصائية<br/>Stat Card]
    
    MODALS --> MODAL_BASE[القاعدة<br/>Modal Base]
    MODAL_BASE --> MODAL_HEADER[الرأس<br/>Modal Header]
    MODAL_BASE --> MODAL_BODY[المحتوى<br/>Modal Body]
    MODAL_BASE --> MODAL_FOOTER[التذييل<br/>Modal Footer]
    
    NAVIGATION --> TABS[التبويبات<br/>Tabs]
    NAVIGATION --> MENU[القائمة<br/>Menu]
    NAVIGATION --> BREADCRUMB[مسار التنقل<br/>Breadcrumb]
    
    style UI_COMPONENTS fill:#6366f1,stroke:#4f46e5,color:#fff
    style LAYOUT fill:#ec4899,stroke:#db2777,color:#fff
    style FORMS fill:#10b981,stroke:#059669,color:#fff
    style CARDS fill:#f59e0b,stroke:#d97706,color:#fff
    style MODALS fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style NAVIGATION fill:#06b6d4,stroke:#0891b2,color:#fff
```

### 8.7. الوصف النصي للواجهات (Textual UI Descriptions)

يوضح هذا القسم وصفاً نصياً تفصيلياً لتصميم وتخطيط جميع صفحات المنصة، بما في ذلك المكونات وترتيبها ووظائفها.

#### 8.7.1. صفحة تسجيل الدخول (Login Page Layout)

**الموقع**: `html/index.html`

**التخطيط العام**: الصفحة مقسمة إلى قسمين رئيسيين بجانب بعضهما البعض:

**القسم الأيسر - قسم المميزات (Features Section)**:
- يحتوي على شعار المنصة في الأعلى بعنوان "🎓 منصة التعلم للأطفال"
- أسفل الشعار توجد قائمة بستة مميزات رئيسية، كل مميزة معروضة في بطاقة منفصلة:
  1. **ألعاب تعليمية** 🎮: نص يصف مجموعة متنوعة من الألعاب التفاعلية
  2. **محتوى متنوع** 📚: نص عن آلاف الدروس والأنشطة
  3. **نظام المكافآت** 🏆: نص عن النقاط والجوائز
  4. **متابعة الوالدين** 👨‍👩‍👧‍👦: نص عن التقارير المفصلة
  5. **تقارير التقدم** 📊: نص عن الإحصائيات الشاملة
  6. **أمان عالي** 🔒: نص عن البيئة الآمنة

**القسم الأيمن - قسم المصادقة (Auth Section)**:
- في الأعلى توجد تبويبات للتبديل بين "تسجيل الدخول" و "إنشاء حساب جديد"
- **نموذج تسجيل الدخول** يحتوي على:
  - عنوان ترحيبي: "مرحباً بعودتك!"
  - حقل إدخال البريد الإلكتروني مع تسمية واضحة
  - حقل إدخال كلمة المرور مع زر لإظهار/إخفاء كلمة المرور
  - مربع اختيار "تذكرني"
  - زر كبير لتسجيل الدخول بلون مميز
  - رسائل الخطأ تظهر أسفل الحقول عند الحاجة
- **نموذج إنشاء حساب** يحتوي على:
  - الحقول: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، الجنس (أب/أم)، كلمة المرور، تأكيد كلمة المرور
  - زر لإنشاء الحساب
  - رسائل التحقق والخطأ

**الألوان والتصميم**: خلفية متدرجة (gradient) باللون البنفسجي-الأزرق، البطاقات بيضاء مع ظل خفيف، تصميم نظيف وحديث

**الرسم التوضيحي النصي للتصميم (Textual UI Sketch)**:

**القسم الأيسر - عرض المميزات (Features Section - 50% من العرض)**:
- **الشعار**: في أعلى القسم، عنوان كبير "🎓 منصة التعلم للأطفال" بخط واضح وجذاب
- **قائمة المميزات**: أسفل الشعار، ست بطاقات مميزات مرتبة عمودياً بمسافات متساوية
  - **بطاقة الميزة الواحدة** تحتوي على:
    - أيقونة كبيرة في الأعلى: 🎮 أو 📚 أو 🏆 أو 👨‍👩‍👧‍👦 أو 📊 أو 🔒
    - عنوان الميزة بخط عريض وواضح
    - نص وصفي تحته بخط أصغر يشرح الميزة
  - **تصميم البطاقة**: خلفية بيضاء أو شفافة مع حدود خفيفة وظل خفيف لإبرازها

**القسم الأيمن - منطقة المصادقة (Auth Section - 50% من العرض)**:
- **النافذة الرئيسية**: نافذة بيضاء بارزة في المنتصف مع ظل لإبرازها عن الخلفية
- **شريط التبويبات**: في أعلى النافذة، تبويبان جنباً إلى جنب
  - التبويب النشط: "تسجيل الدخول" بخلفية ملونة وحدود بارزة
  - التبويب غير النشط: "إنشاء حساب جديد" بخلفية فاتحة
- **نموذج تسجيل الدخول** (يظهر عند النقر على تبويب تسجيل الدخول):
  - **العنوان الترحيبي**: "مرحباً بعودتك!" بخط كبير في الأعلى
  - **حقل البريد الإلكتروني**:
    - تسمية الحقل: "البريد الإلكتروني"
    - حقل إدخال مستطيل مع حدود خفيفة
    - مساحة كافية لإدخال النص
  - **حقل كلمة المرور**:
    - تسمية الحقل: "كلمة المرور"
    - حقل إدخال مع زر عين 👁️ على اليمين لإظهار/إخفاء كلمة المرور
    - أسفل الحقل: مربع اختيار صغير "تذكرني" مع تسمية
  - **زر الإرسال**: زر كبير أسفل جميع الحقول بنص "تسجيل الدخول" بخلفية ملونة جذابة
- **نموذج إنشاء حساب** (يظهر عند النقر على تبويب إنشاء حساب، مخفى افتراضياً):
  - نفس تخطيط نموذج تسجيل الدخول
  - حقول إضافية: الاسم الكامل، رقم الهاتف، الجنس (قائمة منسدلة)، تأكيد كلمة المرور

**التفاصيل البصرية والتصميم**:
- **الخلفية العامة**: تدرج لوني (gradient) من البنفسجي إلى الأزرق يعطي مظهراً عصرياً
- **البطاقات والمكونات**: خلفية بيضاء مع ظل خفيف لإعطاء عمق بصري
- **الأزرار**: ألوان زاهية (أخضر/بنفسجي) مع تأثير hover (تغيير اللون عند المرور بالفأرة)
- **حقول الإدخال**: حدود خفيفة تتحول إلى لون مميز وأكثر سماكة عند التركيز (focus state)
- **التصميم المتجاوب**: على الشاشات الصغيرة (موبايل/تابلت)، الأقسام تصبح عمودية بدلاً من أفقية لسهولة الاستخدام

**الرسم التوضيحي البصري (Visual Sketch)**:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                         منصة التعلم للأطفال 🎓                            ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────┐  ┌──────────────────────────────┐ ║
║  │                                     │  │                              │ ║
║  │  🎓 منصة التعلم للأطفال            │  │                              │ ║
║  │                                     │  │                              │ ║
║  │  ┌───────────────────────────────┐  │  │  ┌────────────────────────┐ │ ║
║  │  │  🎮                          │  │  │  │ تسجيل الدخول │ حساب   │ │ ║
║  │  │  ألعاب تعليمية               │  │  │  └────────────────────────┘ │ ║
║  │  │  مجموعة متنوعة من الألعاب    │  │  │                              │ ║
║  │  │  التفاعلية                   │  │  │  ┌────────────────────────┐ │ ║
║  │  └───────────────────────────────┘  │  │  │  مرحباً بعودتك!        │ │ ║
║  │                                     │  │  └────────────────────────┘ │ ║
║  │  ┌───────────────────────────────┐  │  │                              │ ║
║  │  │  📚                          │  │  │  البريد الإلكتروني:        │ ║
║  │  │  محتوى متنوع                │  │  │  ┌────────────────────────┐ │ ║
║  │  │  آلاف الدروس والأنشطة       │  │  │  │                        │ │ ║
║  │  └───────────────────────────────┘  │  │  └────────────────────────┘ │ ║
║  │                                     │  │                              │ ║
║  │  ┌───────────────────────────────┐  │  │  كلمة المرور:               │ ║
║  │  │  🏆                          │  │  │  ┌──────────────────────┐  │ ║
║  │  │  نظام المكافآت              │  │  │  │                  👁️ │  │ ║
║  │  │  نقاط وجوائز عند الإكمال    │  │  │  └──────────────────────┘  │ ║
║  │  └───────────────────────────────┘  │  │                              │ ║
║  │                                     │  │  ┌────────────────────────┐ │ ║
║  │  ┌───────────────────────────────┐  │  │  │ ☐ تذكرني              │ │ ║
║  │  │  👨‍👩‍👧‍👦                      │  │  │  └────────────────────────┘ │ ║
║  │  │  متابعة الوالدين             │  │  │                              │ ║
║  │  │  تقارير مفصلة للتقدم         │  │  │  ┌────────────────────────┐ │ ║
║  │  └───────────────────────────────┘  │  │  │   تسجيل الدخول         │ │ ║
║  │                                     │  │  └────────────────────────┘ │ ║
║  │  ┌───────────────────────────────┐  │  │                              │ ║
║  │  │  📊                          │  │  │                              │ ║
║  │  │  تقارير التقدم              │  │  │                              │ ║
║  │  │  إحصائيات شاملة             │  │  │                              │ ║
║  │  └───────────────────────────────┘  │  │                              │ ║
║  │                                     │  │                              │ ║
║  │  ┌───────────────────────────────┐  │  │                              │ ║
║  │  │  🔒                          │  │  │                              │ ║
║  │  │  أمان عالي                  │  │  │                              │ ║
║  │  │  بيئة آمنة ومحمية           │  │  │                              │ ║
║  │  └───────────────────────────────┘  │  │                              │ ║
║  │                                     │  │                              │ ║
║  └─────────────────────────────────────┘  └──────────────────────────────┘ ║
║                                                                           ║
║      القسم الأيسر (50%) - المميزات        القسم الأيمن (50%) - المصادقة    ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

#### 8.7.2. لوحة تحكم الأهل (Parent Dashboard Layout)

**الموقع**: `html/parent_dashboard.html`

**التخطيط العام**: الصفحة تحتوي على رأس ثابت وتبويبات تنقل ومحتوى رئيسي.

**رأس الصفحة (Header)**:
- **الجانب الأيمن**: عنوان المنصة "🌞 منصة تعليم الأطفال"
- **الجانب الأيسر**: رسالة ترحيبية مع اسم الوالد/الوالدة، زر الإعدادات (⚙️)، وزر تسجيل الخروج

**شريط التبويبات (Navigation Tabs)**:
- ثلاثة تبويبات رئيسية في صف واحد:
  1. **📊 التقارير**: لعرض تقارير التقدم والإحصائيات
  2. **👶 التحكم بالأطفال**: لإدارة الأطفال (التبويب الافتراضي)
  3. **👤 المعلومات الشخصية**: لعرض بيانات الوالد

**القسم الرئيسي - التحكم بالأطفال**:
- **رأس القسم**: يحتوي على عنوان "👶 أطفالك" على اليسار وزر "➕ إضافة طفل جديد" على اليمين
- **شبكة الأطفال**: عرض الأطفال في تخطيط شبكي (Grid Layout) بثلاثة أعمدة
  - **بطاقة الطفل** تحتوي على:
    - صورة رمزية دائرية (Avatar) في الأعلى مع اسم الطفل
    - معلومات الطفل: الاسم والعمر
    - إحصائيات: عدد النجوم (⭐) والوقت الإجمالي (⏱️)
    - الشارات المكتسبة: أيقونات الشارات بجانب بعضها
    - أزرار الإجراءات: زر "▶️ البدء" (أخضر) وزر "⚙️ الإدارة" (رمادي)

**قسم التقارير** (يظهر عند النقر على تبويب التقارير):
- إحصائيات عامة لكل طفل: الوقت الكلي، النجوم الإجمالية، عدد المهام
- قائمة الجلسات الأخيرة مع تفاصيل كل جلسة

**قسم المعلومات الشخصية** (يظهر عند النقر على التبويب):
- عرض معلومات الوالد في تخطيط شبكي: الاسم، الجنس، البريد الإلكتروني، عدد الأطفال

**النوافذ المنبثقة (Modals)**:
- **نافذة إضافة طفل**: نموذج يحتوي على حقول اسم الطفل، الجنس، وتاريخ الميلاد
- **نافذة تعديل طفل**: نموذج مماثل مع بيانات الطفل الحالية
- **نافذة إدارة المهام**: لوحة لإدارة مهام الطفل (إضافة، تعديل، حذف، ترتيب)
- **نافذة الإعدادات**: إعدادات حساب الوالد

#### 8.7.3. واجهة الطفل (Child View Layout)

**الموقع**: `html/child_view.html`

**التخطيط العام**: صفحة عمودية تحتوي على عدة أقسام متراصة.

**رأس الطفل (Child Header)**:
- **الجانب الأيسر**: صورة رمزية كبيرة دائرية للطفل (Avatar) مع اسم الطفل تحتها
- **الوسط**: اللقب الحالي للطفل (مثل "مبتدئ 🎈") والنجوم الإجمالية (⭐ 120 نجمة)
- **الأسفل**: الوقت الإجمالي للتعلم
- **الجانب الأيمن**: زر "خروج" للعودة إلى لوحة تحكم الوالد

**قسم المهمة الحالية (Current Task Section)**:
- **بطاقة المهمة** تحتوي على:
  - **رأس المهمة**: أيقونة المهمة (📚) مع اسم المهمة (مثل "لعبة الرياضيات - الجمع") والموضوع (مثل "الرياضيات - المستوى 1")
  - **مؤقت دائري**: دائرة تحتوي على الوقت المتبقي (مثل 15:00) مع دائرة تقدم تتحرك حول المحيط
  - **وصف المهمة**: نص يصف المهمة التعليمية
  - **ملاحظات الأهل**: قسم منفصل بعنوان "📝 ملاحظات من الأهل:" يعرض ملاحظات كتبها الوالد للطفل
  - **أزرار الإجراءات**:
    - زر "ابدأ المهمة" (يظهر عندما تكون المهمة معلقة)
    - زر "إيقاف مؤقت" (يظهر أثناء التنفيذ)
    - زر "إكمال المهمة" (يظهر أثناء التنفيذ أو عند الإيقاف المؤقت)

**قسم جميع المهام (All Tasks Section)**:
- **عنوان القسم**: "📋 جميع المهام"
- **قائمة المهام**: كل مهمة في بطاقة منفصلة تحتوي على:
  - رقم المهمة في دائرة ملونة (مثل [1])
  - أيقونة واسم المهمة
  - حالة المهمة (معلق، قيد التنفيذ، مكتمل) بعلامة ملونة

**قسم الشارات (Badges Section)**:
- **عنوان القسم**: "شاراتي 🏆"
- **شبكة الشارات**: الشارات معروضة في تخطيط شبكي (Grid Layout) بأربعة أعمدة
  - **بطاقة الشارة** تحتوي على:
    - أيقونة الشارة الكبيرة (مثل 🎈، 🌟، ⭐، 🏆)
    - عنوان الشارة (مثل "مبتدئ"، "نجمة"، "بطل")
    - عدد النجوم المطلوبة (مثل "1 نجمة"، "10 نجوم")

**الألوان والتصميم**: ألوان زاهية ومناسبة للأطفال، تصميم بسيط وواضح مع استخدام أيقونات ملونة

#### 8.7.4. صفحة لعبة تعليمية (Educational Game Page Layout)

**الموقع**: `html/math_game.html`, `html/arabic_game.html`, وغيرها من صفحات الألعاب

**التخطيط العام**: صفحة كاملة الشاشة مع محتوى تفاعلي في المنتصف.

**رأس الصفحة (Game Header)**:
- **الجانب الأيسر**: عنوان اللعبة (مثل "لعبة الرياضيات - الجمع")
- **الجانب الأيمن**: زر "← العودة" للرجوع إلى واجهة الطفل

**شريط الإحصائيات (Stats Bar)**:
- عرض في صف واحد من اليسار إلى اليمين:
  - **📊 النقاط**: النقاط الحالية (مثل 150)
  - **🎯 المستوى**: المستوى الحالي (مثل 1)
  - **⏱️ الوقت**: الوقت المنقضي (مثل 05:30)
  - **⭐ النجوم**: عدد النجوم الحالي (مثل 3 نجوم)

**منطقة اللعبة الرئيسية (Game Screen)**:
- **السؤال**: عرض في المنتصف بتنسيق واضح:
  - مثال للرياضيات: رقم + رقم = [؟] مع مربعات للإجابات
  - مثال للعربية: كلمة أو صورة تحتاج للإجابة
- **خيارات الإجابة**: أربعة أزرار أو خيارات أسفل السؤال (مثل: 5، 6، 7، 8)
- **شريط التقدم**: في الأسفل يعرض "السؤال 3 من 10" مع شريط تقدم ملون

**التفاعلية**:
- النقر على الإجابة الصحيحة ينتقل للسؤال التالي
- النقر على الإجابة الخاطئة يعرض الإجابة الصحيحة ثم ينتقل
- تحديث النقاط والنجوم والوقت بشكل مباشر

#### 8.7.5. شاشة انتهاء اللعبة (Game Over Screen Layout)

**الموقع**: تظهر كشاشة منبثقة فوق صفحة اللعبة

**التخطيط**: نافذة مركزية على خلفية شفافة

**محتوى الشاشة**:
- **رسالة النجاح**: "🎉 رائع!" بخط كبير
- **رسالة الإكمال**: "أكملت المهمة!"
- **النتائج**:
  - النقاط النهائية (مثل: النقاط: 150)
  - النجوم المكتسبة (مثل: ⭐⭐⭐⭐ (4 نجوم))
- **الشارة المكتسبة**: بطاقة منفصلة تعرض "🏆 شارة جديدة!" إذا تم كسب شارة
- **أزرار الإجراءات**:
  - زر "🎮 لعب مرة أخرى" (أخضر)
  - زر "العودة" (رمادي) للرجوع إلى واجهة الطفل

#### 8.7.6. نافذة إضافة طفل (Add Child Modal Layout)

**الموقع**: تظهر كشاشة منبثقة فوق لوحة تحكم الأهل

**التخطيط**: نافذة مركزية على خلفية شفافة

**محتوى النافذة**:
- **رأس النافذة**: 
  - العنوان "➕ إضافة طفل جديد" على اليسار
  - زر الإغلاق [✕] على اليمين
- **نموذج الإدخال**:
  - **اسم الطفل**: حقل نصي لإدخال اسم الطفل
  - **الجنس**: قائمة منسدلة للاختيار بين "ذكر" و "أنثى"
  - **تاريخ الميلاد**: حقل تاريخ (date picker) لإدخال تاريخ الميلاد
- **زر الحفظ**: زر "💾 حفظ" في الأسفل

#### 8.7.7. لوحة التقارير (Reports Dashboard Layout)

**الموقع**: `html/parent_dashboard.html` (تبويب التقارير)

**التخطيط العام**: نفس رأس الصفحة وتبويبات التنقل مع محتوى التقارير

**رأس القسم**: "📊 التقارير - [اسم الطفل]" مع قائمة منسدلة لاختيار الطفل

**بطاقات الإحصائيات (Statistics Cards)**:
- ثلاث بطاقات في صف واحد:
  1. **⏱️ الوقت الكلي**: يعرض إجمالي دقائق التعلم (مثل: 120 دقيقة)
  2. **⭐ النجوم**: يعرض إجمالي النجوم (مثل: 150 نجمة)
  3. **📚 المهام**: يعرض عدد المهام المكتملة (مثل: 12 مهمة)

**قائمة الجلسات الأخيرة**:
- **عنوان القسم**: "📈 الجلسات الأخيرة"
- **بطاقات الجلسات**: كل جلسة في بطاقة منفصلة تحتوي على:
  - أيقونة واسم المهمة (مثل: 📚 لعبة الرياضيات - الجمع)
  - حالة الإكمال: ✅ مكتملة أو ⏸️ متوقفة
  - النجوم: ⭐⭐⭐⭐ (4 نجوم)
  - المدة: ⏱️ 15 دقيقة
  - التاريخ: 📅 2025-01-15

---

## 📋 9. ملخص التصميم المنطقي (Logical Design Summary)

### 9.1. المكونات الرئيسية (Main Components)

| المكون | الوصف | الملفات الرئيسية |
|--------|-------|------------------|
| **Authentication** | نظام المصادقة | `api/login.php`, `api/signup.php`, `api/logout.php` |
| **Child Management** | إدارة الأطفال | `api/get_children.php`, `api/add_child.php`, `api/update_child.php` |
| **Task Management** | إدارة المهام | `api/get_child_tasks.php`, `api/tasks/add_task.php` |
| **Session Management** | إدارة الجلسات | `api/start_session.php`, `api/complete_task.php` |
| **Content Management** | إدارة المحتوى | `api/tasks/get_all_content.php`, `api/get_child_content.php` |
| **Badge System** | نظام الشارات | `api/get_child_badges.php`, منطق في `complete_task.php` |
| **Reporting** | التقارير | `api/get_child_sessions.php`, `api/get_statistics.php` |

### 9.2. الجداول الرئيسية (Main Tables)

| الجدول | الوصف | العلاقات الرئيسية |
|--------|-------|-------------------|
| **parents** | بيانات الوالدين | → children (1:N) |
| **children** | بيانات الأطفال | ← parents (N:1), → sessions (1:N), → child_badges (1:N) |
| **content** | المحتوى التعليمي | → tasks (1:N) |
| **tasks** | المهام التعليمية | ← content (N:1), → sessions (1:N) |
| **sessions** | جلسات التعلم | ← children (N:1), ← tasks (N:1) |
| **badges** | الشارات | → child_badges (1:N) |
| **child_badges** | شارات الأطفال | ← children (N:1), ← badges (N:1) |
| **reports** | التقارير | ← parents (N:1), ← children (N:1) |

### 9.3. التدفقات الرئيسية (Main Flows)

1. **تدفق تسجيل الدخول**: User → Login API → Database → Session → Dashboard
2. **تدفق إضافة طفل**: Parent → Add Child API → Database → Display Children
3. **تدفق تعيين مهمة**: Parent → Select Content → Create Task → Assign to Child → Save
4. **تدفق جلسة التعلم**: Child → Start Session → Play Game → Calculate Results → Update Stats → Award Badges
5. **تدفق عرض التقارير**: Parent → Request Reports → Query Sessions → Calculate Stats → Display

---

## 📝 ملاحظات مهمة (Important Notes)

### كيفية عرض الرسوم (How to View Diagrams):

1. **في GitHub**: الرسوم ستظهر تلقائياً عند عرض الملف
2. **في VS Code**: استخدم إضافة "Markdown Preview Mermaid Support"
3. **أونلاين**: انسخ كود Mermaid إلى [Mermaid Live Editor](https://mermaid.live/)
4. **في Markdown Viewers**: معظم عارضي Markdown يدعمون Mermaid

### التحديثات (Updates):

- يمكن تحديث الرسوم حسب التغييرات في النظام
- جميع الرسوم متوافقة مع البنية الحالية للمشروع
- الرسوم تعكس التصميم المنطقي وليس التنفيذ الفعلي

---

**تاريخ الإنشاء**: 2025-01-15  
**الإصدار**: 1.0.0  
**المشروع**: منصة التعلم للأطفال - Kids Learning Platform

