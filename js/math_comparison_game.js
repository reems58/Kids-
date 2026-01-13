// لعبة المقارنة (أكبر من/أصغر من/يساوي)
let currentQuestion = null;
let score = 0;
let correctAnswers = 0;
let currentQuestionNumber = 1;
let totalQuestions = 10;
let questions = [];
let playerAge = 7; // العمر الافتراضي
let gameDifficulty = {
    maxNumber: 20,
    allowEqual: false
};
let isNavigatingAway = false; // لتخطي beforeunload عند الرجوع المقصود
let hasStartedGame = false;

// بدء اللعبة
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على العمر من URL
    const urlParams = new URLSearchParams(window.location.search);
    const ageParam = urlParams.get('age');
    const childIdParam = urlParams.get('child_id');
    const sessionIdParam = urlParams.get('session_id');
    
    // حفظ session_id في sessionStorage إذا كان موجوداً في URL
    if (sessionIdParam) {
        sessionStorage.setItem('current_session_id', sessionIdParam);
        console.log('✅ تم حفظ session_id من URL:', sessionIdParam);
    }
    
    // تهيئة زر الرجوع في المتصفح (سهم الرجوع عند الـ URL)
    try {
        window.history.pushState({ page: 'math_comparison_game' }, '', window.location.href);
        window.addEventListener('popstate', function() {
            if (typeof goBack === 'function') {
                goBack(true); // true تعني أنه جاء من زر المتصفح
            }
        });
    } catch (e) {
        console.error('خطأ في تهيئة سلوك زر الرجوع:', e);
    }
    
    if (ageParam) {
        playerAge = parseInt(ageParam);
    }
    // حفظ child_id إذا وجد
    if (childIdParam) {
        sessionStorage.setItem('current_child_id', childIdParam);
    }
    
    // تحديد الصعوبة بناءً على العمر
    setDifficultyByAge(playerAge);
    
    // تحديث العنوان
    updateGameTitle();
    
    startNewGame();
    
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
        // أعمار 4-5: أرقام صغيرة جداً (1-10)، أكبر من فقط
        gameDifficulty.maxNumber = 10;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowEqual = false;
    } else if (age >= 6 && age <= 7) {
        // أعمار 6-7: أرقام متوسطة (1-20)، أكبر من وأصغر من
        gameDifficulty.maxNumber = 20;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowEqual = false;
    } else if (age >= 8 && age <= 9) {
        // أعمار 8-9: أرقام أكبر (1-50)، جميع العمليات
        gameDifficulty.maxNumber = 50;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowEqual = true;
    } else if (age >= 10 && age <= 12) {
        // أعمار 10-12: أرقام كبيرة (1-100)، جميع العمليات
        gameDifficulty.maxNumber = 100;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowEqual = true;
    } else {
        // افتراضي
        gameDifficulty.maxNumber = 20;
        gameDifficulty.minNumber = 1;
        gameDifficulty.allowEqual = false;
    }
}

// تحديث عنوان اللعبة
function updateGameTitle() {
    const titleElement = document.querySelector('.game-header h1');
    if (titleElement) {
        titleElement.textContent = `🎮 لعبة المقارنة - عمر ${playerAge} سنوات`;
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
        
        // حساب نسبة الإكمال بناءً على عدد الأسئلة التي تم حلها فعلياً
        // currentQuestionNumber - 1 = عدد الأسئلة التي تم حلها (لأن currentQuestionNumber يبدأ من 1)
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
    const allowEqual = gameDifficulty.allowEqual;
    
    for (let i = 0; i < totalQuestions; i++) {
        let num1, num2, correctAnswer, questionText;
        
        // 70% أسئلة أكبر من/أصغر من، 30% يساوي (إذا كان مسموحاً)
        const useEqual = allowEqual && Math.random() < 0.3;
        
        if (useEqual) {
            // سؤال يساوي
            num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            num2 = num1; // نفس الرقم
            correctAnswer = 'equal';
            questionText = 'أيهما يساوي الآخر؟';
        } else {
            // سؤال أكبر من أو أصغر من
            num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            
            // التأكد من أن الرقمين مختلفين
            while (num1 === num2) {
                num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            }
            
            // اختيار عشوائي بين سؤال "أيهما أكبر؟" و "أيهما أصغر؟"
            const askGreater = Math.random() > 0.5;
            
            if (askGreater) {
                // سؤال "أيهما أكبر؟"
                questionText = 'أيهما أكبر؟';
                if (num1 > num2) {
                    correctAnswer = 'right'; // اليمين (num1) أكبر
                } else {
                    correctAnswer = 'left'; // اليسار (num2) أكبر
                }
            } else {
                // سؤال "أيهما أصغر؟"
                questionText = 'أيهما أصغر؟';
                if (num1 < num2) {
                    correctAnswer = 'right'; // اليمين (num1) أصغر
                } else {
                    correctAnswer = 'left'; // اليسار (num2) أصغر
                }
            }
        }
        
        questions.push({
            num1: num1,
            num2: num2,
            correctAnswer: correctAnswer,
            questionText: questionText
        });
    }
}

// عرض السؤال التالي
function showNextQuestion() {
    if (currentQuestionNumber > totalQuestions) {
        endGame();
        return;
    }
    
    currentQuestion = questions[currentQuestionNumber - 1];
    
    // تحديث الأرقام (num1 على اليمين، num2 على اليسار)
    // في RTL: العنصر الأول يظهر على اليمين، العنصر الثاني على اليسار
    document.getElementById('number1').textContent = currentQuestion.num1; // num1 على اليمين
    document.getElementById('number2').textContent = currentQuestion.num2; // num2 على اليسار
    document.getElementById('questionText').textContent = currentQuestion.questionText;
    
    // تحديث الأزرار
    updateAnswerButtons();
    
    // مسح التعليقات
    const feedback = document.getElementById('feedback');
    feedback.textContent = '';
    feedback.className = 'feedback empty';
    
    // تحديث شريط التقدم
    const progress = (currentQuestionNumber / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// تحديث أزرار الإجابة
function updateAnswerButtons() {
    const buttonsContainer = document.getElementById('answerButtons');
    const allowEqual = gameDifficulty.allowEqual;
    
    buttonsContainer.innerHTML = '';
    
    // num1 على اليمين، num2 على اليسار
    // في RTL: العنصر الأول في الكود يظهر على اليمين، العنصر الثاني على اليسار
    
    // زر num1 (اليمين) - نضيفه أولاً ليظهر على اليمين في RTL
    const rightBtn = document.createElement('button');
    rightBtn.className = 'answer-btn right';
    rightBtn.textContent = playerAge <= 5 ? 'اليمين' : currentQuestion.num1;
    rightBtn.onclick = () => checkAnswer('right');
    
    // زر يساوي (فقط إذا كان مسموحاً)
    let equalBtn = null;
    if (allowEqual) {
        equalBtn = document.createElement('button');
        equalBtn.className = 'answer-btn equal';
        equalBtn.textContent = '=';
        equalBtn.onclick = () => checkAnswer('equal');
    }
    
    // زر num2 (اليسار) - نضيفه آخراً ليظهر على اليسار في RTL
    const leftBtn = document.createElement('button');
    leftBtn.className = 'answer-btn left';
    leftBtn.textContent = playerAge <= 5 ? 'اليسار' : currentQuestion.num2;
    leftBtn.onclick = () => checkAnswer('left');
    
    // إضافة الأزرار بالترتيب الصحيح لـ RTL
    // في RTL: أول عنصر في الكود يظهر على اليمين، آخر عنصر يظهر على اليسار
    buttonsContainer.appendChild(rightBtn); // num1 على اليمين (أول عنصر في RTL)
    if (equalBtn) {
        buttonsContainer.appendChild(equalBtn);
    }
    buttonsContainer.appendChild(leftBtn); // num2 على اليسار (آخر عنصر في RTL)
}

// فحص الإجابة
function checkAnswer(userAnswer) {
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.answer-btn');
    
    console.log(`[DEBUG] الإجابة المختارة: ${userAnswer}, الإجابة الصحيحة: ${currentQuestion.correctAnswer}, num1=${currentQuestion.num1}, num2=${currentQuestion.num2}, السؤال: ${currentQuestion.questionText}`);
    
    // تعطيل جميع الأزرار
    buttons.forEach(btn => {
        btn.classList.add('disabled');
    });
    
    if (userAnswer === currentQuestion.correctAnswer) {
        // إجابة صحيحة
        correctAnswers++;
        score += 10;
        // تحديث window للمتغيرات
        window.score = score;
        window.correctAnswers = correctAnswers;
        feedback.textContent = '🎉 ممتاز! إجابة صحيحة';
        feedback.className = 'feedback correct';
        
        playSound('success');
    } else {
        // إجابة خاطئة
        let correctText = '';
        const questionText = currentQuestion.questionText;
        
        if (currentQuestion.correctAnswer === 'right') {
            // right = num1 (اليمين)
            if (questionText === 'أيهما أكبر؟') {
                correctText = playerAge <= 5 ? 'اليمين أكبر' : `الرقم ${currentQuestion.num1} أكبر`;
            } else {
                correctText = playerAge <= 5 ? 'اليمين أصغر' : `الرقم ${currentQuestion.num1} أصغر`;
            }
        } else if (currentQuestion.correctAnswer === 'left') {
            // left = num2 (اليسار)
            if (questionText === 'أيهما أكبر؟') {
                correctText = playerAge <= 5 ? 'اليسار أكبر' : `الرقم ${currentQuestion.num2} أكبر`;
            } else {
                correctText = playerAge <= 5 ? 'اليسار أصغر' : `الرقم ${currentQuestion.num2} أصغر`;
            }
        } else {
            correctText = 'الرقمان متساويان';
        }
        
        feedback.textContent = `❌ خطأ! ${correctText}`;
        feedback.className = 'feedback incorrect';
        
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
    console.log('🎮 endGame called (math_comparison_game)', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        window_currentQuestionNumber: typeof window !== 'undefined' ? window.currentQuestionNumber : 'undefined',
        window_totalQuestions: typeof window !== 'undefined' ? window.totalQuestions : 'undefined',
        window_correctAnswers: typeof window !== 'undefined' ? window.correctAnswers : 'undefined'
    });
    
    // التأكد من تحديث window.currentQuestionNumber قبل حفظ النتائج
    window.currentQuestionNumber = currentQuestionNumber;
    window.totalQuestions = totalQuestions;
    window.correctAnswers = correctAnswers;
    
    // تحديد أن اللعبة انتهت (لتجنب حفظ متوقف عند إغلاق النافذة)
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
    
    // تحديث الأيقونة والرسالة حسب النقاط
    if (typeof window.updateResultIconAndMessage === 'function') {
        window.updateResultIconAndMessage(score);
    }
    
    // عرض البادجز المكتسبة
    if (typeof window.displayEarnedBadges === 'function') {
        window.displayEarnedBadges(earnedBadges);
    }
    
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
    if (type === 'success') {
        console.log('Success sound');
    } else if (type === 'error') {
        console.log('Error sound');
    }
}

// العودة للصفحة السابقة
async function goBack(fromBrowserBack = false) {
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
        // استخدام replace حتى لا يعود زر الرجوع إلى صفحة اللعبة
        window.location.replace(`child_view.html?child_id=${childId}`);
    } else if (!fromBrowserBack && window.history.length > 1) {
        window.history.back();
    } else {
        window.location.replace('parent_dashboard.html');
    }
}

// رجوع مع تأكيد (لزر الرجوع في الأعلى أثناء اللعبة)
async function goBackWithConfirm() {
    // التحقق من حالة اللعبة
    const gameOverScreen = document.getElementById('gameOverScreen');
    const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
    
    // إذا انتهت اللعبة (كل الأسئلة تم حلها)، احفظ النتيجة مباشرة بدون رسالة
    if (isGameOverVisible) {
        console.log('✅ اللعبة انتهت - حفظ النتيجة والعودة مباشرة');
        // النتيجة محفوظة مسبقاً في endGame()، فقط نرجع
        isNavigatingAway = true;
        goBack();
        return;
    }
    
    // إذا لم تنته اللعبة، اطلب التأكيد
    const confirmed = confirm('هل أنت متأكد؟ سيتم فقدان التقدم.');
    if (!confirmed) return;

    // حفظ التقدم الحالي كمهمة متوقفة
    if (hasStartedGame) {
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

