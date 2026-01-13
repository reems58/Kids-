// لعبة الجمع والطرح
let currentQuestion = null;
let score = 0;
let correctAnswers = 0;
let currentQuestionNumber = 1;
let totalQuestions = 10;
let questions = [];
let playerAge = 7; // العمر الافتراضي
let gameDifficulty = {
    maxNumber: 10,
    allowSubtraction: true
};
let isNavigatingAway = false; // لتخطي beforeunload عند الرجوع المقصود
let hasStartedGame = false;

// بدء اللعبة
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على العمر من URL
    const urlParams = new URLSearchParams(window.location.search);
    const ageParam = urlParams.get('age');
    const sessionIdParam = urlParams.get('session_id');
    
    // حفظ session_id في sessionStorage إذا كان موجوداً في URL
    if (sessionIdParam) {
        sessionStorage.setItem('current_session_id', sessionIdParam);
        console.log('✅ تم حفظ session_id من URL:', sessionIdParam);
    }
    
    if (ageParam) {
        playerAge = parseInt(ageParam);
    }
    
    // تحديد الصعوبة بناءً على العمر
    setDifficultyByAge(playerAge);
    
    // تحديث العنوان
    updateGameTitle();
    
    startNewGame();
    
    // السماح بالإدخال عند الضغط على Enter
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                checkAnswerFromInput();
            }
        });
    }
    
    // إضافة event listener لحفظ الجلسة عند إغلاق النافذة
    window.addEventListener('beforeunload', function(e) {
        // إذا كنا نغادر بشكل مقصود، لا نحفظ
        if (isNavigatingAway) return;
        
        // إذا لم تبدأ اللعبة أو شاشة النهاية ظاهرة، لا نحفظ
        const gameOverScreen = document.getElementById('gameOverScreen');
        const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
        if (isGameOverVisible || !hasStartedGame) return;
        
        console.log('⚠️ beforeunload triggered: saving as paused');
        // حفظ كمهمة متوقفة بشكل غير متزامن
        savePausedSession();
    });
});

// تحديد الصعوبة بناءً على العمر
function setDifficultyByAge(age) {
    if (age >= 4 && age <= 5) {
        // أعمار 4-5: أرقام صغيرة جداً (1-5 للجمع فقط)
        gameDifficulty.maxNumber = 5;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowSubtraction = false; // جمع فقط
        gameDifficulty.maxSum = 10; // الحد الأقصى لمجموع الجمع
    } else if (age >= 6 && age <= 7) {
        // أعمار 6-7: أرقام متوسطة (1-10 للجمع، 1-20 للطرح)
        gameDifficulty.maxNumber = 10;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowSubtraction = true;
        gameDifficulty.maxSum = 20;
        gameDifficulty.maxSubtract = 20; // الحد الأقصى للطرح
    } else if (age >= 8 && age <= 9) {
        // أعمار 8-9: أرقام أكبر (1-20 للجمع، 1-50 للطرح)
        gameDifficulty.maxNumber = 20;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowSubtraction = true;
        gameDifficulty.maxSum = 50;
        gameDifficulty.maxSubtract = 50;
    } else if (age >= 10 && age <= 12) {
        // أعمار 10-12: أرقام كبيرة (1-50 للجمع، 1-100 للطرح)
        gameDifficulty.maxNumber = 50;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowSubtraction = true;
        gameDifficulty.maxSum = 100;
        gameDifficulty.maxSubtract = 100;
    } else {
        // افتراضي (للأعمار غير المحددة)
        gameDifficulty.maxNumber = 10;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowSubtraction = true;
        gameDifficulty.maxSum = 20;
        gameDifficulty.maxSubtract = 20;
    }
}

// تحديث عنوان اللعبة
function updateGameTitle() {
    const titleElement = document.querySelector('.game-header h1');
    if (titleElement) {
        titleElement.textContent = `🎮 لعبة الجمع والطرح - عمر ${playerAge} سنوات`;
    }
}

// حفظ الجلسة كمتوقفة
async function savePausedSession() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
        const taskId = urlParams.get('task_id') || sessionStorage.getItem('current_task_id');
        const sessionId = urlParams.get('session_id') || sessionStorage.getItem('current_session_id');
        
        if (!childId || !taskId) {
            console.warn('⚠️ لا توجد معرفات كافية للحفظ كمتوقف', { childId, taskId, sessionId });
            return;
        }

        // حساب نسبة الإكمال والمدة
        const currentCorrect = correctAnswers;
        const totalQ = totalQuestions;
        const currentQNum = typeof currentQuestionNumber !== 'undefined' ? currentQuestionNumber : 1;
        
        // حساب نسبة الإكمال بناءً على عدد الإجابات الصحيحة
        // النسبة = (عدد الإجابات الصحيحة / إجمالي الأسئلة) × 100
        const completedPercentage = totalQ > 0 ? Math.round((currentCorrect / totalQ) * 100) : 0;
        const elapsedSeconds = (typeof getElapsedTime === 'function') ? getElapsedTime() : 0;
        const durationMinutes = Math.max(1, Math.floor(elapsedSeconds / 60)); // على الأقل دقيقة واحدة

        const payload = {
            child_id: parseInt(childId),
            task_id: parseInt(taskId),
            session_id: sessionId ? parseInt(sessionId) : null,
            duration: durationMinutes,
            completed_percentage: completedPercentage
        };

        const json = JSON.stringify(payload);
        
        // محاولة استخدام sendBeacon للحفظ سريعاً (يعمل حتى عند إغلاق النافذة)
        if (navigator.sendBeacon) {
            const blob = new Blob([json], { type: 'application/json' });
            const ok = navigator.sendBeacon('../api/complete_task.php', blob);
            console.log('📡 sendBeacon paused session', ok, payload);
            return;
        }
        
        // بديل fetch مع keepalive
        await fetch('../api/complete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
            keepalive: true
        });
        console.log('✅ fetch keepalive paused session', payload);
    } catch (e) {
        console.error('❌ حفظ متوقف فشل:', e);
    }
}

// بدء لعبة جديدة
function startNewGame() {
    score = 0;
    correctAnswers = 0;
    currentQuestionNumber = 1;
    questions = [];
    hasStartedGame = true;
    isNavigatingAway = false;
    
    // جعل المتغيرات متاحة في window لاستخدامها من task_timer.js
    window.score = score;
    window.correctAnswers = correctAnswers;
    window.totalQuestions = totalQuestions;
    window.currentQuestionNumber = currentQuestionNumber;
    
    // إخفاء شاشة النهاية وإظهار شاشة اللعب
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // تحديث الإحصائيات
    updateStats();
    
    // إنشاء الأسئلة
    generateQuestions();
    
    // عرض السؤال الأول
    showNextQuestion();
}

// إنشاء الأسئلة
function generateQuestions() {
    questions = [];
    const maxNum = gameDifficulty.maxNumber;
    const minNum = gameDifficulty.minNumber;
    const allowSubtraction = gameDifficulty.allowSubtraction;
    const maxSum = gameDifficulty.maxSum || maxNum * 2;
    const maxSubtract = gameDifficulty.maxSubtract || maxNum * 2;
    
    for (let i = 0; i < totalQuestions; i++) {
        const isAddition = !allowSubtraction || Math.random() > 0.5; // جمع أو طرح حسب الصعوبة
        
        let num1, num2, answer;
        
        if (isAddition) {
            // سؤال جمع
            if (playerAge <= 5) {
                // للأطفال الصغار (4-5): أرقام صغيرة جداً (1-5) ومجموع لا يتجاوز 10
                num1 = Math.floor(Math.random() * 5) + 1;
                const maxNum2 = Math.min(5, maxSum - num1);
                num2 = Math.floor(Math.random() * maxNum2) + 1;
                answer = num1 + num2;
                // التأكد من أن النتيجة لا تتجاوز maxSum
                if (answer > maxSum) {
                    num2 = maxSum - num1;
                    if (num2 < 1) num2 = 1;
                    answer = num1 + num2;
                }
            } else if (playerAge <= 7) {
                // للأطفال (6-7): أرقام (1-10) ومجموع لا يتجاوز 20
                num1 = Math.floor(Math.random() * 10) + 1;
                const maxNum2 = Math.min(10, maxSum - num1);
                num2 = Math.floor(Math.random() * maxNum2) + 1;
                answer = num1 + num2;
            } else if (playerAge <= 9) {
                // للأطفال (8-9): أرقام (1-20) ومجموع لا يتجاوز 50
                num1 = Math.floor(Math.random() * 20) + 1;
                const maxNum2 = Math.min(20, maxSum - num1);
                num2 = Math.floor(Math.random() * maxNum2) + 1;
                answer = num1 + num2;
            } else {
                // للأطفال (10-12): أرقام (1-50) ومجموع لا يتجاوز 100
                num1 = Math.floor(Math.random() * 50) + 1;
                const maxNum2 = Math.min(50, maxSum - num1);
                num2 = Math.floor(Math.random() * maxNum2) + 1;
                answer = num1 + num2;
            }
            
            questions.push({
                num1: num1,
                num2: num2,
                operation: '+',
                answer: answer,
                questionText: `${num1} + ${num2} = ?`
            });
        } else {
            // سؤال طرح (نتيجة إيجابية دائماً)
            if (playerAge <= 7) {
                // للأطفال (6-7): طرح بسيط (1-20)
                num1 = Math.floor(Math.random() * (maxSubtract - 5)) + 6;
                num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
                answer = num1 - num2;
                // التأكد من أن النتيجة إيجابية
                if (answer < 0) {
                    num2 = num1 - 1;
                    answer = 1;
                }
            } else if (playerAge <= 9) {
                // للأطفال (8-9): طرح متوسط (1-50)
                num1 = Math.floor(Math.random() * (maxSubtract - 10)) + 11;
                num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
                answer = num1 - num2;
            } else {
                // للأطفال (10-12): طرح كبير (1-100)
                num1 = Math.floor(Math.random() * (maxSubtract - 20)) + 21;
                num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
                answer = num1 - num2;
            }
            
            questions.push({
                num1: num1,
                num2: num2,
                operation: '-',
                answer: answer,
                questionText: `${num1} - ${num2} = ?`
            });
        }
    }
}

// عرض السؤال التالي
function showNextQuestion() {
    if (currentQuestionNumber > totalQuestions) {
        endGame();
        return;
    }
    
    currentQuestion = questions[currentQuestionNumber - 1];
    
    // تحديث النص
    document.getElementById('questionText').textContent = currentQuestion.questionText;
    document.getElementById('questionOperation').textContent = 
        currentQuestion.operation === '+' ? 'جمع' : 'طرح';
    
    // تفعيل حقل الإدخال ومسحه
    const input = document.getElementById('answerInput');
    if (input) {
        input.value = '';
        input.disabled = false;
        input.focus();
    }
    
    // مسح التعليقات
    const feedback = document.getElementById('feedback');
    feedback.textContent = '';
    feedback.className = 'feedback empty';
    
    // تحديث شريط التقدم
    const progress = (currentQuestionNumber / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// عرض خيارات الإجابة

// فحص الإجابة من حقل الإدخال
function checkAnswerFromInput() {
    const input = document.getElementById('answerInput');
    const userAnswer = parseInt(input.value);
    const feedback = document.getElementById('feedback');
    
    if (isNaN(userAnswer)) {
        feedback.textContent = '⚠️ الرجاء إدخال رقم صحيح';
        feedback.className = 'feedback incorrect';
        return;
    }
    
    // تعطيل حقل الإدخال
    if (input) {
        input.disabled = true;
    }
    
    if (userAnswer === currentQuestion.answer) {
        // إجابة صحيحة
        correctAnswers++;
        score += 10;
        // تحديث window للمتغيرات
        window.score = score;
        window.correctAnswers = correctAnswers;
        feedback.textContent = '🎉 ممتاز! إجابة صحيحة';
        feedback.className = 'feedback correct';
        
        // صوت نجاح (اختياري)
        playSound('success');
    } else {
        // إجابة خاطئة
        feedback.textContent = `❌ خطأ! الإجابة الصحيحة هي: ${currentQuestion.answer}`;
        feedback.className = 'feedback incorrect';
        
        // صوت خطأ (اختياري)
        playSound('error');
    }
    
    // تحديث الإحصائيات
    updateStats();
    
    // الانتقال للسؤال التالي بعد ثانيتين
    setTimeout(() => {
        currentQuestionNumber++;
        // تحديث window.currentQuestionNumber
        window.currentQuestionNumber = currentQuestionNumber;
        showNextQuestion();
    }, 2000);
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('questionNumber').textContent = `${currentQuestionNumber} / ${totalQuestions}`;
    document.getElementById('correctAnswers').textContent = correctAnswers;
}

// إنهاء اللعبة
async function endGame() {
    console.log('🎮 endGame called (math_game)', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers
    });
    
    // التأكد من تحديث window.currentQuestionNumber قبل حفظ النتائج
    window.currentQuestionNumber = currentQuestionNumber;
    window.totalQuestions = totalQuestions;
    window.correctAnswers = correctAnswers;
    
    // تحديد أننا نغادر بشكل مقصود
    isNavigatingAway = true;
    
    // إيقاف مؤقت المهمة
    if (typeof stopTaskTimer === 'function') {
        stopTaskTimer();
    }
    
    // حفظ النتائج في قاعدة البيانات
    let earnedBadges = [];
    console.log('💾 محاولة حفظ النتائج...', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        allQuestionsAnswered: currentQuestionNumber > totalQuestions
    });
    if (typeof saveScoreAndComplete === 'function') {
        try {
            const result = await saveScoreAndComplete();
            console.log('📊 نتيجة حفظ النتائج:', result);
            if (result && result.success) {
                console.log('✅ تم حفظ النتائج بنجاح!');
                if (result.badges) {
                    earnedBadges = result.badges;
                    console.log('🏆 البادجز المكتسبة:', earnedBadges);
                }
            } else {
                console.error('❌ فشل حفظ النتائج:', result ? result.message : 'لا توجد نتيجة');
            }
        } catch (error) {
            console.error('❌ خطأ في حفظ النتائج:', error);
        }
    }
    
    // إخفاء شاشة اللعب وإظهار شاشة النهاية
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    
    // تحديث الإحصائيات النهائية
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCorrect').textContent = `${correctAnswers} / ${totalQuestions}`;
    
    // تحديث الأيقونة والرسالة حسب النقاط
    if (typeof window.updateResultIconAndMessage === 'function') {
        window.updateResultIconAndMessage(score);
    }
    
    // عرض البادجز المكتسبة
    if (typeof window.displayEarnedBadges === 'function') {
        window.displayEarnedBadges(earnedBadges);
    }
}

// تشغيل صوت
function playSound(type) {
    // يمكن إضافة أصوات هنا لاحقاً
    if (type === 'success') {
        // صوت نجاح
        console.log('Success sound');
    } else if (type === 'error') {
        // صوت خطأ
        console.log('Error sound');
    }
}

// العودة للصفحة السابقة
async function goBack() {
    // تحديد أننا نغادر بشكل مقصود
    isNavigatingAway = true;
    
    // حفظ الجلسة كمتوقفة قبل الرجوع
    if (hasStartedGame) {
        console.log('💾 حفظ الجلسة كمتوقفة قبل الرجوع...');
        await savePausedSession();
    }
    
    // الحصول على child_id من URL أو sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const childId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
    
    // حفظ child_id في sessionStorage إذا كان موجوداً في URL
    if (urlParams.get('child_id')) {
        sessionStorage.setItem('current_child_id', urlParams.get('child_id'));
    }
    
    // العودة إلى صفحة الطفل مع child_id
    if (childId) {
        window.location.href = `child_view.html?child_id=${childId}`;
    } else if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'parent_dashboard.html';
    }
}

// رجوع مع تأكيد (لزر الرجوع في الأعلى أثناء اللعبة)
async function goBackWithConfirm() {
    // دائماً اطلب التأكيد قبل الخروج
    const confirmed = confirm('هل أنت متأكد؟ سيتم فقدان التقدم.');
    if (!confirmed) return;

    // حفظ التقدم الحالي كمهمة متوقفة إذا لم تنته اللعبة
    const gameOverScreen = document.getElementById('gameOverScreen');
    const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
    
    if (!isGameOverVisible && hasStartedGame) {
        try {
            await savePausedSession();
            console.log('✅ تم حفظ المهمة كمتوقفة من زر الرجوع الداخلي');
        } catch (e) {
            console.error('❌ خطأ في حفظ حالة المهمة من زر الرجوع:', e);
        }
    }

    // العودة لصفحة الطفل
    goBack();
}

// ربط الدوال في النطاق العام
window.goBackWithConfirm = goBackWithConfirm;

