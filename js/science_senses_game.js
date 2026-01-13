// لعبة الحواس الخمسة
let currentQuestion = null;
let score = 0;
let correctAnswers = 0;
let currentQuestionNumber = 1;
let totalQuestions = 10;
let questions = [];
let playerAge = 7; // العمر الافتراضي
let gameDifficulty = {
    mode: 'simple', // 'simple' للأعمار الصغيرة، 'detailed' للأعمار الكبيرة
    optionsCount: 3
};
let gameTimer = 0; // الوقت بالثواني
let timerInterval = null;
let isHandlingBack = false; // لتجنب معالجة متعددة لحدث الرجوع
let hasStartedGame = false; // لتحديد ما إذا كانت اللعبة بدأت
let isNavigatingAway = false; // لتخطي beforeunload عند الرجوع المقصود

// حفظ المهمة كـ "متوقفة" عند الخروج المفاجئ
async function savePausedSession() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
        const taskId = urlParams.get('task_id') || sessionStorage.getItem('current_task_id');
        // قراءة session_id من URL أولاً، ثم من sessionStorage
        const sessionId = urlParams.get('session_id') || sessionStorage.getItem('current_session_id');
        if (!childId || !taskId) {
            console.warn('⚠️ لا توجد معرفات كافية للحفظ كمتوقف', { childId, taskId, sessionId });
            return;
        }

        // حساب نسبة الإكمال والمدة
        const currentScore = typeof score !== 'undefined' ? score : 0;
        const currentCorrect = typeof correctAnswers !== 'undefined' ? correctAnswers : 0;
        const totalQ = typeof totalQuestions !== 'undefined' ? totalQuestions : 10;
        const currentQNum = typeof currentQuestionNumber !== 'undefined' ? currentQuestionNumber : 1;
        
        // حساب نسبة الإكمال بناءً على عدد الأسئلة التي تم حلها فعلياً
        // currentQuestionNumber - 1 = عدد الأسئلة التي تم حلها (لأن currentQuestionNumber يبدأ من 1)
        // حساب نسبة الإكمال بناءً على عدد الإجابات الصحيحة
        // النسبة = (عدد الإجابات الصحيحة / إجمالي الأسئلة) × 100
        const completedPercentage = totalQ > 0 ? Math.round((currentCorrect / totalQ) * 100) : 0;
        const elapsedSeconds = (typeof getElapsedTime === 'function') ? getElapsedTime() : 0;
        const durationMinutes = Math.floor(elapsedSeconds / 60);

        const payload = {
            child_id: parseInt(childId),
            task_id: parseInt(taskId),
            session_id: sessionId ? parseInt(sessionId) : null,
            duration: durationMinutes,
            completed_percentage: completedPercentage
        };

        const json = JSON.stringify(payload);
        // محاولة استخدام sendBeacon للحفظ سريعاً
        if (navigator.sendBeacon) {
            const blob = new Blob([json], { type: 'application/json' });
            const ok = navigator.sendBeacon('../api/complete_task.php', blob);
            console.log('📡 sendBeacon paused session', ok, payload);
            return;
        }
        // بديل fetch سريع
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

// قاعدة بيانات الحواس الخمسة
const sensesDatabase = {
    'البصر': {
        icon: '👁️',
        simple: [
            { action: 'رؤية الألوان', icon: '🌈' },
            { action: 'رؤية الصور', icon: '🖼️' },
            { action: 'رؤية الوجوه', icon: '😊' },
            { action: 'رؤية النجوم', icon: '⭐' },
            { action: 'رؤية القمر', icon: '🌙' }
        ],
        medium: [
            { action: 'قراءة الكتب', icon: '📚' },
            { action: 'مشاهدة التلفاز', icon: '📺' },
            { action: 'رؤية اللوحات الفنية', icon: '🎨' },
            { action: 'مراقبة الطيور', icon: '🦅' },
            { action: 'رؤية الخرائط', icon: '🗺️' }
        ],
        detailed: [
            { action: 'تمييز الأشكال والمسافات', icon: '📐' },
            { action: 'رؤية الألوان المتماثلة', icon: '🎨' },
            { action: 'القراءة في الإضاءة الخافتة', icon: '📖' },
            { action: 'مراقبة حركة الأجسام', icon: '👀' },
            { action: 'تمييز التفاصيل الدقيقة', icon: '🔍' },
            { action: 'رؤية الأبعاد الثلاثية', icon: '🎯' }
        ]
    },
    'السمع': {
        icon: '👂',
        simple: [
            { action: 'سماع الأغاني', icon: '🎵' },
            { action: 'سماع الأصوات', icon: '🔊' },
            { action: 'سماع النغمات', icon: '🎶' },
            { action: 'سماع الطيور', icon: '🐦' },
            { action: 'سماع الموسيقى', icon: '🎹' }
        ],
        medium: [
            { action: 'سماع المحادثات', icon: '💬' },
            { action: 'سماع أصوات الحيوانات', icon: '🐕' },
            { action: 'سماع المطر', icon: '🌧️' },
            { action: 'سماع الجرس', icon: '🔔' },
            { action: 'سماع الراديو', icon: '📻' }
        ],
        detailed: [
            { action: 'تمييز اتجاه الصوت', icon: '📻' },
            { action: 'سماع النغمات العالية والمنخفضة', icon: '🎼' },
            { action: 'تمييز الأصوات المتشابهة', icon: '🔔' },
            { action: 'سماع الأصوات البعيدة', icon: '📣' },
            { action: 'تمييز الإيقاع والنبض', icon: '🥁' },
            { action: 'سماع الأصوات في الضوضاء', icon: '🗣️' }
        ]
    },
    'الشم': {
        icon: '👃',
        simple: [
            { action: 'شم الورد', icon: '🌹' },
            { action: 'شم الطعام', icon: '🍕' },
            { action: 'شم الزهور', icon: '🌸' },
            { action: 'شم الكعك', icon: '🍰' },
            { action: 'شم القهوة', icon: '☕' }
        ],
        medium: [
            { action: 'شم العطور', icon: '💐' },
            { action: 'شم الخبز الطازج', icon: '🍞' },
            { action: 'شم الصابون', icon: '🧼' },
            { action: 'شم الفواكه', icon: '🍎' },
            { action: 'شم الشاي', icon: '🍵' }
        ],
        detailed: [
            { action: 'شم الروائح القوية', icon: '💨' },
            { action: 'تمييز الروائح المتشابهة', icon: '🌺' },
            { action: 'شم الطعام الفاسد', icon: '🚫' },
            { action: 'شم العطور المختلفة', icon: '💐' },
            { action: 'شم رائحة الحريق', icon: '🔥' },
            { action: 'تمييز روائح الفواكه المختلفة', icon: '🍓' }
        ]
    },
    'الذوق': {
        icon: '👅',
        simple: [
            { action: 'تذوق الحلوى', icon: '🍭' },
            { action: 'تذوق الفواكه', icon: '🍎' },
            { action: 'تذوق الآيس كريم', icon: '🍦' },
            { action: 'تذوق الخبز', icon: '🍞' },
            { action: 'تذوق الحليب', icon: '🥛' }
        ],
        medium: [
            { action: 'تذوق الأطباق المختلفة', icon: '🍽️' },
            { action: 'تمييز المذاقات (حلو/مالح)', icon: '🍬' },
            { action: 'تذوق العصائر', icon: '🧃' },
            { action: 'تذوق الشوكولاتة', icon: '🍫' },
            { action: 'تذوق الحساء', icon: '🍲' }
        ],
        detailed: [
            { action: 'تمييز المذاقات الأساسية (حلو/مالح/مر/حامض)', icon: '🍬' },
            { action: 'تذوق الأطباق المختلطة', icon: '🍽️' },
            { action: 'تمييز درجات الحلاوة', icon: '🍯' },
            { action: 'تذوق الطعام الساخن والبارد', icon: '🌶️' },
            { action: 'تمييز المذاقات المتشابهة', icon: '🥗' },
            { action: 'تذوق التوابل المختلفة', icon: '🧂' }
        ]
    },
    'اللمس': {
        icon: '✋',
        simple: [
            { action: 'لمس الماء', icon: '💧' },
            { action: 'لمس القطن', icon: '☁️' },
            { action: 'لمس الحجر', icon: '🪨' },
            { action: 'لمس الرمال', icon: '🏖️' },
            { action: 'لمس القماش', icon: '🧵' }
        ],
        medium: [
            { action: 'التمييز بين الساخن والبارد', icon: '🔥' },
            { action: 'لمس الأسطح المختلفة', icon: '🪑' },
            { action: 'لمس الحيوانات', icon: '🐾' },
            { action: 'لمس الأشياء الناعمة والخشنة', icon: '🧸' },
            { action: 'لمس الورق والمعادن', icon: '📄' }
        ],
        detailed: [
            { action: 'التمييز بين الحرارة والبرودة', icon: '🌡️' },
            { action: 'لمس الأسطح الخشنة والناعمة', icon: '🪵' },
            { action: 'تمييز الضغط والقوة', icon: '💪' },
            { action: 'لمس الأشياء الحادة والكروية', icon: '⚫' },
            { action: 'تمييز الملمس الجاف والرطب', icon: '💧' },
            { action: 'لمس الأشياء المتحركة والساكنة', icon: '⚙️' }
        ]
    }
};

// بدء اللعبة
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على العمر من URL
    const urlParams = new URLSearchParams(window.location.search);
    const ageParam = urlParams.get('age');
    const childIdParam = urlParams.get('child_id');
    const taskIdParam = urlParams.get('task_id');
    const sessionIdParam = urlParams.get('session_id');
    
    // حفظ session_id في sessionStorage إذا كان موجوداً في URL
    if (sessionIdParam) {
        sessionStorage.setItem('current_session_id', sessionIdParam);
        console.log('✅ تم حفظ session_id من URL:', sessionIdParam);
    }
    
    // إعداد سلوك زر الرجوع في المتصفح (سهم الرجوع عند الـ URL)
    try {
        // إضافة حالة في الـ history حتى نستطيع التقاط حدث الرجوع
        window.history.pushState({ page: 'science_senses_game' }, '', window.location.href);
        
        window.addEventListener('popstate', async function(event) {
            console.log('🔙 popstate event triggered', { isHandlingBack, hasStartedGame });
            
            if (isHandlingBack) return;
            isHandlingBack = true;
            
            // إذا كانت شاشة النهاية ظاهرة، نرجع بدون حفظ "متوقفة" (تم الحفظ مسبقاً)
            const gameOverScreen = document.getElementById('gameOverScreen');
            const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
            
            console.log('Game state:', { isGameOverVisible, hasStartedGame });
            
            // تأكيد الخروج دائماً
            const confirmLeave = confirm('هل أنت متأكد من الخروج من اللعبة؟ سيتم حفظ المهمة كـ "متوقفة" في صفحة الإنجازات.');
            if (!confirmLeave) {
                // إعادة الحالة للبقاء في نفس الصفحة
                window.history.pushState({ page: 'science_senses_game' }, '', window.location.href);
                isHandlingBack = false;
                return;
            }
            
            // حفظ التقدم الحالي كمهمة متوقفة (إن لم تنتهِ اللعبة)
            if (!isGameOverVisible && hasStartedGame) {
                await savePausedSession();
            }
            
            // في جميع الأحوال، نعود لصفحة الطفل
            if (typeof goBack === 'function') {
                isNavigatingAway = true;
                goBack();
            } else {
                // إذا لم تكن الدالة موجودة، نرجع يدوياً
                const urlParams = new URLSearchParams(window.location.search);
                let childId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
                if (childId) {
                    isNavigatingAway = true;
                    window.location.href = `child_view.html?child_id=${childId}`;
                } else {
                    isNavigatingAway = true;
                    window.location.href = 'parent_dashboard.html';
                }
            }
            
            isHandlingBack = false;
        });
    } catch (e) {
        console.error('خطأ في تهيئة سلوك زر الرجوع:', e);
    }
    
    if (ageParam) {
        playerAge = parseInt(ageParam);
    }
    
    // حفظ child_id في sessionStorage إذا كان موجوداً في URL
    if (childIdParam) {
        sessionStorage.setItem('current_child_id', childIdParam);
    }
    if (taskIdParam) {
        sessionStorage.setItem('current_task_id', taskIdParam);
    }
    
    // التقاط قبل الخروج من الصفحة (إغلاق/تحديث/رجوع)
    window.addEventListener('beforeunload', function(e) {
        // إذا كنا نغادر بشكل مقصود (goBack أو انتهاء اللعبة)، لا نظهر التنبيه
        if (isNavigatingAway) return;
        
        // إذا لم تبدأ اللعبة أو شاشة النهاية ظاهرة، لا نظهر التنبيه
        const gameOverScreen = document.getElementById('gameOverScreen');
        const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
        if (isGameOverVisible || !hasStartedGame) return;
        
        console.log('⚠️ beforeunload triggered: saving as paused');
        // حفظ كمهمة متوقفة بشكل غير متزامن (لن ننتظر النتيجة)
        savePausedSession();
        
        // إظهار تنبيه المتصفح الافتراضي
        e.preventDefault();
        e.returnValue = '';
        return '';
    });
    
    // تحديد الصعوبة بناءً على العمر
    setDifficultyByAge(playerAge);
    
    // تحديث العنوان
    updateGameTitle();
    
    startNewGame();
});

// تحديد الصعوبة بناءً على العمر
function setDifficultyByAge(age) {
    if (age >= 4 && age <= 6) {
        // أعمار 4-6: أسئلة بسيطة مع 2 خيارات
        gameDifficulty.mode = 'simple';
        gameDifficulty.optionsCount = 2;
    } else if (age === 7) {
        // عمر 7: أسئلة بسيطة مع 3 خيارات
        gameDifficulty.mode = 'simple';
        gameDifficulty.optionsCount = 3;
    } else if (age >= 8 && age <= 9) {
        // أعمار 8-9: أسئلة متوسطة مع 4 خيارات
        gameDifficulty.mode = 'medium';
        gameDifficulty.optionsCount = 4;
    } else if (age >= 10 && age <= 12) {
        // أعمار 10-12: أسئلة مفصلة ومتقدمة مع 5 خيارات
        gameDifficulty.mode = 'detailed';
        gameDifficulty.optionsCount = 5;
    } else {
        // افتراضي
        gameDifficulty.mode = 'simple';
        gameDifficulty.optionsCount = 3;
    }
}

// تحديث عنوان اللعبة
function updateGameTitle() {
    const titleElement = document.querySelector('.game-header h1');
    if (titleElement) {
        titleElement.textContent = `👁️ لعبة الحواس الخمسة - عمر ${playerAge} سنوات`;
    }
}

// بدء لعبة جديدة
function startNewGame() {
    score = 0;
    correctAnswers = 0;
    currentQuestionNumber = 1;
    questions = [];
    gameTimer = 0;
    
    // جعل المتغيرات متاحة في window لاستخدامها من task_timer.js
    window.score = score;
    window.correctAnswers = correctAnswers;
    window.totalQuestions = totalQuestions;
    window.currentQuestionNumber = currentQuestionNumber;
    
    // إيقاف المؤقت القديم إن وجد
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // إخفاء شاشة النهاية وإظهار شاشة اللعب
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // تحديث الإحصائيات
    updateStats();
    
    // بدء المؤقت
    startTimer();
    
    // إنشاء الأسئلة
    generateQuestions();
    
    // عرض السؤال الأول
    showNextQuestion();
    
    // تحديد أن اللعبة بدأت
    hasStartedGame = true;
}

// إنشاء الأسئلة
function generateQuestions() {
    questions = [];
    const senses = Object.keys(sensesDatabase);
    const mode = gameDifficulty.mode;
    
    // إنشاء قائمة بجميع الأنشطة المتاحة
    let allActions = [];
    senses.forEach(sense => {
        const actions = sensesDatabase[sense][mode].map(action => ({
            ...action,
            sense: sense,
            senseIcon: sensesDatabase[sense].icon
        }));
        allActions = allActions.concat(actions);
    });
    
    // خلط الأنشطة عشوائياً
    allActions = shuffleArray(allActions);
    
    // إنشاء 10 أسئلة
    for (let i = 0; i < totalQuestions && i < allActions.length; i++) {
        const action = allActions[i];
        const wrongSenses = senses.filter(s => s !== action.sense);
        const shuffledWrongSenses = shuffleArray([...wrongSenses]);
        const wrongOptions = shuffledWrongSenses.slice(0, gameDifficulty.optionsCount - 1);
        
        const options = [action.sense, ...wrongOptions];
        const shuffledOptions = shuffleArray(options);
        
        questions.push({
            action: action,
            correctAnswer: action.sense,
            options: shuffledOptions
        });
    }
}

// خلط المصفوفة عشوائياً
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// عرض السؤال التالي
function showNextQuestion() {
    if (currentQuestionNumber > totalQuestions || questions.length === 0) {
        endGame();
        return;
    }
    
    currentQuestion = questions[currentQuestionNumber - 1];
    
    // عرض النشاط
    document.getElementById('senseIcon').textContent = currentQuestion.action.icon;
    document.getElementById('senseAction').textContent = currentQuestion.action.action;
    
    // عرض الخيارات
    displayOptions(currentQuestion.options);
    
    // مسح التعليقات السابقة
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback empty';
    
    // تحديث شريط التقدم
    const progress = (currentQuestionNumber / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // تحديث رقم السؤال
    document.getElementById('questionNumber').textContent = `${currentQuestionNumber} / ${totalQuestions}`;
}

// عرض الخيارات
function displayOptions(options) {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        const senseData = sensesDatabase[option];
        button.textContent = `${senseData.icon} ${option}`;
        button.onclick = () => selectAnswer(option);
        container.appendChild(button);
    });
}

// اختيار الإجابة
function selectAnswer(selectedAnswer) {
    // تعطيل جميع الأزرار
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.onclick = null;
        btn.style.cursor = 'not-allowed';
    });
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const feedbackElement = document.getElementById('feedback');
    
    if (isCorrect) {
        score += 10;
        correctAnswers++;
        // تحديث window للمتغيرات
        window.score = score;
        window.correctAnswers = correctAnswers;
        feedbackElement.textContent = '🎉 ممتاز! إجابة صحيحة!';
        feedbackElement.className = 'feedback correct';
        
        // إبراز الإجابة الصحيحة
        buttons.forEach(btn => {
            if (btn.textContent.includes(currentQuestion.correctAnswer)) {
                btn.classList.add('correct');
            }
        });
    } else {
        feedbackElement.textContent = `❌ غير صحيح. الإجابة الصحيحة هي: ${sensesDatabase[currentQuestion.correctAnswer].icon} ${currentQuestion.correctAnswer}`;
        feedbackElement.className = 'feedback incorrect';
        
        // إبراز الإجابة الخاطئة والصحيحة
        buttons.forEach(btn => {
            if (btn.textContent.includes(selectedAnswer)) {
                btn.classList.add('incorrect');
            }
            if (btn.textContent.includes(currentQuestion.correctAnswer)) {
                btn.classList.add('correct');
            }
        });
    }
    
    // تحديث الإحصائيات
    updateStats();
    
    // الانتقال للسؤال التالي بعد ثانيتين
    setTimeout(() => {
        currentQuestionNumber++;
        // تحديث window.currentQuestionNumber
        window.currentQuestionNumber = currentQuestionNumber;
        if (currentQuestionNumber > totalQuestions) {
            endGame();
        } else {
            showNextQuestion();
        }
    }, 2000);
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('correctAnswers').textContent = correctAnswers;
}

// بدء المؤقت
function startTimer() {
    gameTimer = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        gameTimer++;
        updateTimerDisplay();
    }, 1000);
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
    const minutes = Math.floor(gameTimer / 60);
    const seconds = gameTimer % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const timerElement = document.getElementById('gameTimer');
    if (timerElement) {
        timerElement.textContent = timeString;
    }
}

// إيقاف المؤقت
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// إنهاء اللعبة
async function endGame() {
    console.log('🎮 endGame called (science_senses_game)', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers
    });
    
    // التأكد من تحديث window.currentQuestionNumber قبل حفظ النتائج
    window.currentQuestionNumber = currentQuestionNumber;
    window.totalQuestions = totalQuestions;
    window.correctAnswers = correctAnswers;
    
    // إيقاف المؤقت
    stopTimer();
    
    // إيقاف مؤقت المهمة
    if (typeof stopTaskTimer === 'function') {
        stopTaskTimer();
    }
    
    // حفظ النتائج في قاعدة البيانات وجلب البادجز
    let earnedBadges = [];
    console.log('💾 محاولة حفظ النتائج...', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        allQuestionsAnswered: currentQuestionNumber > totalQuestions
    });
    console.log('saveScoreAndComplete function exists?', typeof saveScoreAndComplete === 'function');
    
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
                alert('⚠️ تم حفظ النتائج لكن حدث خطأ. يرجى التحقق من التقارير.');
            }
        } catch (error) {
            console.error('❌ خطأ في حفظ النتائج:', error);
            alert('⚠️ حدث خطأ أثناء حفظ النتائج. يرجى المحاولة مرة أخرى.');
        }
    } else {
        console.error('❌ دالة saveScoreAndComplete غير موجودة!');
        alert('⚠️ خطأ: لا يمكن حفظ النتائج. يرجى التحقق من الاتصال بالخادم.');
    }
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCorrect').textContent = `${correctAnswers} / ${totalQuestions}`;
    
    // تحديث الأيقونة والرسالة حسب النقاط
    updateResultIconAndMessage(score);
    
    // عرض البادجز المكتسبة
    displayEarnedBadges(earnedBadges);
    
    // عند انتهاء اللعبة نعتبر التنقل مقصوداً (لمنع beforeunload)
    isNavigatingAway = true;
}

// تحديث الأيقونة والرسالة حسب النقاط
function updateResultIconAndMessage(score) {
    const iconElement = document.getElementById('resultIcon');
    const messageElement = document.getElementById('resultMessage');
    
    if (score >= 90 && score <= 100) {
        // 90-100: الكأس
        iconElement.textContent = '🏆';
        messageElement.textContent = 'ممتاز!';
    } else if (score >= 60 && score < 90) {
        // 60-90: ميدالية ذهبية
        iconElement.textContent = '🥇';
        messageElement.textContent = 'رائع جداً!';
    } else if (score >= 30 && score < 60) {
        // 30-60: ميدالية فضية
        iconElement.textContent = '🥈';
        messageElement.textContent = 'جيد جداً!';
    } else if (score >= 10 && score < 30) {
        // 10-30: نجمة
        iconElement.textContent = '⭐';
        messageElement.textContent = 'حاول مرة أخرى!';
    } else {
        // أقل من 10: إبهام
        iconElement.textContent = '👍';
        messageElement.textContent = 'استمر في المحاولة!';
    }
}

// عرض البادجز المكتسبة
function displayEarnedBadges(badges) {
    const badgesSection = document.getElementById('badgesEarnedSection');
    const badgesGrid = document.getElementById('badgesEarnedGrid');
    
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
        badgeCard.style.background = `linear-gradient(135deg, ${colorCode} 0%, ${adjustBadgeColor(colorCode)} 100%)`;
        
        badgeCard.innerHTML = `
            <div class="badge-earned-icon">${badge.badge_icon || '🏆'}</div>
            <div class="badge-earned-name">${badge.badge_name_ar || badge.badge_name}</div>
            ${badge.level ? `<div class="badge-earned-level">المستوى ${badge.level}</div>` : ''}
        `;
        
        badgesGrid.appendChild(badgeCard);
    });
}

// تعديل لون البادج
function adjustBadgeColor(color) {
    // تحويل hex إلى rgb
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // جعل اللون أغمق قليلاً
    const darkerR = Math.max(0, r - 30);
    const darkerG = Math.max(0, g - 30);
    const darkerB = Math.max(0, b - 30);
    
    return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
}

// رجوع
function goBack() {
    // الحصول على child_id من URL أو localStorage أو sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let childId = urlParams.get('child_id');
    
    // إذا لم يكن في URL، نبحث في sessionStorage أولاً ثم localStorage
    if (!childId) {
        childId = sessionStorage.getItem('current_child_id') || localStorage.getItem('current_child_id');
    }
    
    // التوجه لصفحة المحتوى مع child_id إذا كان موجوداً
    if (childId) {
        // التأكد من حفظ child_id في sessionStorage
        sessionStorage.setItem('current_child_id', childId);
        isNavigatingAway = true;
        // استخدام replace حتى لا يعود زر الرجوع إلى صفحة اللعبة
        window.location.replace(`child_view.html?child_id=${childId}`);
    } else {
        // إذا لم نجد child_id، نعود إلى parent_dashboard
        isNavigatingAway = true;
        window.location.replace('parent_dashboard.html');
    }
}

// رجوع مع تأكيد (لزر الرجوع في الأعلى أثناء اللعبة)
async function goBackWithConfirm() {
    console.log('🔙 goBackWithConfirm called', { hasStartedGame });
    
    // إذا كانت شاشة النهاية ظاهرة، نرجع بدون حفظ "متوقفة" (تم الحفظ مسبقاً)
    const gameOverScreen = document.getElementById('gameOverScreen');
    const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
    
    console.log('Game state in goBackWithConfirm:', { isGameOverVisible, hasStartedGame });
    
    // تأكيد الخروج دائماً
    const confirmLeave = confirm('هل أنت متأكد؟ سيتم فقدان التقدم.');
    
    if (!confirmLeave) {
        console.log('❌ User cancelled leaving');
        return;
    }
    
    // حفظ التقدم الحالي كمهمة متوقفة (نسبة إكمال أقل من 100) إذا لم تنته اللعبة
    if (!isGameOverVisible && hasStartedGame) {
        await savePausedSession();
    }
    
    // في جميع الأحوال، نعود لصفحة الطفل
    isNavigatingAway = true;
    goBack();
}

// ربط الدوال في النطاق العام لتعمل مع أزرار HTML
window.goBackWithConfirm = goBackWithConfirm;
window.goBack = goBack;

