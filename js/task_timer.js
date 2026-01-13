/**
 * ملف مشترك لإدارة مؤقت المهمة في الألعاب
 */

let taskDurationMinutes = null;
let remainingTime = 0;
let taskTimerInterval = null;
let isTaskTimerActive = false;

// تهيئة تلقائية عند تحميل الملف
(function() {
    function autoInitTimer() {
        // انتظار أطول للتأكد من تحميل جميع الملفات وDOM
        setTimeout(function() {
            initTaskTimer();
        }, 500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitTimer);
    } else {
        autoInitTimer();
    }
})();

// تهيئة مؤقت المهمة
function initTaskTimer() {
    const urlParams = new URLSearchParams(window.location.search);
    const durationParam = urlParams.get('duration');
    
    console.log('initTaskTimer called, duration from URL:', durationParam); // للتشخيص
    
    if (durationParam && !isNaN(parseInt(durationParam)) && parseInt(durationParam) > 0) {
        taskDurationMinutes = parseInt(durationParam);
        remainingTime = taskDurationMinutes * 60; // تحويل إلى ثواني
        
        console.log('Timer initialized:', taskDurationMinutes, 'minutes =', remainingTime, 'seconds'); // للتشخيص
        
        // استخدام setTimeout للتأكد من أن DOM جاهز بالكامل
        setTimeout(function() {
            const created = createTimerElement();
            if (created) {
                startTaskTimer();
            } else {
                // إعادة المحاولة بعد فترة
                setTimeout(function() {
                    const retryCreated = createTimerElement();
                    if (retryCreated) {
                        startTaskTimer();
                    } else {
                        console.error('Failed to create timer element after retry'); // للتشخيص
                    }
                }, 500);
            }
        }, 200);
    } else {
        console.log('No valid duration parameter found in URL'); // للتشخيص
    }
}

// إنشاء عنصر المؤقت
function createTimerElement() {
    let timerElement = document.getElementById('taskTimer');
    if (timerElement) {
        console.log('Timer element already exists'); // للتشخيص
        return true;
    }
    
    const gameStats = document.querySelector('.game-stats');
    if (gameStats) {
        console.log('Creating timer element in game-stats'); // للتشخيص
        const timerDiv = document.createElement('div');
        timerDiv.className = 'stat-item';
        timerDiv.id = 'taskTimer';
        timerDiv.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 5px;';
        timerDiv.innerHTML = `
            <span class="stat-label">⏱️ الوقت المتبقي</span>
            <span class="stat-value" id="timerDisplay" style="font-size: 1.2em; font-weight: bold;">${formatTime(remainingTime)}</span>
        `;
        gameStats.appendChild(timerDiv);
        console.log('Timer element created successfully'); // للتشخيص
        return true;
    } else {
        console.error('game-stats element not found!'); // للتشخيص
        return false;
    }
}

// بدء مؤقت المهمة
function startTaskTimer() {
    if (!taskDurationMinutes || isTaskTimerActive) {
        console.log('Timer not started:', !taskDurationMinutes ? 'no duration' : 'already active'); // للتشخيص
        return;
    }
    
    console.log('Starting task timer:', taskDurationMinutes, 'minutes'); // للتشخيص
    isTaskTimerActive = true;
    updateTaskTimerDisplay();
    
    taskTimerInterval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            updateTaskTimerDisplay();
            
            // تحذير عند اقتراب انتهاء الوقت (دقيقة واحدة)
            if (remainingTime === 60) {
                showTimeWarning('⚠️ بقي دقيقة واحدة فقط!');
            }
            
            // تحذير عند اقتراب انتهاء الوقت (30 ثانية)
            if (remainingTime === 30) {
                showTimeWarning('⏰ بقي 30 ثانية فقط!');
            }
            
            // إنهاء اللعبة عند انتهاء الوقت
            if (remainingTime === 0) {
                stopTaskTimer();
                showTimeUpModal();
                // حفظ النقاط تلقائياً
                saveScoreAndComplete();
            }
        } else {
            stopTaskTimer();
        }
    }, 1000);
}

// تحديث عرض مؤقت المهمة
function updateTaskTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(remainingTime);
        
        // تغيير اللون عند اقتراب انتهاء الوقت
        if (remainingTime <= 60) {
            timerDisplay.style.color = '#dc3545';
        } else if (remainingTime <= 180) {
            timerDisplay.style.color = '#ffc107';
        } else {
            timerDisplay.style.color = '';
        }
    }
}

// تنسيق الوقت
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// إيقاف مؤقت المهمة
function stopTaskTimer() {
    if (taskTimerInterval) {
        clearInterval(taskTimerInterval);
        taskTimerInterval = null;
    }
    isTaskTimerActive = false;
}

// الحصول على الوقت المتبقي (للاستخدام في حفظ النتائج)
function getRemainingTime() {
    return remainingTime;
}

// الحصول على الوقت المستغرق
function getElapsedTime() {
    if (!taskDurationMinutes) return 0;
    return (taskDurationMinutes * 60) - remainingTime;
}

// إظهار رسالة تحذيرية
function showTimeWarning(message) {
    // إنشاء نافذة تحذيرية جميلة
    const warningDiv = document.createElement('div');
    warningDiv.id = 'timeWarningModal';
    warningDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;
    
    warningDiv.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            padding: 30px 40px;
            border-radius: 20px;
            text-align: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: scaleIn 0.3s;
        ">
            <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // إزالة النافذة بعد 3 ثوان
    setTimeout(() => {
        if (warningDiv.parentNode) {
            warningDiv.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                warningDiv.remove();
            }, 300);
        }
    }, 3000);
}

// إظهار نافذة انتهاء الوقت
function showTimeUpModal() {
    // إيقاف اللعبة
    if (typeof endGame === 'function') {
        endGame();
    }
    
    // إنشاء نافذة كبيرة
    const timeUpDiv = document.createElement('div');
    timeUpDiv.id = 'timeUpModal';
    timeUpDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.5s;
    `;
    
    // جلب النقاط الحالية إذا كانت موجودة
    const currentScore = typeof score !== 'undefined' ? score : 0;
    const correctAnswers = typeof correctAnswers !== 'undefined' ? correctAnswers : 0;
    
    timeUpDiv.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            padding: 80px 100px;
            border-radius: 40px;
            text-align: center;
            color: white;
            max-width: 800px;
            width: 90%;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
            animation: scaleIn 0.5s;
        ">
            <div style="font-size: 150px; margin-bottom: 30px; animation: pulse 1s infinite;">⏰</div>
            <h1 style="font-size: 96px; margin-bottom: 30px; font-weight: 900; text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.4); letter-spacing: 3px; line-height: 1.2;">
                انتهى الوقت
            </h1>
            <div style="
                background: rgba(255, 255, 255, 0.25);
                padding: 35px;
                border-radius: 20px;
                margin-bottom: 40px;
                border: 2px solid rgba(255, 255, 255, 0.3);
            ">
                <div style="font-size: 36px; margin-bottom: 20px; font-weight: 700;">النقاط: ${currentScore}</div>
                <div style="font-size: 32px; font-weight: 600;">الإجابات الصحيحة: ${correctAnswers}</div>
            </div>
            <div style="font-size: 24px; margin-bottom: 40px; opacity: 0.95; font-weight: 500;">
                تم حفظ النقاط تلقائياً
            </div>
            <button onclick="closeTimeUpModal()" style="
                background: white;
                color: #dc3545;
                border: none;
                padding: 20px 60px;
                border-radius: 30px;
                font-size: 26px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 20px rgba(0, 0, 0, 0.4)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 5px 15px rgba(0, 0, 0, 0.3)';">
                العودة
            </button>
        </div>
    `;
    
    // إضافة الأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(timeUpDiv);
    
    // دالة لإغلاق النافذة
    window.closeTimeUpModal = function() {
        timeUpDiv.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            timeUpDiv.remove();
            // العودة إلى صفحة الطفل
            const childId = new URLSearchParams(window.location.search).get('child_id') || 
                           sessionStorage.getItem('current_child_id');
            if (childId) {
                // تحديد المسار بناءً على موقع الملف الحالي
                const currentPath = window.location.pathname;
                const isInHtmlFolder = currentPath.includes('/html/');
                const childViewPath = isInHtmlFolder ? `child_view.html?child_id=${childId}` : `../html/child_view.html?child_id=${childId}`;
                // استخدام replace حتى لا يعود زر الرجوع إلى صفحة اللعبة
                window.location.replace(childViewPath);
            } else {
                const currentPath = window.location.pathname;
                const isInHtmlFolder = currentPath.includes('/html/');
                const dashboardPath = isInHtmlFolder ? 'parent_dashboard.html' : '../html/parent_dashboard.html';
                window.location.replace(dashboardPath);
            }
        }, 300);
    };
}

// حفظ النقاط وإكمال المهمة
async function saveScoreAndComplete() {
    console.log('=== saveScoreAndComplete called ===');
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
        const taskId = urlParams.get('task_id') || sessionStorage.getItem('current_task_id');
        // قراءة session_id من URL أولاً، ثم من sessionStorage
        const sessionId = urlParams.get('session_id') || sessionStorage.getItem('current_session_id');
        
        console.log('📋 Task completion data:', { 
            childId, 
            taskId, 
            sessionId,
            fromURL: {
                childId: urlParams.get('child_id'),
                taskId: urlParams.get('task_id'),
                sessionId: urlParams.get('session_id')
            },
            fromStorage: {
                childId: sessionStorage.getItem('current_child_id'),
                taskId: sessionStorage.getItem('current_task_id'),
                sessionId: sessionStorage.getItem('current_session_id')
            }
        });
        
        if (!childId || !taskId) {
            console.error('❌ معرفات الطفل أو المهمة غير موجودة:', { childId, taskId });
            alert('⚠️ خطأ: لا يمكن حفظ النتائج - معرفات الطفل أو المهمة غير موجودة');
            return { success: false, message: 'معرفات الطفل أو المهمة غير موجودة' };
        }
        
        if (!sessionId) {
            console.warn('⚠️ session_id غير موجود - سيتم إنشاء جلسة جديدة');
        }
        
        // حساب نسبة الإكمال بناءً على النقاط
        // محاولة الوصول للمتغيرات من window فقط (لأنها معرّفة في ملفات الألعاب)
        const currentScore = (typeof window !== 'undefined' && typeof window.score !== 'undefined') ? window.score : 0;
        const currentCorrectAnswers = (typeof window !== 'undefined' && typeof window.correctAnswers !== 'undefined') ? window.correctAnswers : 0;
        const currentTotalQuestions = (typeof window !== 'undefined' && typeof window.totalQuestions !== 'undefined') ? window.totalQuestions : 10;
        const currentQuestionNumber = (typeof window !== 'undefined' && typeof window.currentQuestionNumber !== 'undefined') ? window.currentQuestionNumber : 0;
        
        // حساب نسبة الإكمال بناءً على عدد الإجابات الصحيحة
        // النسبة = (عدد الإجابات الصحيحة / إجمالي الأسئلة) × 100
        let finalCompletedPercentage = 0;
        
        console.log('🔍 [task_timer] Before calculation:', {
            currentCorrectAnswers: currentCorrectAnswers,
            currentTotalQuestions: currentTotalQuestions,
            type_correctAnswers: typeof currentCorrectAnswers,
            type_totalQuestions: typeof currentTotalQuestions
        });
        
        if (currentTotalQuestions > 0) {
            const rawPercentage = (currentCorrectAnswers / currentTotalQuestions) * 100;
            finalCompletedPercentage = Math.round(rawPercentage);
            console.log('🔍 [task_timer] Calculation step:', {
                rawPercentage: rawPercentage,
                rounded: finalCompletedPercentage,
                formula: `${currentCorrectAnswers} / ${currentTotalQuestions} × 100 = ${rawPercentage}% → ${finalCompletedPercentage}%`
            });
        } else {
            console.warn('⚠️ [task_timer] currentTotalQuestions is 0 or invalid!');
        }
        
        // التأكد من أن النسبة لا تتجاوز 100%
        finalCompletedPercentage = Math.min(100, finalCompletedPercentage);
        
        console.log('🔍 [task_timer] After min(100):', {
            beforeMin: finalCompletedPercentage,
            afterMin: finalCompletedPercentage
        });
        
        console.log('📊 [task_timer] Percentage calculation (based on correct answers):', {
            currentCorrectAnswers,
            currentTotalQuestions,
            finalCompletedPercentage,
            formula: `(${currentCorrectAnswers} / ${currentTotalQuestions}) × 100 = ${finalCompletedPercentage}%`,
            window_correctAnswers: typeof window !== 'undefined' ? window.correctAnswers : 'undefined',
            window_totalQuestions: typeof window !== 'undefined' ? window.totalQuestions : 'undefined'
        });
        
        // حساب الوقت المستغرق
        const elapsedTime = getElapsedTime();
        const durationMinutes = Math.floor(elapsedTime / 60);
        
        // تحديد إذا كانت جميع الأسئلة تم حلها (اللعبة انتهت)
        // إذا كان currentQuestionNumber > totalQuestions، يعني أنه حل جميع الأسئلة
        const allQuestionsAnswered = currentQuestionNumber > currentTotalQuestions;
        
        console.log('🔍 [task_timer] Checking allQuestionsAnswered:', {
            currentQuestionNumber: currentQuestionNumber,
            currentTotalQuestions: currentTotalQuestions,
            comparison: `${currentQuestionNumber} > ${currentTotalQuestions}`,
            result: allQuestionsAnswered,
            window_currentQuestionNumber: typeof window !== 'undefined' ? window.currentQuestionNumber : 'undefined',
            window_totalQuestions: typeof window !== 'undefined' ? window.totalQuestions : 'undefined'
        });
        
        console.log('Sending completion data:', {
            child_id: parseInt(childId),
            task_id: parseInt(taskId),
            session_id: sessionId ? parseInt(sessionId) : null,
            duration: durationMinutes,
            completed_percentage: finalCompletedPercentage,
            score: currentScore,
            correctAnswers: currentCorrectAnswers,
            totalQuestions: currentTotalQuestions,
            currentQuestionNumber: currentQuestionNumber,
            allQuestionsAnswered: allQuestionsAnswered,
            calculationMethod: 'based on correct answers only'
        });
        
        // إرسال طلب إكمال المهمة
        const response = await fetch('../api/complete_task.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                child_id: parseInt(childId),
                task_id: parseInt(taskId),
                session_id: sessionId ? parseInt(sessionId) : null,
                duration: durationMinutes,
                completed_percentage: finalCompletedPercentage,
                all_questions_answered: allQuestionsAnswered
            })
        });
        
        const result = await response.json();
        console.log('📥 Complete task response:', result);
        
        if (result.success) {
            console.log('✅ تم حفظ النقاط بنجاح!', {
                stars: result.stars,
                total_stars: result.total_stars,
                badges: result.badges?.length || 0,
                title: result.title
            });
            // إرجاع النتيجة لاستخدامها في عرض البادجز
            return result;
        } else {
            console.error('❌ خطأ في حفظ النقاط:', result.message);
            alert('⚠️ خطأ في حفظ النتائج: ' + (result.message || 'خطأ غير معروف'));
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error('❌ خطأ في حفظ النقاط:', error);
        alert('⚠️ خطأ في الاتصال بالخادم: ' + error.message);
        return { success: false, message: error.message };
    }
}

// جعل الدالة متاحة بشكل عام
window.saveScoreAndComplete = saveScoreAndComplete;

// دالة مشتركة لعرض البادجز (يمكن استخدامها من جميع الألعاب)
window.displayEarnedBadges = function(badges) {
    const badgesSection = document.getElementById('badgesEarnedSection');
    const badgesGrid = document.getElementById('badgesEarnedGrid');
    
    if (!badgesSection || !badgesGrid) {
        console.warn('⚠️ [task_timer] Badges section not found in HTML');
        return;
    }
    
    if (!badges || badges.length === 0) {
        badgesSection.style.display = 'none';
        return;
    }
    
    badgesSection.style.display = 'block';
    badgesGrid.innerHTML = '';
    
    badges.forEach(badge => {
        const badgeCard = document.createElement('div');
        badgeCard.className = 'badge-earned-card';
        const colorCode = badge.color_code || '#f59e0b';
        badgeCard.style.background = `linear-gradient(135deg, ${colorCode} 0%, ${window.adjustBadgeColor ? window.adjustBadgeColor(colorCode) : colorCode} 100%)`;
        
        badgeCard.innerHTML = `
            <div class="badge-earned-icon">${badge.badge_icon || '🏆'}</div>
            <div class="badge-earned-name">${badge.badge_name_ar || badge.badge_name}</div>
            ${badge.level ? `<div class="badge-earned-level">المستوى ${badge.level}</div>` : ''}
        `;
        
        badgesGrid.appendChild(badgeCard);
    });
};

// دالة مشتركة لتعديل لون البادج
window.adjustBadgeColor = function(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const darkerR = Math.max(0, r - 30);
    const darkerG = Math.max(0, g - 30);
    const darkerB = Math.max(0, b - 30);
    
    return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
};

// دالة مشتركة لتحديث الأيقونة والرسالة حسب النقاط
window.updateResultIconAndMessage = function(score) {
    const iconElement = document.getElementById('resultIcon');
    const messageElement = document.getElementById('resultMessage');
    
    if (!iconElement || !messageElement) {
        console.warn('⚠️ [task_timer] Result elements not found');
        return;
    }
    
    if (score >= 90 && score <= 100) {
        iconElement.textContent = '🏆';
        messageElement.textContent = 'ممتاز!';
    } else if (score >= 60 && score < 90) {
        iconElement.textContent = '🥇';
        messageElement.textContent = 'رائع جداً!';
    } else if (score >= 30 && score < 60) {
        iconElement.textContent = '🥈';
        messageElement.textContent = 'جيد جداً!';
    } else if (score >= 10 && score < 30) {
        iconElement.textContent = '⭐';
        messageElement.textContent = 'حاول مرة أخرى!';
    } else {
        iconElement.textContent = '👍';
        messageElement.textContent = 'استمر في المحاولة!';
    }
};

