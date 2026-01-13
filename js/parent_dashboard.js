// لوحة تحكم الأهل
let currentParentId = null;
let children = [];
let currentTasksChildId = null;
let allContent = [];

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async function() {
    console.log('بدء تحميل الصفحة...');
    
    // التأكد من عرض التبويب الافتراضي
    const childrenSection = document.getElementById('childrenSection');
    if (childrenSection) {
        childrenSection.style.display = 'block';
        console.log('تم عرض قسم الأطفال');
    } else {
        console.error('قسم childrenSection غير موجود!');
    }
    
    // الحصول على معرف الأهل من الجلسة
    try {
        currentParentId = await getParentIdFromSession();
        console.log('معرف الأهل:', currentParentId);
        
        if (!currentParentId) {
            console.warn('لا يوجد معرف أهل، إعادة التوجيه...');
            window.location.href = '../html/index.html';
            return;
        }
        
        // تحميل البيانات
        await Promise.all([
            loadParentInfo(),
            loadChildren(),
            loadStatistics()
        ]);
        
        setupAddChildForm();
        setupEditChildForm();
        setupTasksManagement();
        
        console.log('تم تحميل جميع البيانات بنجاح');
    } catch (error) {
        console.error('خطأ في تحميل الصفحة:', error);
        const container = document.getElementById('childrenContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="grid-column: 1/-1; padding: 40px; text-align: center;">
                    <h3>⚠️ خطأ في تحميل البيانات</h3>
                    <p>${error.message}</p>
                    <p style="margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary);">
                        يرجى التأكد من تسجيل الدخول أو تحديث الصفحة
                    </p>
                </div>
            `;
        }
    }
});

// الحصول على معرف الأهل من الجلسة
async function getParentIdFromSession() {
    let parentId = localStorage.getItem('parent_id') || sessionStorage.getItem('parent_id');
    
    if (!parentId) {
        try {
            const response = await fetch('../api/get_current_user.php');
            const result = await response.json();
            if (result.success && result.user) {
                parentId = result.user.id;
                localStorage.setItem('parent_id', parentId);
            }
        } catch (error) {
            console.error('خطأ في جلب بيانات المستخدم:', error);
        }
    }
    
    return parentId;
}

// تحميل معلومات الأهل
async function loadParentInfo() {
    // عرض اسم المستخدم من localStorage أولاً (للمعاينة السريعة)
    const cachedName = localStorage.getItem('user_name');
    if (cachedName) {
        const welcomeText = document.getElementById('welcomeText');
        if (welcomeText) {
            welcomeText.textContent = `مرحباً ${cachedName}`;
        }
    }
    
    try {
        const response = await fetch('../api/get_current_user.php');
        const result = await response.json();
        
        if (result.success && result.user) {
            const user = result.user;
            const userName = user.name || `${user.first_name} ${user.last_name}`;
            
            // تحديث العرض
            document.getElementById('welcomeText').textContent = `مرحباً ${userName}`;
            document.getElementById('parentName').textContent = userName || '-';
            
            // حفظ في localStorage للتحديث
            localStorage.setItem('user_name', userName);
            document.getElementById('parentGender').textContent = user.gender || '-';
            document.getElementById('parentEmail').textContent = user.email || '-';
            
            // تحديث حقول الإعدادات
            document.getElementById('editName').value = user.name || '';
            document.getElementById('editEmail').value = user.email || '';
            
            // جلب معلومات إضافية
            const childrenResponse = await fetch(`../api/get_children.php?parent_id=${currentParentId}`);
            const childrenResult = await childrenResponse.json();
            if (childrenResult.success) {
                document.getElementById('childrenCount').textContent = childrenResult.children.length;
            }
        }
    } catch (error) {
        console.error('خطأ في تحميل معلومات الأهل:', error);
    }
}

// تحميل قائمة الأطفال
async function loadChildren() {
    const container = document.getElementById('childrenContainer');
    
    if (!container) {
        console.error('عنصر childrenContainer غير موجود!');
        return;
    }
    
    try {
        console.log('جاري تحميل الأطفال...');
        container.innerHTML = '<div class="loading-message"><div class="loading-spinner">⏳</div><p>جاري تحميل البيانات...</p></div>';
        
        const url = `../api/get_children.php?parent_id=${currentParentId}`;
        console.log('URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('نتيجة API:', result);
        
        if (result.success) {
            children = result.children || [];
            console.log('عدد الأطفال:', children.length);
            displayChildren(children);
            
            const countElement = document.getElementById('childrenCount');
            if (countElement) {
                countElement.textContent = children.length;
            }
        } else {
            console.error('خطأ في تحميل الأطفال:', result.message);
            container.innerHTML = `
                <div class="error-message" style="grid-column: 1/-1; padding: 40px; text-align: center;">
                    <h3>⚠️ خطأ في تحميل البيانات</h3>
                    <p>${result.message || 'فشل تحميل البيانات'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل الأطفال:', error);
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1/-1; padding: 40px; text-align: center;">
                <h3>⚠️ خطأ في الاتصال</h3>
                <p>${error.message}</p>
                <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-secondary);">
                    يرجى التأكد من أن الخادم يعمل وأنك مسجل دخول
                </p>
            </div>
        `;
    }
}

// عرض الأطفال في البطاقات
function displayChildren(childrenList) {
    const container = document.getElementById('childrenContainer');
    
    if (!container) {
        console.error('عنصر childrenContainer غير موجود');
        return;
    }
    
    console.log('عرض الأطفال:', childrenList);
    
    if (!childrenList || childrenList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); grid-column: 1/-1; padding: 60px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">👶</div>
                <p style="font-size: 1.3rem; font-weight: 600; color: var(--text-primary); margin-bottom: 10px;">
                    لا يوجد أطفال مسجلين بعد
                </p>
                <p style="font-size: 1rem; margin-bottom: 30px;">
                    استخدم زر "إضافة طفل جديد" أعلاه لإضافة طفلك الأول
                </p>
                <button class="btn-add-child" onclick="openAddChildModal()" style="margin: 0 auto; display: inline-flex;">
                    <span class="btn-icon">➕</span>
                    <span class="btn-text">إضافة طفل جديد</span>
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = childrenList.map(child => {
        // حساب العمر من تاريخ الميلاد
        const age = child.birth_date ? calculateAge(child.birth_date) : child.age || '-';
        const genderText = child.gender === 'أنثى' ? 'أنثى' : 'ذكر';
        
        // تحديد اللقب والأيقونة بناءً على البيانات الفعلية
        const childTitle = child.title || 'مبتدئ 🎈';
        let statusIcon = '🎈'; // مبتدئ
        let statusText = 'مبتدئ';
        
        if (childTitle.includes('مستكشف') || childTitle.includes('🚀')) {
            statusIcon = '🚀';
            statusText = 'مستكشف';
        } else if (childTitle.includes('نجم التعلم') || childTitle.includes('🌟')) {
            statusIcon = '🌟';
            statusText = 'نجم التعلم';
        } else {
            statusIcon = '🎈';
            statusText = 'مبتدئ';
        }
        
        return `
        <div class="child-card-gradient">
            <div class="child-header">
                <div class="child-avatar">
                    ${child.child_name.charAt(0)}
                </div>
                <div class="child-info">
                    <h3>${child.child_name}</h3>
                </div>
            </div>
            <div class="child-details-panel">
                <div class="detail-item">
                    <span class="detail-label">العمر:</span>
                    <span class="detail-value">${age !== '-' ? age + ' سنوات' : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">الجنس:</span>
                    <span class="detail-value">${genderText}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">الجلسات:</span>
                    <span class="detail-value">${child.session_count || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">النجوم:</span>
                    <span class="detail-value">⭐ ${child.total_stars || 0}</span>
                </div>
            </div>
            <div class="child-status-panel">
                <span class="status-icon">${statusIcon}</span>
                <span class="status-text">${statusText}</span>
            </div>
            <div class="child-actions">
                <button class="child-action-btn" onclick="event.stopPropagation(); openAchievementsModal(${child.child_id})">
                    <span>🏆</span>
                    <span>الإنجازات</span>
                </button>
                <button class="child-action-btn" onclick="event.stopPropagation(); openContentPage(${child.child_id})">
                    <span>🎮</span>
                    <span>عرض المحتوى</span>
                </button>
                <button class="child-action-btn" onclick="event.stopPropagation(); openManageTasksModal(${child.child_id})">
                    <span>🎉</span>
                    <span>إدارة المهام</span>
                </button>
                <button class="child-action-btn" onclick="event.stopPropagation(); openChildDetails(${child.child_id})">
                    <span>✏️</span>
                    <span>تعديل</span>
                </button>
                <button class="child-action-btn" onclick="event.stopPropagation(); deleteChild(${child.child_id})">
                    <span>🗑️</span>
                    <span>حذف</span>
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    // تحميل الشارات لكل طفل
    childrenList.forEach(child => {
        loadChildBadges(child.child_id);
    });
}

// حساب العمر من تاريخ الميلاد
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// تحميل شارات الطفل
async function loadChildBadges(childId) {
    try {
        const response = await fetch(`../api/get_child_badges.php?child_id=${childId}`);
        const result = await response.json();
        
        if (result.success && result.badges.length > 0) {
            const badgesContainer = document.getElementById(`badges-${childId}`);
            if (badgesContainer) {
                badgesContainer.innerHTML = result.badges.slice(0, 3).map(badge => `
                    <span class="badge" style="background: ${badge.color_code || '#f59e0b'}">
                        ${badge.badge_icon || '🏆'} ${badge.badge_name_ar}
                    </span>
                `).join('');
            }
        }
    } catch (error) {
        console.error('خطأ في تحميل الشارات:', error);
    }
}

// تحميل الإحصائيات
async function loadStatistics() {
    const container = document.getElementById('reportsContainer');
    if (!container) return;
    
    try {
        // تحميل تقارير لكل طفل
        if (children.length === 0) {
            container.innerHTML = `
                <div class="no-reports">
                    <div class="no-reports-icon">📊</div>
                    <p class="no-reports-text">لا توجد تقارير بعد</p>
                    <p class="no-reports-subtext">أضف أطفالاً لبدء رؤية التقارير</p>
                </div>
            `;
            return;
        }
        
        const reportsHtml = await Promise.all(children.map(async (child) => {
            try {
                // جلب جميع الجلسات للطفل
                const sessionsResponse = await fetch(`../api/get_child_sessions.php?child_id=${child.child_id}`);
                const sessionsResult = await sessionsResponse.json();
                
                const sessions = sessionsResult.success ? sessionsResult.sessions : [];
                console.log(`جلسات الطفل ${child.child_name}:`, sessions);
                
                // حساب الإحصائيات
                const totalSessions = sessions.length;
                const totalStars = sessions.reduce((sum, s) => sum + (s.stars || 0), 0);
                const totalTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
                const averageStars = totalSessions > 0 ? Math.round(totalStars / totalSessions) : 0;
                
                return `
                    <div class="performance-report-card">
                        <h3 class="report-card-title">
                            <span class="report-icon">📊</span>
                            تقارير الأداء
                        </h3>
                        <div class="child-name-header">
                            <span class="child-icon-yellow">👤</span>
                            <span class="child-name-text">${child.child_name}</span>
                        </div>
                        <div class="report-stats-grid">
                            <div class="report-stat-card">
                                <div class="report-stat-value">${totalSessions} جلسة</div>
                                <div class="report-stat-detail">
                                    <span class="report-stat-icon">📊</span>
                                    <span class="report-stat-label">${averageStars} متوسط النجوم</span>
                                </div>
                            </div>
                            <div class="report-stat-card">
                                <div class="report-stat-value">${totalTime} دقيقة</div>
                                <div class="report-stat-detail">
                                    <span class="report-stat-icon">⏰</span>
                                    <span class="report-stat-label">وقت التعلم الفعلي</span>
                                </div>
                            </div>
                            <div class="report-stat-card">
                                <div class="report-stat-value">${totalStars} إجمالي النجوم</div>
                                <div class="report-stat-icon">⭐</div>
                            </div>
                        </div>
                        <div class="all-sessions-section">
                            <h4 class="all-sessions-title">📚 جميع الجلسات التعليمية:</h4>
                            <div class="all-sessions-list">
                                ${sessions.length > 0 ? 
                                    sessions.map(session => {
                                        const sessionDate = formatDate(session.start_time);
                                        const sessionTime = formatTime(session.start_time);
                                        const starsDisplay = '⭐'.repeat(session.stars || 0) || '⭐';
                                        
                                        const actualTime = session.duration_minutes || session.session_duration_minutes || 0;
                                        const specifiedTime = session.task_duration_minutes || 0;
                                        const statusText = session.status === 'completed' ? 'مكتملة' : session.status === 'paused' ? 'متوقفة' : 'قيد التنفيذ';
                                        const statusIcon = session.status === 'completed' ? '✅' : session.status === 'paused' ? '⏸️' : '🔄';
                                        
                                        return `
                                            <div class="session-item-simple">
                                                <div class="session-top-section">
                                                    <div class="session-status-badge-simple" style="background: ${session.status === 'completed' ? '#10b981' : session.status === 'paused' ? '#ec4899' : '#6366f1'};">
                                                        ${statusIcon} ${statusText}
                                                    </div>
                                                    <div class="session-title-section">
                                                        <div class="session-task-title">${session.task_name || 'مهمة'}</div>
                                                        <div class="session-content-subtitle">${session.content_name || session.task_name || 'محتوى تعليمي'}</div>
                                                    </div>
                                                    <div class="session-icon-simple">${session.content_icon || '🎮'}</div>
                                                </div>
                                                <div class="session-divider"></div>
                                                <div class="session-bottom-section">
                                                    <div class="session-info-box date-box" style="display: flex; align-items: center; gap: 5px;">
                                                        <span class="info-icon">📅</span>
                                                        <span class="session-date-text" style="font-size: 0.85rem; color: var(--text-primary); font-weight: 600;">
                                                            ${sessionDate} ${sessionTime ? ' - ' + sessionTime : ''}
                                                        </span>
                                                    </div>
                                                    <div class="session-info-box completion-box">
                                                        <span class="completion-percentage">${session.completed_percentage || 0}%</span>
                                                        <span class="info-icon">📊</span>
                                                    </div>
                                                    <div class="session-info-box duration-box">
                                                        <span class="info-icon">⏱️</span>
                                                        <span class="duration-text">
                                                            <span class="duration-specified-text">المحدد: ${specifiedTime} د</span>
                                                            <span class="duration-separator">|</span>
                                                            <span class="duration-actual-text">الفعلي: ${actualTime} د</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('') : 
                                    '<div class="no-sessions">لا توجد جلسات بعد</div>'
                                }
                            </div>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error(`خطأ في تحميل تقرير الطفل ${child.child_id}:`, error);
                return `
                    <div class="performance-report-card">
                        <div class="error-message">خطأ في تحميل تقرير ${child.child_name}</div>
                    </div>
                `;
            }
        }));
        
        container.innerHTML = reportsHtml.join('');
    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
        container.innerHTML = `<div class="error-message">خطأ في تحميل التقارير</div>`;
    }
}

// التبديل بين التبويبات
function switchTab(tabName) {
    // إخفاء جميع الأقسام
    const personalSection = document.getElementById('personalSection');
    const childrenSection = document.getElementById('childrenSection');
    const reportsSection = document.getElementById('reportsSection');
    
    if (personalSection) personalSection.style.display = 'none';
    if (childrenSection) childrenSection.style.display = 'none';
    if (reportsSection) reportsSection.style.display = 'none';
    
    // إزالة active من جميع التبويبات
    const personalTab = document.getElementById('personalTab');
    const childrenTab = document.getElementById('childrenTab');
    const reportsTab = document.getElementById('reportsTab');
    
    if (personalTab) personalTab.classList.remove('active');
    if (childrenTab) childrenTab.classList.remove('active');
    if (reportsTab) reportsTab.classList.remove('active');
    
    // إظهار القسم المطلوب وإضافة active للتبويب
    if (tabName === 'personal') {
        if (personalSection) personalSection.style.display = 'block';
        if (personalTab) personalTab.classList.add('active');
        loadParentInfo();
    } else if (tabName === 'children') {
        if (childrenSection) childrenSection.style.display = 'block';
        if (childrenTab) childrenTab.classList.add('active');
        loadChildren();
    } else if (tabName === 'reports') {
        if (reportsSection) reportsSection.style.display = 'block';
        if (reportsTab) reportsTab.classList.add('active');
        loadStatistics();
    }
}


// إعداد نموذج تعديل طفل
function setupEditChildForm() {
    const form = document.getElementById('editChildForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const childId = document.getElementById('editChildId').value;
        const formData = {
            child_id: parseInt(childId),
            child_name: document.getElementById('editChildName').value.trim(),
            gender: document.getElementById('editChildGender').value,
            birth_date: document.getElementById('editChildBirthDate').value,
            age: document.getElementById('editChildAge').value ? parseInt(document.getElementById('editChildAge').value) : null
        };
        
        // حساب العمر من تاريخ الميلاد إذا كان موجوداً ولم يتم تحديد العمر
        if (formData.birth_date && !formData.age) {
            formData.age = calculateAge(formData.birth_date);
        }
        
        if (!formData.child_name) {
            alert('اسم الطفل مطلوب');
            return;
        }
        
        // التحقق من العمر (يجب أن يكون بين 4 و 12 سنة)
        if (formData.age !== null && formData.age > 0) {
            if (formData.age < 4 || formData.age > 12) {
                alert(`عمر الطفل (${formData.age} سنوات) غير مناسب!\n\nيجب أن يكون العمر بين 4 و 12 سنة فقط.\n\nيرجى إدخال تاريخ ميلاد أو عمر صحيح.`);
                return;
            }
        } else if (formData.birth_date) {
            // إذا كان هناك تاريخ ميلاد، يجب حساب العمر والتحقق منه
            const calculatedAge = calculateAge(formData.birth_date);
            if (calculatedAge < 4 || calculatedAge > 12) {
                alert(`عمر الطفل (${calculatedAge} سنوات) غير مناسب!\n\nيجب أن يكون العمر بين 4 و 12 سنة فقط.\n\nيرجى إدخال تاريخ ميلاد صحيح.`);
                return;
            }
            formData.age = calculatedAge;
        } else {
            alert('يجب إدخال تاريخ الميلاد أو العمر. العمر يجب أن يكون بين 4 و 12 سنة.');
            return;
        }
        
        try {
            const response = await fetch('../api/update_child.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('تم تحديث بيانات الطفل بنجاح!');
                closeEditChildModal();
                // إعادة تحميل قائمة الأطفال من API
                await loadChildren();
                // تحديث الإحصائيات
                await loadStatistics();
            } else {
                alert('خطأ: ' + result.message);
            }
        } catch (error) {
            console.error('خطأ في تحديث بيانات الطفل:', error);
            alert('حدث خطأ أثناء تحديث بيانات الطفل');
        }
    });
}

// إعداد نموذج إضافة طفل
function setupAddChildForm() {
    const form = document.getElementById('addChildForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const childName = document.getElementById('childName').value.trim();
        const gender = document.getElementById('childGender').value;
        const birthDate = document.getElementById('childBirthDate').value;
        
        if (!childName) {
            alert('اسم الطفل مطلوب');
            return;
        }
        
        if (!birthDate) {
            alert('تاريخ الميلاد مطلوب');
            return;
        }
        
        // حساب العمر من تاريخ الميلاد
        const age = calculateAge(birthDate);
        
        // التحقق من العمر (يجب أن يكون بين 4 و 12 سنة)
        if (age < 4 || age > 12) {
            alert(`عمر الطفل (${age} سنوات) غير مناسب!\n\nيجب أن يكون العمر بين 4 و 12 سنة فقط.\n\nيرجى إدخال تاريخ ميلاد صحيح.`);
            return;
        }
        
        const formData = {
            child_name: childName,
            gender: gender,
            birth_date: birthDate,
            age: age,
            parent_id: currentParentId
        };
        
        try {
            const response = await fetch('../api/add_child.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('تم إضافة الطفل بنجاح!');
                form.reset();
                closeAddChildModal();
                await loadChildren();
                await loadParentInfo();
            } else {
                alert('خطأ: ' + result.message);
                // لا نقوم بمسح النموذج في حالة الخطأ حتى يتمكن المستخدم من تصحيح البيانات
            }
        } catch (error) {
            console.error('خطأ في إضافة الطفل:', error);
            alert('حدث خطأ أثناء إضافة الطفل');
        }
    });
}

// فتح نافذة إضافة طفل
function openAddChildModal() {
    const form = document.getElementById('addChildForm');
    if (form) {
        form.reset(); // مسح النموذج عند الفتح لضمان نظافة الحقول
    }
    document.getElementById('addChildModal').style.display = 'block';
}

// إغلاق نافذة إضافة طفل
function closeAddChildModal() {
    const modal = document.getElementById('addChildModal');
    const form = document.getElementById('addChildForm');
    if (modal) {
        modal.style.display = 'none';
    }
    if (form) {
        form.reset(); // مسح النموذج عند الإغلاق
    }
}

// فتح نافذة تعديل الطفل
async function openChildDetails(childId) {
    try {
        // جلب بيانات الطفل
        const response = await fetch(`../api/get_child_details.php?child_id=${childId}`);
        const result = await response.json();
        
        if (!result.success || !result.child) {
            alert('فشل في جلب بيانات الطفل');
            return;
        }
        
        const child = result.child;
        
        // تعبئة النموذج بالبيانات الحالية
        document.getElementById('editChildId').value = child.child_id;
        document.getElementById('editChildName').value = child.child_name || '';
        document.getElementById('editChildGender').value = child.gender || 'ذكر';
        
        // تعبئة تاريخ الميلاد
        if (child.birth_date) {
            // تحويل تاريخ الميلاد إلى صيغة YYYY-MM-DD
            const birthDate = new Date(child.birth_date);
            const formattedDate = birthDate.toISOString().split('T')[0];
            document.getElementById('editChildBirthDate').value = formattedDate;
        } else {
            document.getElementById('editChildBirthDate').value = '';
        }
        
        // تعبئة العمر
        if (child.age) {
            document.getElementById('editChildAge').value = child.age;
        } else {
            document.getElementById('editChildAge').value = '';
        }
        
        // فتح النافذة
        document.getElementById('editChildModal').style.display = 'block';
        
    } catch (error) {
        console.error('خطأ في جلب بيانات الطفل:', error);
        alert('حدث خطأ أثناء جلب بيانات الطفل');
    }
}

// إغلاق نافذة تعديل الطفل
function closeEditChildModal() {
    document.getElementById('editChildModal').style.display = 'none';
    document.getElementById('editChildForm').reset();
}

// حذف طفل
async function deleteChild(childId) {
    const child = children.find(c => c.child_id === childId);
    const childName = child ? child.child_name : 'هذا الطفل';
    
    if (!confirm(`هل أنت متأكد من حذف ${childName}؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        return;
    }
    
    try {
        const response = await fetch(`../api/delete_child.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ child_id: childId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('تم حذف الطفل بنجاح!');
            // إعادة تحميل قائمة الأطفال من API
            await loadChildren();
            // تحديث عدد الأطفال في الإحصائيات
            await loadParentInfo();
            // تحديث الإحصائيات العامة
            await loadStatistics();
        } else {
            alert('خطأ: ' + (result.message || 'فشل حذف الطفل'));
        }
    } catch (error) {
        alert('خطأ: ' + error.message);
    }
}

// فتح إدارة مهام الطفل
function openChildTasks(childId) {
    // فتح نافذة إدارة المهام مباشرة
    openManageTasksModal(childId);
}

// بدء جلسة الطفل
function startChildSession(childId) {
    sessionStorage.setItem('current_child_id', childId);
    window.location.href = '../html/child_view.html';
}

// فتح صفحة عرض المحتوى (صفحة الطفل مع المهام)
function openContentPage(childId) {
    sessionStorage.setItem('current_child_id', childId);
    window.location.href = `../html/child_view.html?child_id=${childId}`;
}

// فتح نافذة الإعدادات
function openSettings() {
    // تحميل البيانات الحالية
    loadParentInfo();
    document.getElementById('settingsModal').style.display = 'block';
}

// إغلاق نافذة الإعدادات
function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

// حفظ الاسم
async function saveName() {
    const newName = document.getElementById('editName').value.trim();
    if (!newName) {
        alert('يرجى إدخال الاسم');
        return;
    }
    
    try {
        const parentId = await getParentIdFromSession();
        if (!parentId) {
            alert('خطأ: لم يتم العثور على معرف المستخدم');
            return;
        }
        
        const response = await fetch('../api/update_parent_name.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent_id: parentId,
                name: newName
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ تم حفظ الاسم بنجاح');
            // تحديث البيانات في الواجهة
            await loadParentInfo();
        } else {
            alert('❌ خطأ: ' + result.message);
        }
    } catch (error) {
        console.error('خطأ في حفظ الاسم:', error);
        alert('❌ حدث خطأ أثناء حفظ الاسم');
    }
}

// حفظ البريد الإلكتروني
async function saveEmail() {
    const newEmail = document.getElementById('editEmail').value.trim();
    if (!newEmail) {
        alert('يرجى إدخال البريد الإلكتروني');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        alert('البريد الإلكتروني غير صحيح');
        return;
    }
    
    try {
        const parentId = await getParentIdFromSession();
        if (!parentId) {
            alert('خطأ: لم يتم العثور على معرف المستخدم');
            return;
        }
        
        const response = await fetch('../api/update_parent_email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent_id: parentId,
                email: newEmail
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ تم حفظ البريد الإلكتروني بنجاح');
            // تحديث البيانات في الواجهة
            await loadParentInfo();
        } else {
            alert('❌ خطأ: ' + result.message);
        }
    } catch (error) {
        console.error('خطأ في حفظ البريد الإلكتروني:', error);
        alert('❌ حدث خطأ أثناء حفظ البريد الإلكتروني');
    }
}

// حفظ كلمة المرور
async function savePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    
    if (!currentPassword || !newPassword) {
        alert('يرجى إدخال كلمة المرور الحالية والجديدة');
        return;
    }
    
    // يمكن إضافة API لتحديث كلمة المرور
    alert('تم حفظ كلمة المرور بنجاح');
}

// تسجيل الخروج
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '../html/index.html';
    }
}

// تنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return 'لا يوجد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// تنسيق الوقت
function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

// ==================== إدارة المهام ====================

// إعداد إدارة المهام
async function setupTasksManagement() {
    // تحميل قائمة الأطفال في القائمة المنسدلة
    loadTasksChildrenList();
    
    // عند تغيير الطفل المختار (إن كان العنصر موجوداً)
    const tasksChildSelectMain = document.getElementById('tasksChildSelect');
    if (tasksChildSelectMain) {
        tasksChildSelectMain.addEventListener('change', function() {
            const childId = parseInt(this.value);
            if (childId) {
                currentTasksChildId = childId;
                const addTaskBtn = document.getElementById('addTaskBtn');
                if (addTaskBtn) {
                    addTaskBtn.style.display = 'inline-flex';
                }
                loadChildTasks(childId);
            } else {
                currentTasksChildId = null;
                const addTaskBtn = document.getElementById('addTaskBtn');
                if (addTaskBtn) {
                    addTaskBtn.style.display = 'none';
                }
                const tasksContainer = document.getElementById('tasksContainer');
                if (tasksContainer) {
                    tasksContainer.innerHTML = `
                        <div class="no-tasks">
                            <div class="no-tasks-icon">📋</div>
                            <p class="no-tasks-text">اختر طفلاً لإدارة مهامه</p>
                        </div>
                    `;
                }
            }
        });
    }
    
    // إعداد نموذج إضافة مهمة (النافذة المنبثقة)
    const addTaskFormModal = document.getElementById('addTaskForm');
    if (addTaskFormModal) {
        addTaskFormModal.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const childId = parseInt(document.getElementById('taskChildId').value);
            const contentId = parseInt(document.getElementById('taskContent').value);
            const taskNameAr = document.getElementById('taskNameAr').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const duration = parseInt(document.getElementById('taskDuration').value) || 10;
            const orderIndex = document.getElementById('taskOrder').value ? 
                parseInt(document.getElementById('taskOrder').value) : null;
            const parentNote = document.getElementById('taskNote').value.trim();
            
            if (!childId || !contentId) {
                alert('يرجى اختيار الطفل والمحتوى');
                return;
            }
            
            try {
                const taskData = {
                    child_id: childId,
                    content_id: contentId,
                    task_name_ar: taskNameAr,
                    duration_minutes: duration
                };
                
                if (description) taskData.description = description;
                if (orderIndex !== null) taskData.order_index = orderIndex;
                if (parentNote) taskData.parent_note = parentNote;
                
                await TaskManager.addTask(taskData);
                alert('تمت إضافة المهمة بنجاح!');
                closeAddTaskModal();
                document.getElementById('addTaskForm').reset();
                
                if (currentTasksChildId) {
                    await loadChildTasks(currentTasksChildId);
                }
            } catch (error) {
                alert('خطأ: ' + error.message);
            }
        });
    }
    
    // إعداد نموذج إضافة مهمة (في الصفحة مباشرة)
    const addTaskFormInline = document.getElementById('addTaskFormInline');
    if (addTaskFormInline) {
        addTaskFormInline.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const childId = parseInt(document.getElementById('taskChildIdInline').value);
            const contentId = parseInt(document.getElementById('taskContentInline').value);
            const taskNameAr = document.getElementById('taskNameArInline').value.trim();
            const duration = parseInt(document.getElementById('taskDurationInline').value) || 10;
            const orderIndex = document.getElementById('taskOrderInline').value ? 
                parseInt(document.getElementById('taskOrderInline').value) : null;
            
            if (!childId || !contentId) {
                alert('يرجى إدخال معرف الطفل واختيار المحتوى');
                return;
            }
            
            try {
                const taskData = {
                    child_id: childId,
                    content_id: contentId,
                    task_name_ar: taskNameAr,
                    duration_minutes: duration
                };
                
                if (orderIndex !== null && orderIndex !== '') {
                    taskData.order_index = orderIndex;
                }
                
                await TaskManager.addTask(taskData);
                alert('تمت إضافة المهمة بنجاح!');
                
                // مسح النموذج
                document.getElementById('addTaskFormInline').reset();
                document.getElementById('taskDurationInline').value = 10;
                
                // تحميل المهام للطفل المختار
                if (childId) {
                    currentTasksChildId = childId;
                    await loadChildTasks(childId);
                }
            } catch (error) {
                alert('خطأ: ' + error.message);
            }
        });
    }
    
    // عند تغيير معرف الطفل في النموذج المباشر، تحميل المهام
    const taskChildIdInline = document.getElementById('taskChildIdInline');
    if (taskChildIdInline) {
        taskChildIdInline.addEventListener('change', async function() {
            const childId = parseInt(this.value);
            if (childId) {
                currentTasksChildId = childId;
                await loadChildTasks(childId);
            }
        });
    }
    
    // عند تغيير الطفل المختار في القائمة المنسدلة القديمة (إن وجدت)
    const tasksChildSelect = document.getElementById('tasksChildSelect');
    if (tasksChildSelect) {
        tasksChildSelect.addEventListener('change', function() {
            const childId = parseInt(this.value);
            if (childId) {
                currentTasksChildId = childId;
                const taskChildIdInline = document.getElementById('taskChildIdInline');
                if (taskChildIdInline) {
                    taskChildIdInline.value = childId;
                }
                const addTaskBtn = document.getElementById('addTaskBtn');
                if (addTaskBtn) {
                    addTaskBtn.style.display = 'inline-flex';
                }
                loadChildTasks(childId);
            } else {
                currentTasksChildId = null;
                const addTaskBtn = document.getElementById('addTaskBtn');
                if (addTaskBtn) {
                    addTaskBtn.style.display = 'none';
                }
                const tasksContainer = document.getElementById('tasksContainer');
                if (tasksContainer) {
                    tasksContainer.innerHTML = `
                        <div class="no-tasks">
                            <div class="no-tasks-icon">📋</div>
                            <p class="no-tasks-text">اختر طفلاً لإدارة مهامه</p>
                        </div>
                    `;
                }
            }
        });
    }
    
    // تحميل المحتوى المتاح
    await loadAvailableContent();
    
    // تحميل المحتوى في النموذج المباشر أيضاً
    const taskContentInline = document.getElementById('taskContentInline');
    if (taskContentInline && allContent.length > 0) {
        taskContentInline.innerHTML = '<option value="">اختر المحتوى......</option>';
        allContent.forEach(content => {
            const option = document.createElement('option');
            option.value = content.content_id;
            option.textContent = content.content_name_ar;
            taskContentInline.appendChild(option);
        });
    }
    
    // إعداد نموذج إضافة مهمة في النافذة
    const addTaskFormModalNew = document.getElementById('addTaskFormModal');
    if (addTaskFormModalNew) {
        console.log('تم ربط event listener للنموذج addTaskFormModal');
        addTaskFormModalNew.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('تم الضغط على إضافة المهمة!');
            
            const childId = parseInt(document.getElementById('taskChildIdModal').value);
            const contentId = parseInt(document.getElementById('taskContentModal').value);
            const duration = parseInt(document.getElementById('taskDurationModal').value) || 10;
            const parentNote = document.getElementById('taskNoteModal').value.trim();
            
            console.log('بيانات المهمة:', { childId, contentId, duration, parentNote });
            
            if (!childId || !contentId) {
                alert('يرجى اختيار الطفل والمحتوى');
                return;
            }
            
            try {
                // التحقق من وجود مهمة مكررة قبل الإضافة
                try {
                    const existingTasksResult = await TaskManager.getChildTasks(childId);
                    const existingTasks = existingTasksResult && existingTasksResult.tasks ? existingTasksResult.tasks : existingTasksResult;
                    
                    if (existingTasks && Array.isArray(existingTasks)) {
                        const isDuplicate = existingTasks.some(task => 
                            task.content_id === contentId && 
                            task.status !== 'completed' && 
                            task.status !== 'skipped'
                        );
                        
                        if (isDuplicate) {
                            const confirmAdd = confirm('⚠️ يوجد مهمة مشابهة غير مكتملة للطفل.\nهل تريد إضافة المهمة على أي حال؟');
                            if (!confirmAdd) {
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.warn('خطأ في التحقق من المهام المكررة:', error);
                    // نستمر في الإضافة حتى لو فشل التحقق
                }
                
                const taskData = {
                    child_id: childId,
                    content_id: contentId,
                    duration_minutes: duration
                };
                
                if (parentNote) taskData.parent_note = parentNote;
                
                console.log('إرسال بيانات المهمة:', taskData);
                
                const result = await TaskManager.addTask(taskData);
                console.log('نتيجة إضافة المهمة:', result);
                
                if (!result) {
                    throw new Error('لم يتم إرجاع نتيجة من API');
                }
                
                alert('تمت إضافة المهمة بنجاح!');
                
                // حفظ معرف الطفل قبل إعادة تعيين النموذج
                const savedChildId = childId;
                
                // إعادة تعيين النموذج
                document.getElementById('addTaskFormModal').reset();
                document.getElementById('taskDurationModal').value = 10;
                // إعادة تعيين معرف الطفل في النموذج
                document.getElementById('taskChildIdModal').value = savedChildId;
                
                // تحديث currentTasksChildId
                currentTasksChildId = savedChildId;
                
                // تحديث قائمة المهام في النافذة مباشرة
                console.log('تحديث قائمة المهام للطفل:', savedChildId);
                try {
                    await loadModalTasks(savedChildId);
                    console.log('✅ تم تحديث قائمة المهام بنجاح');
                } catch (err) {
                    console.error('❌ خطأ في تحديث قائمة المهام:', err);
                    alert('تمت إضافة المهمة لكن فشل تحديث القائمة. يرجى تحديث الصفحة.');
                }
                
                // إعادة تحميل المحتوى المتاح للطفل
                await loadModalContent();
                
                // لا نغلق نافذة إدارة المهام، فقط نمسح النموذج
                // النافذة تبقى مفتوحة حتى يرى المستخدم المهمة المضافة
            } catch (error) {
                console.error('خطأ في إضافة المهمة:', error);
                alert('خطأ في إضافة المهمة: ' + (error.message || 'حدث خطأ غير معروف. تحقق من Console (F12)'));
            }
        });
    }
}

// تحميل قائمة الأطفال في القائمة المنسدلة (إذا كان العنصر موجوداً)
function loadTasksChildrenList() {
    const select = document.getElementById('tasksChildSelect');
    if (!select) {
        // العنصر غير موجود - لا حاجة لتحذير، هذا طبيعي
        return;
    }
    select.innerHTML = '<option value="">اختر طفلاً لإدارة مهامه...</option>';
    
    if (!children || children.length === 0) {
        return;
    }
    
    children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.child_id;
        option.textContent = child.child_name;
        select.appendChild(option);
    });
}

// تحميل المحتوى المتاح
async function loadAvailableContent() {
    try {
        allContent = await TaskManager.getAllContent();
        const select = document.getElementById('taskContent');
        select.innerHTML = '<option value="">اختر المحتوى...</option>';
        
        allContent.forEach(content => {
            const option = document.createElement('option');
            option.value = content.content_id;
            option.textContent = content.content_name_ar;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل المحتوى:', error);
    }
}

// تحميل مهام طفل
async function loadChildTasks(childId) {
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">جاري تحميل المهام...</div>';
    
    try {
        const tasks = await TaskManager.getChildTasks(childId);
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="no-tasks">
                    <div class="no-tasks-icon">📋</div>
                    <p class="no-tasks-text">لا توجد مهام لهذا الطفل</p>
                    <p class="no-tasks-subtext">يمكنك إضافة مهمة جديدة باستخدام الزر أعلاه</p>
                </div>
            `;
            return;
        }
        
        // ترتيب المهام حسب order_index (للتأكد من الترتيب الصحيح)
        const sortedTasks = tasks.sort((a, b) => {
            const orderA = a.order_index !== null && a.order_index !== undefined ? a.order_index : 999;
            const orderB = b.order_index !== null && b.order_index !== undefined ? b.order_index : 999;
            return orderA - orderB;
        });
        
        container.innerHTML = sortedTasks.map((task, index) => `
            <div class="task-item" data-task-id="${task.task_id}">
                <div class="task-main">
                    <div class="task-order">${task.order_index + 1}</div>
                    <div class="task-icon">${task.icon || '📚'}</div>
                    <div class="task-info">
                        <h4>${task.task_name_ar || task.task_name}</h4>
                        <p class="task-content">${task.content_name_ar}</p>
                        <div class="task-meta">
                            <span class="task-duration">⏱️ ${task.duration_minutes} دقيقة</span>
                            <span class="task-status status-${task.status}">${getStatusText(task.status)}</span>
                        </div>
                        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-task-up" onclick="moveTaskUp(${task.task_id})" ${index === 0 ? 'disabled' : ''} title="نقل للأعلى">
                        ⬆️
                    </button>
                    <button class="btn-task-down" onclick="moveTaskDown(${task.task_id})" ${index === sortedTasks.length - 1 ? 'disabled' : ''} title="نقل للأسفل">
                        ⬇️
                    </button>
                    <button class="btn-task-delete" onclick="deleteTask(${task.task_id})" title="حذف">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div class="error-message">خطأ: ${error.message}</div>`;
        console.error('خطأ في تحميل المهام:', error);
    }
}

// تحميل المهام في النافذة
async function loadModalTasks(childId) {
    const container = document.getElementById('currentTasksList');
    if (!container) {
        console.error('عنصر currentTasksList غير موجود!');
        return;
    }
    
    console.log('جاري تحميل المهام للطفل:', childId);
    container.innerHTML = '<div class="loading">جاري تحميل المهام...</div>';
    
    try {
        const tasks = await TaskManager.getChildTasks(childId);
        console.log('المهام المحمّلة:', tasks);
        
        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div class="no-tasks-text-modal">لا توجد مهام حالياً</div>';
            return;
        }
        
        // ترتيب المهام حسب order_index (للتأكد من الترتيب الصحيح)
        const sortedTasks = tasks.sort((a, b) => {
            const orderA = a.order_index !== null && a.order_index !== undefined ? a.order_index : 999;
            const orderB = b.order_index !== null && b.order_index !== undefined ? b.order_index : 999;
            return orderA - orderB;
        });
        
        console.log('المهام المرتبة:', sortedTasks);
        
        container.innerHTML = sortedTasks.map((task, index) => {
            const statusText = getStatusText(task.status);
            const statusIcon = getStatusIcon(task.status);
            const statusColor = getStatusColor(task.status);
            const taskType = task.content_name_ar || 'لعبة';
            
            return `
                <div class="current-task-item" data-task-id="${task.task_id}">
                    <div class="task-number-badge">${index + 1}</div>
                    <div class="task-content-info">
                        <div class="task-title-row">
                            <span class="task-title-text">${task.task_name_ar || task.task_name}</span>
                            <span class="task-flame-icon">🔥</span>
                        </div>
                        <div class="task-details-text">
                            ${taskType} • ${task.duration_minutes} دقيقة • 
                            <span class="task-status-badge" style="background: ${statusColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                ${statusIcon} ${statusText}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions-left">
                        <button class="btn-task-delete-red" onclick="deleteTaskModal(${task.task_id})" title="حذف">حذف</button>
                        <button class="btn-task-down-yellow" onclick="moveTaskDownModal(${task.task_id})" ${index === sortedTasks.length - 1 ? 'disabled' : ''} title="للأسفل">↓</button>
                        <button class="btn-task-up-yellow" onclick="moveTaskUpModal(${task.task_id})" ${index === 0 ? 'disabled' : ''} title="للأعلى">↑</button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('تم عرض المهام بنجاح');
    } catch (error) {
        console.error('خطأ في تحميل المهام:', error);
        container.innerHTML = `<div class="error-message">خطأ: ${error.message}</div>`;
    }
}

// تحميل المحتوى في النافذة حسب عمر الطفل
async function loadModalContent() {
    const select = document.getElementById('taskContentModal');
    if (!select) return;
    
    // الحصول على معرف الطفل من النافذة
    const childId = parseInt(document.getElementById('taskChildIdModal').value);
    if (!childId) {
        select.innerHTML = '<option value="">اختر الطفل أولاً</option>';
        return;
    }
    
    try {
        // جلب بيانات الطفل مباشرة من API
        const childResponse = await fetch(`../api/get_child_details.php?child_id=${childId}`);
        const childResult = await childResponse.json();
        
        if (!childResult.success || !childResult.child) {
            select.innerHTML = '<option value="">خطأ في جلب بيانات الطفل</option>';
            console.error('خطأ في جلب بيانات الطفل:', childResult);
            return;
        }
        
        const child = childResult.child;
        
        // حساب العمر
        let age = child.age;
        if ((!age || age === 0) && child.birth_date) {
            age = calculateAge(child.birth_date);
        }
        
        console.log('بيانات الطفل:', child);
        console.log('العمر المحسوب:', age);
        
        if (!age || age < 4 || age > 12) {
            select.innerHTML = `<option value="">عمر الطفل (${age || 'غير محدد'} سنوات) غير مناسب (يجب أن يكون بين 4 و 12 سنة)</option>`;
            return;
        }
        
        // تحميل المحتوى المناسب لعمر الطفل
        console.log('جاري تحميل المحتوى للعمر:', age);
        const content = await TaskManager.getContentByAge(age);
        console.log('المحتوى المحمّل:', content);
        
        select.innerHTML = '<option value="">اختر المحتوى...</option>';
        
        if (content && content.length > 0) {
            console.log(`تم العثور على ${content.length} محتوى`);
            content.forEach(item => {
                const option = document.createElement('option');
                option.value = item.content_id;
                const displayText = `${item.content_name_ar || item.content_name}${item.content_category ? ' - ' + item.content_category : ''}${item.content_type ? ' (' + item.content_type + ')' : ''}`;
                option.textContent = displayText;
                select.appendChild(option);
            });
        } else {
            console.warn('لا يوجد محتوى للعمر:', age);
            select.innerHTML = `<option value="">لا يوجد محتوى متاح للعمر ${age} سنوات. تأكد من إضافة المحتوى التعليمي في قاعدة البيانات.</option>`;
        }
    } catch (error) {
        console.error('خطأ في تحميل المحتوى:', error);
        console.error('تفاصيل الخطأ:', error.stack);
        select.innerHTML = `<option value="">خطأ في تحميل المحتوى: ${error.message || 'غير معروف'}</option>`;
        
        // عرض رسالة خطأ في النافذة
        const errorContainer = document.getElementById('tasksErrorContainer');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message" style="background: #fee; border: 1px solid #fcc; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>خطأ:</strong> ${error.message || 'فشل تحميل المحتوى'}<br>
                    <small>افتح Console (F12) لمزيد من التفاصيل</small>
                </div>
            `;
        }
    }
}

// حذف مهمة من النافذة
async function deleteTaskModal(taskId) {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        return;
    }
    
    try {
        await TaskManager.deleteTask(taskId);
        if (currentTasksChildId) {
            await loadModalTasks(currentTasksChildId);
        }
    } catch (error) {
        alert('خطأ: ' + error.message);
    }
}

// نقل مهمة للأعلى من النافذة
async function moveTaskUpModal(taskId) {
    try {
        await TaskManager.moveTaskUp(taskId);
        if (currentTasksChildId) {
            await loadModalTasks(currentTasksChildId);
        }
    } catch (error) {
        alert('خطأ: ' + error.message);
    }
}

// نقل مهمة للأسفل من النافذة
async function moveTaskDownModal(taskId) {
    try {
        await TaskManager.moveTaskDown(taskId);
        if (currentTasksChildId) {
            await loadModalTasks(currentTasksChildId);
        }
    } catch (error) {
        alert('خطأ: ' + error.message);
    }
}

// نقل مهمة للأعلى
async function moveTaskUp(taskId) {
    try {
        await TaskManager.moveTaskUp(taskId);
        if (currentTasksChildId) {
            await loadChildTasks(currentTasksChildId);
        }
    } catch (error) {
        alert('خطأ: ' + error.message);
    }
}

// نقل مهمة للأسفل
async function moveTaskDown(taskId) {
    try {
        await TaskManager.moveTaskDown(taskId);
        if (currentTasksChildId) {
            await loadChildTasks(currentTasksChildId);
        }
    } catch (error) {
        alert('خطأ: ' + error.message);
    }
}

// حذف مهمة
async function deleteTask(taskId) {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        return;
    }
    
    try {
        await TaskManager.deleteTask(taskId);
        alert('تم حذف المهمة بنجاح!');
        if (currentTasksChildId) {
            await loadChildTasks(currentTasksChildId);
        }
    } catch (error) {
        alert('خطأ: ' + error.message);
    }
}

// فتح نافذة إضافة مهمة
function openAddTaskModal() {
    if (!currentTasksChildId) {
        alert('يرجى اختيار طفلاً أولاً');
        return;
    }
    
    document.getElementById('taskChildId').value = currentTasksChildId;
    document.getElementById('addTaskModal').style.display = 'block';
}

// إغلاق نافذة إضافة مهمة
function closeAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'none';
    document.getElementById('addTaskForm').reset();
}

// فتح نافذة إدارة المهام
async function openManageTasksModal(childId) {
    currentTasksChildId = childId;
    const child = children.find(c => c.child_id === childId);
    if (child) {
        document.getElementById('manageTasksTitle').textContent = `إدارة مهام ${child.child_name}`;
    }
    document.getElementById('taskChildIdModal').value = childId;
    
    // تحميل المحتوى أولاً (يحتاج معرف الطفل)
    await loadModalContent();
    // ثم تحميل المهام
    await loadModalTasks(childId);
    
    document.getElementById('manageTasksModal').style.display = 'block';
}

// إغلاق نافذة إدارة المهام
function closeManageTasksModal() {
    document.getElementById('manageTasksModal').style.display = 'none';
}

// الحصول على نص الحالة
function getStatusText(status) {
    const statusMap = {
        'pending': 'في الانتظار',
        'in_progress': 'قيد التنفيذ',
        'completed': 'مكتملة',
        'paused': 'متوقفة',
        'skipped': 'تم تخطيها'
    };
    return statusMap[status] || status;
}

// الحصول على أيقونة الحالة
function getStatusIcon(status) {
    const iconMap = {
        'pending': '⏳',
        'in_progress': '🔄',
        'completed': '✅',
        'paused': '⏸️',
        'skipped': '⏭️'
    };
    return iconMap[status] || '📋';
}

// الحصول على لون الحالة
function getStatusColor(status) {
    const colorMap = {
        'pending': '#6366f1', // أزرق
        'in_progress': '#f59e0b', // برتقالي
        'completed': '#10b981', // أخضر
        'paused': '#ec4899', // وردي
        'skipped': '#6b7280' // رمادي
    };
    return colorMap[status] || '#6b7280';
}

// فتح صفحة المحتوى التعليمي
// فتح modal الإنجازات
async function openAchievementsModal(childId) {
    const modal = document.getElementById('achievementsModal');
    const content = document.getElementById('achievementsContent');
    
    if (!modal || !content) {
        console.error('Modal elements not found');
        return;
    }
    
    modal.style.display = 'block';
    content.innerHTML = `
        <div class="loading-message" style="text-align: center; padding: 40px;">
            <div class="loading-spinner">⏳</div>
            <p>جاري تحميل الإنجازات...</p>
        </div>
    `;
    
    await loadAchievements(childId);
}

// إغلاق modal الإنجازات
function closeAchievementsModal() {
    const modal = document.getElementById('achievementsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// تحميل إنجازات الطفل
async function loadAchievements(childId) {
    const content = document.getElementById('achievementsContent');
    
    try {
        // جلب الإنجازات والشارات معاً
        const [achievementsResponse, badgesResponse] = await Promise.all([
            fetch(`../api/get_child_achievements.php?child_id=${childId}`),
            fetch(`../api/get_child_badges.php?child_id=${childId}`)
        ]);
        
        const achievementsResult = await achievementsResponse.json();
        const badgesResult = await badgesResponse.json();
        
        if (!achievementsResult.success) {
            content.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px;">
                    <p style="color: #e74c3c;">⚠️ ${achievementsResult.message || 'خطأ في تحميل الإنجازات'}</p>
                </div>
            `;
            return;
        }
        
        const achievements = achievementsResult.achievements || [];
        const badges = badgesResult.success ? (badgesResult.badges || []) : [];
        
        if (achievements.length === 0 && badges.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📝</div>
                    <p style="font-size: 1.2rem; color: var(--text-secondary);">
                        لا توجد إنجازات بعد
                    </p>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 10px;">
                        سيتم عرض المهام التي يكملها الطفل هنا
                    </p>
                </div>
            `;
            return;
        }
        
        // عرض الشارات أولاً
        let html = '';
        
        if (badges.length > 0) {
            html += `
                <div style="margin-bottom: 30px;">
                    <div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
                        <h3 style="margin: 0; color: white; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                            <span>🏆</span>
                            <span>الشارات المكتسبة (${badges.length})</span>
                        </h3>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            `;
            
            badges.forEach((badge, index) => {
                const colorCode = badge.color_code || '#f59e0b';
                html += `
                    <div class="badge-achievement-card" style="
                        background: linear-gradient(135deg, ${colorCode} 0%, ${adjustBadgeColorForAchievements(colorCode)} 100%);
                        border-radius: 16px;
                        padding: 20px;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        transition: all 0.3s ease;
                        cursor: pointer;
                        position: relative;
                    " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
                       onclick="toggleBadgeDescriptionAchievements('badge-achievement-${index}')">
                        <div style="font-size: 3rem; margin-bottom: 10px;">${badge.badge_icon || '🏆'}</div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 8px;">
                            ${badge.badge_name_ar || badge.badge_name}
                        </div>
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.95); font-weight: 600; margin-bottom: 10px;">
                            ⭐ ${badge.stars_earned || 0} نجوم
                        </div>
                        <div class="badge-description-achievements" id="badge-achievement-${index}" style="
                            display: none;
                            margin-top: 15px;
                            padding: 12px;
                            background: rgba(255,255,255,0.95);
                            border-radius: 10px;
                            color: #333;
                            font-size: 0.85rem;
                            line-height: 1.6;
                            text-align: right;
                            animation: fadeIn 0.3s ease;
                        ">
                            ${badge.description || 'لا يوجد وصف متاح'}
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        // عرض الإنجازات
        html += `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin: 0; color: var(--text-primary);">
                    📊 إجمالي الإنجازات: <strong>${achievements.length}</strong>
                </h4>
            </div>
            <div class="achievements-list" style="max-height: 500px; overflow-y: auto;">
        `;
        
        achievements.forEach((achievement, index) => {
            const statusColors = {
                'completed': { bg: '#d4edda', color: '#155724', icon: '✅' },
                'in_progress': { bg: '#fff3cd', color: '#856404', icon: '⏳' },
                'paused': { bg: '#f8d7da', color: '#721c24', icon: '⏸️' }
            };
            
            const statusStyle = statusColors[achievement.status] || statusColors['in_progress'];
            const dateStr = achievement.date ? new Date(achievement.date).toLocaleDateString('ar-SA') : '-';
            const timeStr = achievement.time || '-';
            
            html += `
                <div class="achievement-item" style="
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'"
                   onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 1.1rem;">
                                ${achievement.content_icon || '📚'} ${achievement.task_name}
                            </h4>
                            ${achievement.description ? `
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                                    ${achievement.description}
                                </p>
                            ` : ''}
                            ${achievement.content_name ? `
                                <p style="margin: 5px 0 0 0; color: var(--text-secondary); font-size: 0.85rem;">
                                    📖 ${achievement.content_name}
                                </p>
                            ` : ''}
                        </div>
                        <div style="
                            background: ${statusStyle.bg};
                            color: ${statusStyle.color};
                            padding: 8px 15px;
                            border-radius: 20px;
                            font-size: 0.85rem;
                            font-weight: 600;
                            white-space: nowrap;
                            margin-right: 10px;
                        ">
                            ${statusStyle.icon} ${achievement.status_ar}
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">
                        <div>
                            <span style="color: var(--text-secondary); font-size: 0.85rem;">📅 التاريخ:</span>
                            <div style="color: var(--text-primary); font-weight: 600; margin-top: 5px;">
                                ${dateStr}
                            </div>
                        </div>
                        <div>
                            <span style="color: var(--text-secondary); font-size: 0.85rem;">🕐 الوقت:</span>
                            <div style="color: var(--text-primary); font-weight: 600; margin-top: 5px;">
                                ${timeStr}
                            </div>
                        </div>
                        <div>
                            <span style="color: var(--text-secondary); font-size: 0.85rem;">⏱️ المدة:</span>
                            <div style="color: var(--text-primary); font-weight: 600; margin-top: 5px;">
                                <div style="margin-bottom: 3px;">
                                    <span style="font-size: 0.8rem; color: var(--text-secondary);">المحددة:</span>
                                    <span style="margin-right: 5px;">${achievement.task_duration_minutes || 0} دقيقة</span>
                                </div>
                                <div>
                                    <span style="font-size: 0.8rem; color: var(--text-secondary);">الفعلي:</span>
                                    <span style="margin-right: 5px; color: #4CAF50; font-weight: 700;">${achievement.session_duration_minutes || 0} دقيقة</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span style="color: var(--text-secondary); font-size: 0.85rem;">📊 الإكمال:</span>
                            <div style="color: var(--text-primary); font-weight: 600; margin-top: 5px;">
                                ${achievement.completed_percentage || 0}%
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        content.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ في تحميل الإنجازات:', error);
        content.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 40px;">
                <p style="color: #e74c3c;">⚠️ خطأ في تحميل الإنجازات: ${error.message}</p>
            </div>
        `;
    }
}

// دالة لتعديل لون الشارة (للتدرج) - للإنجازات
function adjustBadgeColorForAchievements(color) {
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const darkerR = Math.max(0, r - 30);
        const darkerG = Math.max(0, g - 30);
        const darkerB = Math.max(0, b - 30);
        return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    }
    return color;
}

// دالة لإظهار/إخفاء وصف الشارة في الإنجازات
function toggleBadgeDescriptionAchievements(badgeId) {
    const description = document.getElementById(badgeId);
    if (!description) return;
    
    // إخفاء جميع الأوصاف الأخرى
    const allDescriptions = document.querySelectorAll('.badge-description-achievements');
    allDescriptions.forEach(desc => {
        if (desc.id !== badgeId) {
            desc.style.display = 'none';
        }
    });
    
    // إظهار/إخفاء الوصف المحدد
    if (description.style.display === 'none' || !description.style.display) {
        description.style.display = 'block';
    } else {
        description.style.display = 'none';
    }
}

// جعل الدالة متاحة بشكل عام
window.toggleBadgeDescriptionAchievements = toggleBadgeDescriptionAchievements;

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    const addModal = document.getElementById('addChildModal');
    const editModal = document.getElementById('editChildModal');
    const settingsModal = document.getElementById('settingsModal');
    const addTaskModal = document.getElementById('addTaskModal');
    const manageTasksModal = document.getElementById('manageTasksModal');
    const achievementsModal = document.getElementById('achievementsModal');
    
    if (event.target === addModal) {
        closeAddChildModal();
    }
    if (event.target === editModal) {
        closeEditChildModal();
    }
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
    if (event.target === addTaskModal) {
        closeAddTaskModal();
    }
    if (event.target === manageTasksModal) {
        closeManageTasksModal();
    }
    if (event.target === achievementsModal) {
        closeAchievementsModal();
    }
}
