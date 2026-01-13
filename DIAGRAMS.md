# رسوم بيانية لمشروع منصة التعلم للأطفال
## Diagrams for Kids Learning Platform

---

## 1. Use Case Diagram (رسم حالات الاستخدام)

```mermaid
graph TB
    Parent[Parent<br/>الوالد]
    Child[Child<br/>الطفل]
    System[Kids Learning Platform<br/>منصة التعلم للأطفال]
    
    %% Parent Use Cases
    Parent -->|Login| UC1[Login]
    Parent -->|Signup| UC2[Create Account]
    Parent -->|Manage| UC3[Manage Children]
    Parent -->|Add| UC4[Add Child]
    Parent -->|Edit| UC5[Edit Child]
    Parent -->|Delete| UC6[Delete Child]
    Parent -->|Assign| UC7[Assign Tasks]
    Parent -->|View| UC8[View Reports]
    Parent -->|View| UC9[View Statistics]
    Parent -->|View| UC10[View Badges]
    Parent -->|Logout| UC11[Logout]
    
    %% Child Use Cases
    Child -->|View| UC12[View Current Task]
    Child -->|Start| UC13[Start Session]
    Child -->|Play| UC14[Play Game]
    Child -->|Complete| UC15[Complete Task]
    Child -->|Pause| UC16[Pause Session]
    Child -->|View| UC17[View Badges]
    Child -->|View| UC18[View Progress]
    
    %% System Use Cases
    System -->|Authenticate| UC1
    System -->|Register| UC2
    System -->|Store| UC3
    System -->|Create| UC4
    System -->|Update| UC5
    System -->|Remove| UC6
    System -->|Link| UC7
    System -->|Generate| UC8
    System -->|Calculate| UC9
    System -->|Award| UC10
    System -->|End| UC11
    System -->|Display| UC12
    System -->|Initialize| UC13
    System -->|Track| UC14
    System -->|Save| UC15
    System -->|Store| UC16
    System -->|Show| UC17
    System -->|Display| UC18
    
    style Parent fill:#667eea,stroke:#764ba2,color:#fff
    style Child fill:#f59e0b,stroke:#ff9800,color:#fff
    style System fill:#10b981,stroke:#059669,color:#fff
```

---

## 2. Data Flow Diagram (رسم تدفق البيانات)

### 2.1. Level 0 - Context Diagram

```mermaid
graph LR
    Parent[Parent<br/>الوالد]
    Child[Child<br/>الطفل]
    System[Kids Learning Platform<br/>منصة التعلم]
    DB[(Database<br/>قاعدة البيانات)]
    
    Parent -->|Login Request| System
    System -->|User Data| Parent
    Parent -->|Child Data| System
    System -->|Children List| Parent
    Parent -->|Task Assignment| System
    System -->|Task List| Child
    Child -->|Game Results| System
    System -->|Reports| Parent
    
    System <-->|Read/Write| DB
    
    style Parent fill:#667eea,stroke:#764ba2,color:#fff
    style Child fill:#f59e0b,stroke:#ff9800,color:#fff
    style System fill:#10b981,stroke:#059669,color:#fff
    style DB fill:#6366f1,stroke:#4f46e5,color:#fff
```

### 2.2. Level 1 - Process Flow

```mermaid
graph TB
    subgraph "External Entities"
        P[Parent]
        C[Child]
    end
    
    subgraph "Processes"
        P1[1.0<br/>Authentication]
        P2[2.0<br/>Child Management]
        P3[3.0<br/>Task Management]
        P4[4.0<br/>Session Management]
        P5[5.0<br/>Game Processing]
        P6[6.0<br/>Report Generation]
        P7[7.0<br/>Badge System]
    end
    
    subgraph "Data Stores"
        D1[(D1: Parents)]
        D2[(D2: Children)]
        D3[(D3: Tasks)]
        D4[(D4: Sessions)]
        D5[(D5: Content)]
        D6[(D6: Badges)]
        D7[(D7: Reports)]
    end
    
    P -->|Login| P1
    P1 -->|User Data| D1
    P1 -->|Session| P
    
    P -->|Add Child| P2
    P2 -->|Child Data| D2
    P2 -->|Children List| P
    
    P -->|Assign Task| P3
    P3 -->|Task Data| D3
    P3 -->|Task List| C
    
    C -->|Start Session| P4
    P4 -->|Session Data| D4
    P4 -->|Game URL| C
    
    C -->|Game Results| P5
    P5 -->|Update Session| D4
    P5 -->|Calculate Stars| P7
    
    P7 -->|Badge Data| D6
    P7 -->|Award Badge| D2
    
    P -->|View Reports| P6
    P6 -->|Session Data| D4
    P6 -->|Report Data| D7
    P6 -->|Reports| P
    
    P3 -->|Content Data| D5
    
    style P fill:#667eea,stroke:#764ba2,color:#fff
    style C fill:#f59e0b,stroke:#ff9800,color:#fff
    style P1 fill:#10b981,stroke:#059669,color:#fff
    style P2 fill:#10b981,stroke:#059669,color:#fff
    style P3 fill:#10b981,stroke:#059669,color:#fff
    style P4 fill:#10b981,stroke:#059669,color:#fff
    style P5 fill:#10b981,stroke:#059669,color:#fff
    style P6 fill:#10b981,stroke:#059669,color:#fff
    style P7 fill:#10b981,stroke:#059669,color:#fff
```

---

## 3. Activity Diagram (رسم الأنشطة)

### 3.1. Login Activity

```mermaid
flowchart TD
    Start([Start]) --> Enter[Enter Email & Password]
    Enter --> Validate{Validate Input}
    Validate -->|Invalid| ShowError[Show Error Message]
    ShowError --> Enter
    Validate -->|Valid| CheckDB{Check Database}
    CheckDB -->|Not Found| ShowError
    CheckDB -->|Found| VerifyPass{Verify Password}
    VerifyPass -->|Incorrect| ShowError
    VerifyPass -->|Correct| CreateSession[Create Session]
    CreateSession --> Redirect[Redirect to Dashboard]
    Redirect --> End([End])
    
    style Start fill:#10b981,stroke:#059669,color:#fff
    style End fill:#ef4444,stroke:#dc2626,color:#fff
    style Validate fill:#f59e0b,stroke:#ff9800,color:#fff
    style CheckDB fill:#f59e0b,stroke:#ff9800,color:#fff
    style VerifyPass fill:#f59e0b,stroke:#ff9800,color:#fff
```

### 3.2. Start Learning Session Activity

```mermaid
flowchart TD
    Start([Start Session]) --> SelectChild[Parent Selects Child]
    SelectChild --> SelectTask[Parent Selects Task]
    SelectTask --> AssignTask[Assign Task to Child]
    AssignTask --> ChildView[Child Views Task]
    ChildView --> ClickStart[Child Clicks Start]
    ClickStart --> CreateSession[Create Session in DB]
    CreateSession --> GetSessionID[Get Session ID]
    GetSessionID --> OpenGame[Open Game with Session ID]
    OpenGame --> StartTimer[Start Timer]
    StartTimer --> PlayGame[Child Plays Game]
    PlayGame --> AnswerQuestion{Answer Question}
    AnswerQuestion -->|Correct| AddPoints[Add Points]
    AnswerQuestion -->|Wrong| ShowCorrect[Show Correct Answer]
    ShowCorrect --> CheckMore{More Questions?}
    AddPoints --> CheckMore
    CheckMore -->|Yes| PlayGame
    CheckMore -->|No| CalculateResults[Calculate Results]
    CalculateResults --> SaveSession[Save Session Data]
    SaveSession --> CheckBadges[Check for New Badges]
    CheckBadges --> AwardBadges{Award Badges?}
    AwardBadges -->|Yes| UpdateBadges[Update Child Badges]
    AwardBadges -->|No| UpdateStats[Update Statistics]
    UpdateBadges --> UpdateStats
    UpdateStats --> ShowResults[Show Results to Child]
    ShowResults --> End([End])
    
    style Start fill:#10b981,stroke:#059669,color:#fff
    style End fill:#ef4444,stroke:#dc2626,color:#fff
    style AnswerQuestion fill:#f59e0b,stroke:#ff9800,color:#fff
    style CheckMore fill:#f59e0b,stroke:#ff9800,color:#fff
    style AwardBadges fill:#f59e0b,stroke:#ff9800,color:#fff
```

### 3.3. View Reports Activity

```mermaid
flowchart TD
    Start([Parent Opens Reports]) --> SelectChild[Select Child]
    SelectChild --> FetchSessions[Fetch All Sessions from DB]
    FetchSessions --> CalculateStats[Calculate Statistics]
    CalculateStats --> CalcTotalSessions[Total Sessions]
    CalcTotalSessions --> CalcTotalTime[Total Time]
    CalcTotalTime --> CalcTotalStars[Total Stars]
    CalcTotalStars --> CalcAvgCompletion[Average Completion]
    CalcAvgCompletion --> DisplayStats[Display Statistics Cards]
    DisplayStats --> DisplaySessions[Display Session List]
    DisplaySessions --> ForEachSession{For Each Session}
    ForEachSession --> ShowDetails[Show Session Details]
    ShowDetails --> ShowTaskName[Task Name]
    ShowTaskName --> ShowContent[Content Name]
    ShowContent --> ShowDuration[Duration: Specified & Actual]
    ShowDuration --> ShowCompletion[Completion Percentage]
    ShowCompletion --> ShowStars[Stars Earned]
    ShowStars --> ShowDate[Date & Time]
    ShowDate --> NextSession{More Sessions?}
    NextSession -->|Yes| ForEachSession
    NextSession -->|No| End([End])
    
    style Start fill:#10b981,stroke:#059669,color:#fff
    style End fill:#ef4444,stroke:#dc2626,color:#fff
    style ForEachSession fill:#f59e0b,stroke:#ff9800,color:#fff
    style NextSession fill:#f59e0b,stroke:#ff9800,color:#fff
```

---

## 4. ER Diagram (رسم علاقات الكيانات)

```mermaid
erDiagram
    PARENTS ||--o{ CHILDREN : "has"
    PARENTS ||--o{ TASKS : "creates"
    PARENTS ||--o{ REPORTS : "views"
    CHILDREN ||--o{ SESSIONS : "participates"
    CHILDREN ||--o{ CHILD_BADGES : "earns"
    CHILDREN ||--o{ TASKS : "assigned"
    CONTENT ||--o{ TASKS : "contains"
    TASKS ||--o{ SESSIONS : "used_in"
    BADGES ||--o{ CHILD_BADGES : "awarded"
    SESSIONS ||--o{ REPORTS : "generates"
    
    PARENTS {
        int id PK
        string first_name
        string last_name
        string email UK
        string phone UK
        string password
        enum gender
        timestamp created_at
        timestamp updated_at
    }
    
    CHILDREN {
        int child_id PK
        string child_name
        int parent_id FK
        int age
        enum gender
        date birth_date
        string profile_img
        timestamp last_activity
        int total_time
        int total_stars
        timestamp created_at
        timestamp updated_at
    }
    
    CONTENT {
        int content_id PK
        string content_name
        string content_name_ar
        string title
        string topic
        string category
        enum difficulty
        int min_age
        int max_age
        string icon
        timestamp created_at
    }
    
    TASKS {
        int task_id PK
        int parent_id FK
        int child_id FK
        int content_id FK
        string task_name
        string task_name_ar
        text description
        int duration_minutes
        int order_index
        enum status
        int time_completed
        text parent_note
        timestamp created_at
    }
    
    SESSIONS {
        int session_id PK
        int child_id FK
        int parent_id FK
        int task_id FK
        int content_id FK
        timestamp start_time
        timestamp end_time
        int duration_minutes
        int completed_percentage
        int stars
        enum status
        timestamp created_at
    }
    
    BADGES {
        int badge_id PK
        string badge_name
        string badge_name_ar
        string badge_icon
        int start_value
        int min_star
        int max_star
        string color_code
        int level
        text description
        timestamp created_at
    }
    
    CHILD_BADGES {
        int id PK
        int child_id FK
        int badge_id FK
        int stars_earned
        timestamp earned_at
    }
    
    REPORTS {
        int report_id PK
        int parent_id FK
        int child_id FK
        int session_id FK
        text achievement
        json report_data
        int pages_rendered
        int total_time
        timestamp generated_at
        boolean viewed_by_parent
        timestamp viewed_at
    }
```

---

## 5. Sequence Diagram (رسم التسلسل)

### 5.1. Login Sequence

```mermaid
sequenceDiagram
    participant P as Parent
    participant UI as User Interface
    participant API as API (login.php)
    participant DB as Database
    participant S as Session
    
    P->>UI: Enter Email & Password
    UI->>API: POST /api/login.php
    API->>DB: SELECT * FROM parents WHERE email=?
    DB-->>API: User Data
    API->>API: Verify Password
    API->>S: Create Session
    API->>DB: Update last_login
    API-->>UI: Success + User Data
    UI->>UI: Store in localStorage
    UI->>UI: Redirect to Dashboard
    UI-->>P: Show Dashboard
```

### 5.2. Start Learning Session Sequence

```mermaid
sequenceDiagram
    participant P as Parent
    participant C as Child
    participant UI as Child View
    participant API as API
    participant DB as Database
    participant Game as Game
    
    P->>UI: Assign Task to Child
    UI->>API: POST /api/assign_task.php
    API->>DB: INSERT INTO tasks
    DB-->>API: Task Created
    API-->>UI: Success
    
    C->>UI: View Current Task
    UI->>API: GET /api/get_current_task.php
    API->>DB: SELECT task WHERE child_id=?
    DB-->>API: Task Data
    API-->>UI: Task Information
    UI-->>C: Display Task
    
    C->>UI: Click Start Session
    UI->>API: POST /api/start_session.php
    API->>DB: INSERT INTO sessions
    DB-->>API: session_id
    API-->>UI: session_id
    UI->>Game: Open Game (with session_id)
    
    Game->>Game: Initialize Game
    Game->>Game: Start Timer
    loop Game Loop
        C->>Game: Answer Question
        Game->>Game: Check Answer
        Game->>Game: Update Score
    end
    
    C->>Game: Complete Game
    Game->>Game: Calculate Results
    Game->>API: POST /api/complete_task.php
    API->>DB: UPDATE sessions SET end_time, stars, etc.
    API->>DB: UPDATE children SET total_time, total_stars
    API->>DB: SELECT badges WHERE conditions
    DB-->>API: Available Badges
    API->>DB: INSERT INTO child_badges
    API-->>Game: Success
    Game-->>C: Show Results & Badges
```

### 5.3. View Reports Sequence

```mermaid
sequenceDiagram
    participant P as Parent
    participant UI as Parent Dashboard
    participant API as API (get_child_sessions.php)
    participant DB as Database
    
    P->>UI: Click Reports Tab
    UI->>UI: Select Child
    UI->>API: GET /api/get_child_sessions.php?child_id=?
    API->>DB: SELECT sessions JOIN tasks JOIN content
    Note over API,DB: WHERE child_id=? AND end_time IS NOT NULL
    DB-->>API: Sessions Data
    API->>API: Calculate Statistics
    API->>API: Format Data
    API-->>UI: JSON Response (Sessions + Stats)
    UI->>UI: Calculate Totals
    UI->>UI: Render Statistics Cards
    UI->>UI: Render Session Cards
    UI-->>P: Display Reports
```

---

## 6. State Diagram (رسم الحالات)

### 6.1. Session State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending: Task Assigned
    Pending --> InProgress: Child Starts Session
    InProgress --> Paused: Child Pauses
    Paused --> InProgress: Child Resumes
    InProgress --> Completed: Child Completes
    Paused --> Completed: Complete from Paused
    Completed --> [*]: Results Saved
    
    note right of InProgress
        Timer Running
        Tracking
    end note
    
    note right of Paused
        Timer Stopped
        Progress Saved
    end note
    
    note right of Completed
        Results Calculated
        Badges Awarded
        Statistics Updated
    end note
```

### 6.2. Task State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending: Task Created
    Pending --> InProgress: Session Started
    InProgress --> Completed: Session Completed
    InProgress --> Paused: Session Paused
    Paused --> InProgress: Session Resumed
    Paused --> Completed: Completed from Paused
    Completed --> [*]: Task Finished
    Pending --> Skipped: Parent Skips Task
    
    note right of Pending
        Waiting for Child
        Not Started
    end note
    
    note right of InProgress
        Active Session
        Timer Running
    end note
    
    note right of Completed
        Results Saved
        Statistics Updated
    end note
```

---

## 7. Component Diagram (رسم المكونات)

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[HTML Pages]
        B[CSS Styles]
        C[JavaScript]
    end
    
    subgraph "Application Layer"
        D[Authentication Module]
        E[Child Management Module]
        F[Task Management Module]
        G[Session Management Module]
        H[Game Module]
        I[Reporting Module]
        J[Badge Module]
    end
    
    subgraph "API Layer"
        K[Login API]
        L[Child API]
        M[Task API]
        N[Session API]
        O[Report API]
        P[Badge API]
    end
    
    subgraph "Data Layer"
        Q[(Parents Table)]
        R[(Children Table)]
        S[(Tasks Table)]
        T[(Sessions Table)]
        U[(Content Table)]
        V[(Badges Table)]
        W[(Reports Table)]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    
    B --> A
    C --> A
    
    D --> K
    E --> L
    F --> M
    G --> N
    H --> N
    I --> O
    J --> P
    
    K --> Q
    L --> R
    M --> S
    N --> T
    O --> T
    O --> W
    P --> V
    P --> R
    
    M --> U
    
    style A fill:#667eea,stroke:#764ba2,color:#fff
    style B fill:#667eea,stroke:#764ba2,color:#fff
    style C fill:#667eea,stroke:#764ba2,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
    style E fill:#10b981,stroke:#059669,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
    style G fill:#10b981,stroke:#059669,color:#fff
    style H fill:#10b981,stroke:#059669,color:#fff
    style I fill:#10b981,stroke:#059669,color:#fff
    style J fill:#10b981,stroke:#059669,color:#fff
    style K fill:#f59e0b,stroke:#ff9800,color:#fff
    style L fill:#f59e0b,stroke:#ff9800,color:#fff
    style M fill:#f59e0b,stroke:#ff9800,color:#fff
    style N fill:#f59e0b,stroke:#ff9800,color:#fff
    style O fill:#f59e0b,stroke:#ff9800,color:#fff
    style P fill:#f59e0b,stroke:#ff9800,color:#fff
```

---

## ملاحظات (Notes)

### كيفية عرض الرسوم (How to View Diagrams):

1. **في GitHub**: الرسوم ستظهر تلقائياً في GitHub عند عرض الملف
2. **في VS Code**: استخدم إضافة "Markdown Preview Mermaid Support"
3. **أونلاين**: انسخ كود Mermaid إلى [Mermaid Live Editor](https://mermaid.live/)
4. **في Markdown Viewers**: معظم عارضي Markdown يدعمون Mermaid

### الملفات المطلوبة (Required Files):

- هذا الملف يحتوي على جميع الرسوم البيانية
- يمكنك نسخ أي رسم واستخدامه في ملفات أخرى
- جميع الرسوم تستخدم لغة Mermaid القياسية

### التحديثات (Updates):

- يمكن تحديث الرسوم حسب التغييرات في النظام
- جميع الرسوم متوافقة مع البنية الحالية للمشروع

---

**تاريخ الإنشاء**: 2025-01-15  
**الإصدار**: 1.0.0

