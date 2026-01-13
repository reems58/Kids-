// صفحة الطفل
let currentChildId = null;
let currentTask = null;
let currentSession = null;
let timerInterval = null;
let remainingTime = 0; // بالثواني
let isPaused = false;
let gameWindow = null;
let gameWindowCheckInterval = null;

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // محاولة الحصول على child_id من URL أولاً
    const urlParams = new URLSearchParams(window.location.search);
    const childIdFromUrl = urlParams.get('child_id');
    
    // استخدام child_id من URL أو من sessionStorage
    currentChildId = childIdFromUrl || sessionStorage.getItem('current_child_id');
    
    if (!currentChildId) {
        alert('يرجى اختيار طفل أولاً');
        window.location.href = 'parent_dashboard.html';
        return;
    }
    
    // حفظ child_id في sessionStorage
    sessionStorage.setItem('current_child_id', currentChildId);
    
    console.log('Child ID:', currentChildId);
    
    // تحميل البيانات
    loadChildData();
    loadCurrentTask();
    loadAllTasks();
    loadBadges();
    
    // تحميل اللقب والنجوم بعد تأخير قصير لضمان تحميل DOM
    setTimeout(() => {
        console.log('⏰ Calling loadChildTitle() after DOM load...');
        loadChildTitle();
    }, 100);
    
    // أيضاً استدعاء مباشر بعد تأخير أطول كنسخة احتياطية
    setTimeout(() => {
        console.log('⏰ Calling loadChildTitle() again as backup...');
        loadChildTitle();
    }, 1000);
});

// تحميل بيانات الطفل
async function loadChildData() {
    try {
        console.log('Loading child data for ID:', currentChildId);
        const response = await fetch(`../api/get_child_details.php?child_id=${currentChildId}`);
        const result = await response.json();
        console.log('Child data response:', result);
        
        if (result.success) {
            const child = result.child;
            document.getElementById('childName').textContent = child.child_name;
            document.getElementById('childAvatar').textContent = child.child_name.charAt(0);
            document.getElementById('childStats').textContent = `الوقت الإجمالي: ${child.total_time || 0} دقيقة`;
            
            // حفظ العمر في sessionStorage لاستخدامه في الألعاب
            if (child.age) {
                sessionStorage.setItem('child_age', child.age);
                console.log('✅ تم حفظ عمر الطفل:', child.age);
            }
        }
        
        // تحميل اللقب والنجوم
        await loadChildTitle();
    } catch (error) {
        console.error('خطأ في تحميل بيانات الطفل:', error);
    }
}

// تحميل لقب الطفل والنجوم
async function loadChildTitle() {
    try {
        console.log('🔄 Loading child title for ID:', currentChildId);
        
        if (!currentChildId) {
            console.error('❌ currentChildId is null or undefined!');
            return;
        }
        
        const url = `../api/get_child_title.php?child_id=${currentChildId}&_t=${Date.now()}`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        const result = await response.json();
        console.log('Child title response:', result);
        
        if (result.success && result.child) {
            const child = result.child;
            console.log('Child data:', child);
            
            // محاولة متعددة للعثور على العناصر
            let titleElement = document.getElementById('childTitle');
            let starsElement = document.getElementById('totalStars');
            
            // إذا لم يتم العثور على العناصر، انتظر قليلاً وحاول مرة أخرى
            if (!titleElement || !starsElement) {
                console.warn('⚠️ Elements not found, retrying after 200ms...');
                await new Promise(resolve => setTimeout(resolve, 200));
                titleElement = document.getElementById('childTitle');
                starsElement = document.getElementById('totalStars');
            }
            
            if (titleElement) {
                const newTitle = child.title || 'مبتدئ 🎈';
                
                // إزالة جميع المحتويات أولاً
                titleElement.innerHTML = '';
                titleElement.textContent = '';
                
                // تحديث بطرق متعددة لضمان التحديث
                titleElement.textContent = newTitle;
                titleElement.innerHTML = newTitle;
                
                // إضافة class للتأكد من التحديث وإجبار إعادة الرسم
                titleElement.classList.add('updated');
                titleElement.style.display = 'none';
                titleElement.offsetHeight; // إجبار إعادة الرسم
                titleElement.style.display = '';
                
                // تحديث مرئي فوري
                titleElement.setAttribute('data-title', newTitle);
                
                console.log('✅ Title updated to:', newTitle);
                console.log('Title element after update:', titleElement);
                console.log('Title element textContent:', titleElement.textContent);
                console.log('Title element innerHTML:', titleElement.innerHTML);
                console.log('Title element visible?', titleElement.offsetParent !== null);
                console.log('Title element computed style:', window.getComputedStyle(titleElement).display);
            } else {
                console.error('❌ titleElement not found after retry!');
                console.error('Available elements:', document.querySelectorAll('[id*="Title"], [id*="title"]'));
            }
            
            if (starsElement) {
                const newStars = child.total_stars || 0;
                starsElement.textContent = newStars;
                starsElement.innerHTML = newStars;
                console.log('✅ Stars updated to:', newStars);
                console.log('Stars element after update:', starsElement);
            } else {
                console.error('❌ starsElement not found after retry!');
                console.error('Available elements:', document.querySelectorAll('[id*="Stars"], [id*="stars"]'));
            }
        } else {
            console.error('❌ Failed to load child title:', result.message || 'Unknown error');
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل اللقب والنجوم:', error);
        console.error('Error stack:', error.stack);
    }
}

// تحميل المهمة الحالية
async function loadCurrentTask(forceUpdate = false) {
    try {
        console.log('Loading current task for child ID:', currentChildId);
        // إضافة timestamp لمنع التخزين المؤقت
        const response = await fetch(`../api/get_current_task.php?child_id=${currentChildId}&_t=${Date.now()}`);
        const result = await response.json();
        console.log('Current task response:', result);
        
        if (result.success && result.task) {
            // إذا كانت المهمة الجديدة مختلفة عن الحالية، قم بتحديثها
            if (forceUpdate || !currentTask || currentTask.task_id !== result.task.task_id) {
                currentTask = result.task;
                console.log('Task loaded:', currentTask); // للتشخيص
                displayCurrentTask(currentTask);
                
                // تحديث قائمة المهام
                loadAllTasks();
            }
        } else {
            console.log('No current task available:', result.message);
            // لا توجد مهمة جديدة
            if (currentTask) {
                // إذا كانت هناك مهمة حالية، قم بإخفاء الأزرار
                document.getElementById('btnStartTask').style.display = 'none';
                document.getElementById('taskTimer').style.display = 'none';
                document.getElementById('btnPauseTask').style.display = 'none';
                document.getElementById('btnCompleteTask').style.display = 'none';
            } else {
                displayNoTask();
            }
            // تحديث قائمة المهام
            loadAllTasks();
        }
    } catch (error) {
        console.error('خطأ في تحميل المهمة:', error);
        displayNoTask();
    }
}

// عرض المهمة الحالية
function displayCurrentTask(task) {
    document.getElementById('taskName').textContent = task.task_name_ar;
    document.getElementById('taskSubject').textContent = task.subject_name_ar;
    document.getElementById('taskIcon').textContent = getSubjectIcon(task.subject_name_ar);
    
    // بناء الوصف مع المدة
    let descriptionHTML = `<p>${task.description || 'ابدأ المهمة للتعلم!'}</p>`;
    if (task.duration_minutes) {
        descriptionHTML += `<p style="margin-top: 10px; color: #6366f1; font-size: 0.95em; font-weight: 600;">⏱️ المدة المخصصة: ${task.duration_minutes} دقيقة</p>`;
    }
    
    // إضافة حالة المهمة إذا كانت متوقفة أو قيد التنفيذ
    if (task.status === 'paused') {
        descriptionHTML += `<p style="margin-top: 10px; color: #ec4899; font-size: 0.95em; font-weight: 600;">⏸️ المهمة متوقفة - يمكنك إكمالها</p>`;
    } else if (task.status === 'in_progress') {
        descriptionHTML += `<p style="margin-top: 10px; color: #6366f1; font-size: 0.95em; font-weight: 600;">▶️ المهمة قيد التنفيذ</p>`;
    }
    
    document.getElementById('taskDescription').innerHTML = descriptionHTML;
    
    // عرض الملاحظات من الأهل إن وجدت
    const parentNoteContainer = document.getElementById('parentNoteContainer');
    const parentNoteText = document.getElementById('parentNoteText');
    if (task.parent_note && task.parent_note.trim()) {
        parentNoteText.textContent = task.parent_note;
        parentNoteContainer.style.display = 'block';
    } else {
        parentNoteContainer.style.display = 'none';
    }
    
    document.getElementById('btnStartTask').style.display = 'block';
    document.getElementById('taskTimer').style.display = 'none';
    document.getElementById('btnPauseTask').style.display = 'none';
    document.getElementById('btnCompleteTask').style.display = 'none';
}

// عرض حالة عدم وجود مهمة
function displayNoTask() {
    document.getElementById('taskName').textContent = 'لا توجد مهمة حالياً';
    document.getElementById('taskSubject').textContent = 'يرجى إعداد المهام من لوحة تحكم الأهل';
    document.getElementById('taskDescription').innerHTML = '<p>لا توجد مهمة محددة حالياً. يرجى الرجوع إلى لوحة تحكم الأهل لإعداد المهام.</p>';
    
    document.getElementById('btnStartTask').style.display = 'none';
    document.getElementById('taskTimer').style.display = 'none';
}

// بدء المهمة
async function startCurrentTask() {
    if (!currentTask) return;
    
    try {
        // إنشاء جلسة جديدة
        const response = await fetch('../api/start_session.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                child_id: currentChildId,
                task_id: currentTask.task_id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentSession = result.session;
            
            // حفظ معلومات الجلسة في sessionStorage
            sessionStorage.setItem('current_session_id', currentSession.session_id);
            sessionStorage.setItem('current_task_id', currentTask.task_id);
            sessionStorage.setItem('current_child_id', currentChildId);
            
            // فتح اللعبة مباشرة إذا كان هناك رابط محتوى
            console.log('=== بدء المهمة ===');
            console.log('currentTask:', currentTask); // للتشخيص
            console.log('content_url:', currentTask.content_url); // للتشخيص
            console.log('content_url type:', typeof currentTask.content_url); // للتشخيص
            console.log('content_url empty?', !currentTask.content_url || currentTask.content_url.trim() === ''); // للتشخيص
            
            if (currentTask.content_url && currentTask.content_url.trim() !== '') {
                // التحقق من نوع المحتوى: فيديو أم لعبة
                const isVideo = currentTask.content_type === 'فيديو' || 
                               (currentTask.content_url.includes('youtube.com') || 
                                currentTask.content_url.includes('youtu.be'));
                
                if (isVideo) {
                    // إذا كان فيديو، افتحه في modal window
                    console.log('Opening video in modal:', currentTask.content_url);
                    
                    // استخدام دالة openFullscreenVideo من content_view.js إذا كانت متوفرة
                    if (typeof window.openFullscreenVideo === 'function') {
                        window.openFullscreenVideo(currentTask.content_url);
                    } else {
                        // إذا لم تكن الدالة متوفرة، ننشئ modal بسيط
                        openVideoModal(currentTask.content_url);
                    }
                } else {
                    // إذا كانت لعبة، افتحها في نافذة جديدة
                    // بناء رابط اللعبة مع المعاملات (نفس طريقة content_view.js)
                    let gameUrl = currentTask.content_url;
                    
                    // إضافة المعاملات
                    const separator = gameUrl.includes('?') ? '&' : '?';
                    gameUrl += `${separator}child_id=${currentChildId}`;
                    gameUrl += `&task_id=${currentTask.task_id}`;
                    
                    // إضافة session_id إلى URL (مهم جداً!)
                    if (currentSession && currentSession.session_id) {
                        gameUrl += `&session_id=${currentSession.session_id}`;
                    }
                    
                    if (currentTask.duration_minutes) {
                        gameUrl += `&duration=${encodeURIComponent(currentTask.duration_minutes)}`;
                    }
                    
                    // إضافة العمر إذا كان متوفراً
                    const childAge = sessionStorage.getItem('child_age');
                    if (childAge) {
                        gameUrl += `&age=${encodeURIComponent(childAge)}`;
                    } else if (currentTask.min_age) {
                        gameUrl += `&age=${encodeURIComponent(currentTask.min_age)}`;
                    }
                    
                    console.log('Opening game URL in new tab:', gameUrl); // للتشخيص
                    
                    // فتح اللعبة في تبويب جديد مع الحفاظ على sessionStorage للطفل والجلسة
                    gameWindow = window.open(gameUrl, '_blank');
                    
                    if (!gameWindow) {
                        alert('تم منع فتح النافذة الجديدة. يرجى السماح بالنوافذ المنبثقة.');
                    }
                }
            } else {
                console.error('content_url is missing or empty:', currentTask);
                alert('لا يوجد رابط للعبة! يرجى التحقق من إعدادات المهمة.\n\ncontent_url: ' + (currentTask.content_url || 'null'));
            }
        } else {
            alert('خطأ في بدء الجلسة: ' + result.message);
        }
    } catch (error) {
        console.error('خطأ في بدء الجلسة:', error);
        alert('حدث خطأ أثناء بدء الجلسة');
    }
}

// مراقبة نافذة اللعبة
function startMonitoringGameWindow() {
    // إيقاف أي مراقبة سابقة
    if (gameWindowCheckInterval) {
        clearInterval(gameWindowCheckInterval);
    }
    
    const currentTaskIdWhenStarted = currentTask ? currentTask.task_id : null;
    let checkCount = 0;
    const maxChecks = 300; // 5 دقائق كحد أقصى (300 * 1000ms)
    
    // التحقق من إغلاق النافذة والتحقق من إكمال المهمة
    gameWindowCheckInterval = setInterval(() => {
        checkCount++;
        
        // التحقق من إغلاق النافذة
        if (gameWindow && gameWindow.closed) {
            console.log('🎮 Game window closed, checking task completion...');
            clearInterval(gameWindowCheckInterval);
            gameWindowCheckInterval = null;
            gameWindow = null;
            
            // التحقق من إكمال المهمة مباشرة
            if (currentTaskIdWhenStarted) {
                // إعطاء وقت قصير للخادم لتحديث قاعدة البيانات
                setTimeout(async () => {
                    await checkTaskCompletion(currentTaskIdWhenStarted);
                    // تحديث اللقب والنجوم بعد التحقق من إكمال المهمة
                    await loadChildTitle();
                }, 1000);
            } else {
                // إذا لم يكن هناك taskId، قم بتحميل المهمة التالية مباشرة
                setTimeout(async () => {
                    await loadNextTaskWithRetry();
                    await loadChildTitle();
                }, 500);
            }
            return;
        }
        
        // التحقق من إكمال المهمة كل ثانية (حتى لو لم تُغلق النافذة)
        if (checkCount % 10 === 0 && currentTaskIdWhenStarted) {
            checkTaskCompletion(currentTaskIdWhenStarted);
        }
        
        // إيقاف المراقبة بعد 5 دقائق
        if (checkCount >= maxChecks) {
            clearInterval(gameWindowCheckInterval);
            gameWindowCheckInterval = null;
        }
    }, 100); // كل 100ms للاستجابة السريعة
}

// التحقق من إكمال المهمة
async function checkTaskCompletion(taskId) {
    try {
        console.log('🔍 Checking task completion for task ID:', taskId);
        
        // تحديث قائمة المهام أولاً لرؤية التغييرات
        await loadAllTasks();
        
        const response = await fetch(`../api/get_current_task.php?child_id=${currentChildId}&_t=${Date.now()}`);
        const result = await response.json();
        
        console.log('Task completion check result:', { taskId, currentTaskId: result.task?.task_id, result });
        
        // إذا كانت المهمة الحالية مختلفة عن المهمة التي بدأنا بها، فهذا يعني أن المهمة تم إكمالها
        if (result.success && result.task && result.task.task_id !== taskId) {
            console.log('✅ Task completed! Loading next task...', result.task);
            if (gameWindowCheckInterval) {
                clearInterval(gameWindowCheckInterval);
                gameWindowCheckInterval = null;
            }
            if (gameWindow && !gameWindow.closed) {
                gameWindow.close();
            }
            gameWindow = null;
            
            // تحديث قائمة المهام مرة أخرى لإظهار المهمة المكتملة والمهمة الجديدة
            await loadAllTasks();
            
            // تحديث اللقب والنجوم بعد إكمال المهمة
            await loadChildTitle();
            
            // تحميل المهمة التالية
            loadNextTaskWithRetry();
        } else if (!result.success || !result.task) {
            // لا توجد مهمة جديدة - قد تكون جميع المهام مكتملة
            console.log('ℹ️ No more tasks available');
            // تحديث قائمة المهام لإظهار أن جميع المهام مكتملة
            await loadAllTasks();
        } else {
            console.log('⏳ Task not completed yet, still waiting...');
        }
    } catch (error) {
        console.error('❌ Error checking task completion:', error);
    }
}

// تحميل المهمة التالية مع إعادة المحاولة
async function loadNextTaskWithRetry(retries = 8) {
    console.log('=== Loading next task with retry ===');
    console.log('Previous task ID:', currentTask ? currentTask.task_id : 'none');
    
    // مسح المهمة الحالية لضمان تحميل المهمة الجديدة
    const previousTaskId = currentTask ? currentTask.task_id : null;
    currentTask = null;
    
    // تحديث قائمة المهام أولاً لرؤية التغييرات (المهمة المكتملة ستظهر كمكتملة)
    await loadAllTasks();
    
    for (let i = 0; i < retries; i++) {
        // تأخير متزايد: 300ms, 600ms, 900ms, 1200ms, 1500ms, 1800ms, 2100ms, 2400ms
        await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)));
        
        try {
            // إضافة timestamp لمنع التخزين المؤقت
            const url = `../api/get_current_task.php?child_id=${currentChildId}&_t=${Date.now()}`;
            console.log(`Attempt ${i + 1}/${retries}: Fetching from ${url}`);
            
            const response = await fetch(url);
            const result = await response.json();
            
            console.log(`Attempt ${i + 1} result:`, result);
            
            if (result.success && result.task) {
                // إذا كانت المهمة الجديدة مختلفة عن السابقة
                if (result.task.task_id !== previousTaskId) {
                    console.log('✅ Next task found!', result.task);
                    currentTask = result.task;
                    displayCurrentTask(currentTask);
                    
                    // تحديث قائمة المهام لإظهار المهمة الجديدة
                    await loadAllTasks();
                    await loadChildTitle(); // تحديث النجوم واللقب
                    return; // نجح، لا حاجة لإعادة المحاولة
                } else {
                    console.log(`⏳ Same task (${result.task.task_id}), waiting for update...`);
                    // تحديث قائمة المهام حتى لو كانت نفس المهمة
                    await loadAllTasks();
                }
            } else {
                console.log('❌ No task available:', result.message || 'Unknown error');
                // تحديث قائمة المهام لإظهار أن جميع المهام مكتملة
                await loadAllTasks();
            }
        } catch (error) {
            console.error(`❌ Error in attempt ${i + 1}:`, error);
        }
    }
    
    // إذا فشلت جميع المحاولات، قم بتحديث القائمة فقط
    console.log('⚠️ All retries exhausted, forcing update...');
    await loadAllTasks();
    await loadChildTitle(); // تحديث النجوم واللقب
    loadCurrentTask(true); // فرض التحديث
}

// بدء المؤقت
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    isPaused = false;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (!isPaused && remainingTime > 0) {
            remainingTime--;
            updateTimerDisplay();
            
            if (remainingTime === 0) {
                completeTask();
            }
        }
    }, 1000);
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    document.getElementById('timerMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('timerSeconds').textContent = String(seconds).padStart(2, '0');
    
    // تحديث دائرة التقدم
    const totalSeconds = currentTask.duration_minutes * 60;
    const progress = ((totalSeconds - remainingTime) / totalSeconds) * 565.48;
    document.getElementById('timerProgress').style.strokeDashoffset = 565.48 - progress;
}

// إيقاف المهمة مؤقتاً
function pauseTask() {
    isPaused = !isPaused;
    
    if (isPaused) {
        document.getElementById('btnPauseTask').textContent = 'استئناف';
        playSound('pause');
    } else {
        document.getElementById('btnPauseTask').textContent = 'إيقاف مؤقت';
        playSound('resume');
    }
}

// إكمال المهمة
async function completeTask() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // حساب نسبة الإكمال بناءً على الإجابات الصحيحة (إن وجدت)
    // محاولة جلب النسبة من الألعاب أولاً
    let completed_percentage = 0;
    
    // محاولة جلب عدد الإجابات الصحيحة من الألعاب
    const correctAnswers = (typeof window !== 'undefined' && typeof window.correctAnswers !== 'undefined') ? window.correctAnswers : 0;
    const totalQuestions = (typeof window !== 'undefined' && typeof window.totalQuestions !== 'undefined') ? window.totalQuestions : 0;
    
    if (totalQuestions > 0 && correctAnswers >= 0) {
        // استخدام عدد الإجابات الصحيحة
        completed_percentage = Math.round((correctAnswers / totalQuestions) * 100);
        console.log('✅ Using correct answers for percentage:', { correctAnswers, totalQuestions, completed_percentage });
    } else {
        // إذا لم تكن هناك ألعاب، نستخدم الوقت كبديل (للفيديوهات والمهام الأخرى)
    const totalSeconds = currentTask.duration_minutes * 60;
    const completedSeconds = totalSeconds - remainingTime;
        completed_percentage = Math.round((completedSeconds / totalSeconds) * 100);
        console.log('⏱️ Using time for percentage:', { completedSeconds, totalSeconds, completed_percentage });
    }
    
    try {
        const response = await fetch('../api/complete_task.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                child_id: currentChildId,
                task_id: currentTask.task_id,
                session_id: currentSession.session_id,
                duration: currentTask.duration_minutes - Math.floor(remainingTime / 60),
                completed_percentage: completed_percentage
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            playSound('success');
            
            // تحديث النجوم واللقب
            if (result.stars) {
                // تحديث عرض النجوم
                await loadChildTitle();
            }
            
            showSuccessModal(result.badges || [], result.stars, result.title);
            
            // تحديث البيانات
            loadChildData();
            loadAllTasks();
            loadBadges();
            
            // إعادة تعيين الواجهة وتحميل المهمة التالية تلقائياً
            setTimeout(() => {
                document.getElementById('taskTimer').style.display = 'none';
                document.getElementById('btnPauseTask').style.display = 'none';
                document.getElementById('btnCompleteTask').style.display = 'none';
                
                // تحميل المهمة التالية تلقائياً
                loadCurrentTask();
            }, 3000);
        } else {
            alert('خطأ في إكمال المهمة: ' + result.message);
        }
    } catch (error) {
        console.error('خطأ في إكمال المهمة:', error);
        alert('حدث خطأ أثناء إكمال المهمة');
    }
}

// عرض نافذة النجاح
function showSuccessModal(badges = [], stars = 0, newTitle = null) {
    const modal = document.getElementById('successModal');
    document.getElementById('successTitle').textContent = 'ممتاز! 🎉';
    
    let message = `أكملت المهمة "${currentTask.task_name_ar}" بنجاح!`;
    
    // إضافة النجوم
    if (stars > 0) {
        const starsText = '⭐'.repeat(stars);
        message += `\n\nحصلت على ${starsText} (${stars} نجوم)!`;
    }
    
    // إضافة الشارات
    if (badges.length > 0) {
        message += `\nحصلت على ${badges.length} شارة جديدة!`;
    }
    
    // إضافة اللقب الجديد إذا تغير
    if (newTitle) {
        const currentTitle = document.getElementById('childTitle').textContent;
        if (newTitle !== currentTitle) {
            message += `\n\n🎊 مبروك! لقبك الجديد: ${newTitle}`;
        }
    }
    
    document.getElementById('successMessage').textContent = message;
    modal.style.display = 'block';
}

// إغلاق نافذة النجاح
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    
    // بعد إغلاق النافذة، تأكد من تحميل المهمة التالية
    // (قد تكون تم تحميلها بالفعل، لكن للتأكد)
    setTimeout(() => {
        loadCurrentTask();
    }, 500);
}

// تحميل جميع المهام مرتبة حسب الأولوية
async function loadAllTasks() {
    try {
        console.log('Loading all tasks for child ID:', currentChildId);
        const response = await fetch(`../api/get_child_tasks.php?child_id=${currentChildId}`);
        const result = await response.json();
        console.log('All tasks response:', result);
        
        if (result.success && result.tasks && result.tasks.length > 0) {
            console.log(`Found ${result.tasks.length} tasks`);
            // طباعة جميع المهام للتشخيص
            result.tasks.forEach((task, idx) => {
                console.log(`Task ${idx + 1}:`, {
                    task_id: task.task_id,
                    task_name: task.task_name_ar,
                    status: task.status
                });
            });
            displayAllTasks(result.tasks);
        } else {
            console.log('No tasks found');
            const tasksList = document.getElementById('tasksList');
            if (tasksList) {
                tasksList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">لا توجد مهام حالياً</p>';
            }
        }
    } catch (error) {
        console.error('خطأ في تحميل المهام:', error);
        const tasksList = document.getElementById('tasksList');
        if (tasksList) {
            tasksList.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 20px;">خطأ في تحميل المهام</p>';
        }
    }
}

// عرض جميع المهام
function displayAllTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;
    
    // ترتيب المهام حسب order_index
    const sortedTasks = tasks.sort((a, b) => {
        const orderA = a.order_index !== null && a.order_index !== undefined ? a.order_index : 999;
        const orderB = b.order_index !== null && b.order_index !== undefined ? b.order_index : 999;
        return orderA - orderB;
    });
    
    tasksList.innerHTML = sortedTasks.map((task, index) => {
        // تشخيص: طباعة حالة المهمة
        console.log(`Task ${index + 1}:`, {
            task_id: task.task_id,
            task_name: task.task_name_ar,
            status: task.status,
            status_type: typeof task.status
        });
        
        const statusText = task.status === 'pending' ? 'في الانتظار' : 
                          task.status === 'completed' ? 'مكتمل' : 
                          task.status === 'in_progress' ? 'قيد التنفيذ' : 
                          task.status === 'paused' ? 'متوقفة' : 'متخطاة';
        const statusClass = task.status === 'completed' ? 'task-status-completed' : 
                           task.status === 'in_progress' ? 'task-status-in-progress' : 
                           task.status === 'paused' ? 'task-status-paused' :
                           task.status === 'skipped' ? 'task-status-skipped' :
                           'task-status-pending';
        
        const isCurrentTask = task.task_id === currentTask?.task_id;
        const cardClasses = `task-item-card ${isCurrentTask ? 'current-task' : ''} ${task.status === 'completed' ? 'completed' : ''} ${task.status === 'in_progress' ? 'in-progress' : ''}`;
        
        // أيقونة حسب نوع المحتوى
        const subjectIcon = task.subject_icon || 
                           (task.subject_name_ar?.includes('عربي') ? '📚' : 
                           task.subject_name_ar?.includes('رياضيات') ? '🔢' : 
                           task.subject_name_ar?.includes('علوم') ? '🔬' : '🎮');
        
        // عرض حالة المهمة: للمهام المتوقفة والمكتملة، نعرضها بشكل مميز
        let statusDisplay = '';
        // التحقق من الحالة بشكل أكثر مرونة
        const taskStatus = String(task.status || '').toLowerCase().trim();
        
        if (taskStatus === 'paused') {
            console.log(`✅ Task ${task.task_id} is paused - showing paused box`);
            statusDisplay = `
                <div class="task-status-box paused">
                    <span class="status-icon">⏸️</span>
                    <span class="status-text">متوقفة</span>
                </div>
            `;
        } else if (taskStatus === 'completed') {
            console.log(`✅ Task ${task.task_id} is completed - showing completed box`);
            statusDisplay = `
                <div class="task-status-box completed">
                    <span class="status-icon">✅</span>
                    <span class="status-text">مكتملة</span>
                </div>
            `;
        } else {
            // للمهام الأخرى (pending, in_progress, skipped)، نعرضها كـ badge عادي
            console.log(`ℹ️ Task ${task.task_id} status is "${taskStatus}" - showing badge`);
            statusDisplay = `<span class="task-status-badge ${statusClass}">${statusText}</span>`;
        }
        
        return `
            <div class="${cardClasses}" data-task-id="${task.task_id}">
                <div class="task-item-number">${index + 1}</div>
                <div class="task-item-content">
                    <div class="task-item-header">
                        <h3 class="task-item-title">${task.task_name_ar || task.task_name}</h3>
                        ${isCurrentTask ? '<span class="task-item-flame">🔥</span>' : ''}
                    </div>
                    <div class="task-item-details">
                        <span class="task-item-detail-item">
                            <span class="icon">${subjectIcon}</span>
                            <span>${task.subject_name_ar || 'لعبة'}</span>
                        </span>
                        <span class="task-item-detail-item">
                            <span class="icon">⏱️</span>
                            <span>${task.duration_minutes} دقيقة</span>
                        </span>
                        ${statusDisplay}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// تحميل الشارات
async function loadBadges() {
    try {
        const response = await fetch(`../api/get_child_badges.php?child_id=${currentChildId}`);
        const result = await response.json();
        
        if (result.success) {
            displayBadges(result.badges);
        }
    } catch (error) {
        console.error('خطأ في تحميل الشارات:', error);
    }
}

// عرض الشارات
function displayBadges(badges) {
    const container = document.getElementById('badgesGrid');
    
    if (!badges || badges.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); grid-column: 1/-1; padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🏆</div>
                <p style="font-size: 1.1rem; color: var(--text-secondary);">
                    لا توجد شارات بعد
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 10px;">
                    أكمل المهام لتحصل على شارات جديدة!
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = badges.map((badge, index) => {
        const colorCode = badge.color_code || '#f59e0b';
        const badgeId = `badge-child-${index}`;
        return `
            <div class="badge-card" id="${badgeId}" style="
                background: linear-gradient(135deg, ${colorCode} 0%, ${adjustBadgeColorForChild(colorCode)} 100%);
                border-radius: 16px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onclick="toggleBadgeDescriptionChild('${badgeId}', ${index})">
                <div class="badge-icon" style="font-size: 3rem; margin-bottom: 10px;">${badge.badge_icon || '🏆'}</div>
                <div class="badge-name" style="font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 8px;">
                    ${badge.badge_name_ar || badge.badge_name}
                </div>
                <div class="badge-stars" style="font-size: 0.95rem; color: rgba(255,255,255,0.95); font-weight: 600;">
                ⭐ ${badge.stars_earned || 0} نجوم
            </div>
                <div class="badge-description-child" id="badge-desc-child-${index}" style="
                    display: none;
                    margin-top: 15px;
                    padding: 15px;
                    background: rgba(255,255,255,0.95);
                    border-radius: 10px;
                    color: #333;
                    font-size: 0.9rem;
                    line-height: 1.6;
                    text-align: right;
                    animation: fadeIn 0.3s ease;
                ">
                    ${badge.description || 'لا يوجد وصف متاح'}
        </div>
            </div>
        `;
    }).join('');
    
    // حفظ بيانات الشارات للوصول إليها لاحقاً
    window.badgesDataChild = badges;
}

// دالة لتعديل لون الشارة (للتدرج) - لصفحة الطفل
function adjustBadgeColorForChild(color) {
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

// دالة لإظهار/إخفاء وصف الشارة في صفحة الطفل
function toggleBadgeDescriptionChild(badgeId, index) {
    const description = document.getElementById(`badge-desc-child-${index}`);
    if (!description) return;
    
    // إخفاء جميع الأوصاف الأخرى
    const allDescriptions = document.querySelectorAll('.badge-description-child');
    allDescriptions.forEach(desc => {
        if (desc.id !== `badge-desc-child-${index}`) {
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
window.toggleBadgeDescriptionChild = toggleBadgeDescriptionChild;


// الحصول على أيقونة المادة
function getSubjectIcon(subjectName) {
    const icons = {
        'عربي': '📚',
        'رياضيات': '🔢',
        'علوم': '🔬'
    };
    return icons[subjectName] || '📖';
}

// تشغيل صوت
function playSound(type) {
    // يمكن إضافة أصوات حقيقية لاحقاً
    console.log(`Playing ${type} sound`);
}

// الخروج من الجلسة
function exitSession() {
    if (confirm('هل تريد الخروج من الجلسة؟')) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        sessionStorage.removeItem('current_child_id');
        window.location.href = 'parent_dashboard.html';
    }
}

// استدعاء مباشر عند تحميل الصفحة لضمان تحديث اللقب
window.addEventListener('load', function() {
    console.log('🌐 Window loaded, calling loadChildTitle()...');
    if (currentChildId) {
        setTimeout(() => {
            loadChildTitle();
        }, 500);
    }
});

// ============================================
// وظائف الفيديو (Modal Window)
// ============================================

// تحويل رابط YouTube إلى رابط embed
function convertToEmbedUrl(url) {
    // إذا كان الرابط بالفعل embed، ارجعه كما هو
    if (url.includes('youtube.com/embed/')) {
        return url + (url.includes('?') ? '&' : '?') + 'autoplay=1&rel=0&modestbranding=1';
    }
    
    // استخراج معرف الفيديو من رابط YouTube
    let videoId = '';
    
    // رابط بصيغة watch?v=...
    if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
    }
    // رابط بصيغة youtu.be/...
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&playsinline=1`;
    }
    
    return url;
}

// فتح الفيديو في وضع ملء الشاشة
function openVideoModal(videoUrl) {
    console.log('openVideoModal called with URL:', videoUrl);
    
    const modal = document.getElementById('fullscreenVideoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (!modal) {
        console.error('Modal not found!');
        return;
    }
    
    if (!videoPlayer) {
        console.error('Video player not found!');
        return;
    }
    
    // تحويل الرابط إلى رابط embed
    const embedUrl = convertToEmbedUrl(videoUrl);
    console.log('Embed URL:', embedUrl);
    
    videoPlayer.src = embedUrl;
    
    // عرض الـ modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
    
    console.log('Video modal opened');
}

// إغلاق الفيديو
function closeFullscreenVideo() {
    const modal = document.getElementById('fullscreenVideoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (!modal || !videoPlayer) return;
    
    // إخفاء الـ modal
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // إعادة تفعيل التمرير
    
    // إيقاف الفيديو عن طريق إزالة المصدر
    videoPlayer.src = '';
    
    // أو يمكن استخدام pause إذا كان متاحاً
    try {
        videoPlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    } catch (e) {
        console.log('Could not pause video');
    }
}

// إغلاق عند الضغط على Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFullscreenVideo();
    }
});

// إغلاق عند الضغط خارج الفيديو
document.addEventListener('click', function(event) {
    const modal = document.getElementById('fullscreenVideoModal');
    const videoModalContent = document.querySelector('.video-modal-content');
    
    if (modal && event.target === modal) {
        closeFullscreenVideo();
    }
});

// جعل الدالة متاحة بشكل عام
window.openFullscreenVideo = openVideoModal;
window.closeFullscreenVideo = closeFullscreenVideo;

// أيضاً استدعاء عند focus الصفحة
window.addEventListener('focus', function() {
    console.log('👁️ Window focused, calling loadChildTitle()...');
    if (currentChildId) {
        loadChildTitle();
    }
});

