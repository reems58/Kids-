// لعبة تصنيف الحيوانات
let currentQuestion = null;
let score = 0;
let correctAnswers = 0;
let currentQuestionNumber = 1;
let totalQuestions = 10;
let questions = [];
let playerAge = 7; // العمر الافتراضي
let gameTimer = 0; // الوقت بالثواني
let timerInterval = null;
let gameDifficulty = {
    categoriesCount: 3, // عدد الفئات المعروضة
    animalsPerCategory: 5, // عدد الحيوانات لكل فئة
    categories: ['ثدييات', 'طيور', 'أسماك'], // الفئات الافتراضية
    optionsCount: 3, // عدد الخيارات
    mode: 'category' // 'simple' للأعمار الصغيرة، 'category' للأعمار الكبيرة
};
let isNavigatingAway = false; // لتخطي beforeunload عند الرجوع المقصود
let hasStartedGame = false;

// حيوانات بسيطة جداً للأعمار الصغيرة (4-5 سنوات) - حيوانات معروفة جداً
const verySimpleAnimals = [
    { name: 'كلب', emoji: '🐶', category: 'ثدييات' },
    { name: 'قط', emoji: '🐱', category: 'ثدييات' },
    { name: 'أسد', emoji: '🦁', category: 'ثدييات' },
    { name: 'فيل', emoji: '🐘', category: 'ثدييات' },
    { name: 'دجاجة', emoji: '🐔', category: 'طيور' },
    { name: 'بط', emoji: '🦆', category: 'طيور' },
    { name: 'عصفور', emoji: '🐦', category: 'طيور' },
    { name: 'سمكة', emoji: '🐟', category: 'أسماك' }
];

// حيوانات بسيطة للأعمار المتوسطة (6-7 سنوات) - حيوانات معروفة
const simpleAnimals = [
    { name: 'أسد', emoji: '🦁', category: 'ثدييات' },
    { name: 'كلب', emoji: '🐶', category: 'ثدييات' },
    { name: 'قط', emoji: '🐱', category: 'ثدييات' },
    { name: 'فيل', emoji: '🐘', category: 'ثدييات' },
    { name: 'حصان', emoji: '🐴', category: 'ثدييات' },
    { name: 'دب', emoji: '🐻', category: 'ثدييات' },
    { name: 'دجاجة', emoji: '🐔', category: 'طيور' },
    { name: 'بط', emoji: '🦆', category: 'طيور' },
    { name: 'عصفور', emoji: '🐦', category: 'طيور' },
    { name: 'ببغاء', emoji: '🦜', category: 'طيور' },
    { name: 'سمكة', emoji: '🐟', category: 'أسماك' },
    { name: 'دولفين', emoji: '🐬', category: 'أسماك' }
];

// قاعدة بيانات الحيوانات
const animalsDatabase = {
    'ثدييات': [
        { name: 'أسد', emoji: '🦁' },
        { name: 'فيل', emoji: '🐘' },
        { name: 'قرد', emoji: '🐵' },
        { name: 'كلب', emoji: '🐶' },
        { name: 'قط', emoji: '🐱' },
        { name: 'حصان', emoji: '🐴' },
        { name: 'بقرة', emoji: '🐮' },
        { name: 'دب', emoji: '🐻' },
        { name: 'ذئب', emoji: '🐺' },
        { name: 'زرافة', emoji: '🦒' },
        { name: 'كنغر', emoji: '🦘' },
        { name: 'باندا', emoji: '🐼' }
    ],
    'طيور': [
        { name: 'نسر', emoji: '🦅' },
        { name: 'ببغاء', emoji: '🦜' },
        { name: 'بط', emoji: '🦆' },
        { name: 'دجاجة', emoji: '🐔' },
        { name: 'بومة', emoji: '🦉' },
        { name: 'نعامة', emoji: '🦃' },
        { name: 'طاووس', emoji: '🦚' },
        { name: 'حمامة', emoji: '🕊️' },
        { name: 'صقر', emoji: '🦅' },
        { name: 'عصفور', emoji: '🐦' }
    ],
    'أسماك': [
        { name: 'سمكة', emoji: '🐟' },
        { name: 'قرش', emoji: '🦈' },
        { name: 'دولفين', emoji: '🐬' },
        { name: 'سمكة ذهبية', emoji: '🐠' },
        { name: 'أخطبوط', emoji: '🐙' },
        { name: 'سلطعون', emoji: '🦀' },
        { name: 'حوت', emoji: '🐋' },
        { name: 'نجم البحر', emoji: '⭐' },
        { name: 'روبيان', emoji: '🦐' }
    ],
    'زواحف': [
        { name: 'ثعبان', emoji: '🐍' },
        { name: 'تمساح', emoji: '🐊' },
        { name: 'سلحفاة', emoji: '🐢' },
        { name: 'سحلية', emoji: '🦎' },
        { name: 'ديناصور', emoji: '🦕' }
    ],
    'حشرات': [
        { name: 'فراشة', emoji: '🦋' },
        { name: 'نحلة', emoji: '🐝' },
        { name: 'عنكبوت', emoji: '🕷️' },
        { name: 'دودة', emoji: '🐛' },
        { name: 'نملة', emoji: '🐜' },
        { name: 'جرادة', emoji: '🦗' }
    ]
};

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
    
    if (ageParam) {
        playerAge = parseInt(ageParam);
    }
    
    // حفظ child_id في sessionStorage إذا كان موجوداً في URL
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
        // أعمار 4-5: أسئلة بسيطة جداً - "أي حيوان هذا؟" مع خيارين فقط
        gameDifficulty.mode = 'simple'; // وضع بسيط: اختيار اسم الحيوان
        gameDifficulty.optionsCount = 2; // خياران فقط
        gameDifficulty.categories = ['ثدييات', 'طيور', 'أسماك'];
        totalQuestions = 8; // تقليل عدد الأسئلة للأعمار الصغيرة
    } else if (age >= 6 && age <= 7) {
        // أعمار 6-7: أسئلة بسيطة - "أي حيوان هذا؟" مع خيارين
        gameDifficulty.mode = 'simple';
        gameDifficulty.optionsCount = 2;
        gameDifficulty.categories = ['ثدييات', 'طيور', 'أسماك'];
        totalQuestions = 10;
    } else if (age >= 8 && age <= 9) {
        // أعمار 8-9: فئات بسيطة (ثدييات، طيور، أسماك فقط)، 3 خيارات
        gameDifficulty.mode = 'category'; // وضع التصنيف
        gameDifficulty.categoriesCount = 3;
        gameDifficulty.categories = ['ثدييات', 'طيور', 'أسماك'];
        gameDifficulty.optionsCount = 3;
        totalQuestions = 10;
    } else if (age >= 10 && age <= 11) {
        // أعمار 10-11: فئات أكثر (4 فئات)، 4 خيارات
        gameDifficulty.mode = 'category';
        gameDifficulty.categoriesCount = 4;
        gameDifficulty.categories = ['ثدييات', 'طيور', 'أسماك', 'زواحف'];
        gameDifficulty.optionsCount = 4;
        totalQuestions = 10;
    } else if (age >= 12) {
        // أعمار 12+: جميع الفئات، 5 خيارات
        gameDifficulty.mode = 'category';
        gameDifficulty.categoriesCount = 5;
        gameDifficulty.categories = ['ثدييات', 'طيور', 'أسماك', 'زواحف', 'حشرات'];
        gameDifficulty.optionsCount = 5;
        totalQuestions = 10;
    } else {
        // افتراضي (للأعمار الصغيرة جداً)
        gameDifficulty.mode = 'simple';
        gameDifficulty.optionsCount = 2;
        gameDifficulty.categories = ['ثدييات', 'طيور', 'أسماك'];
        totalQuestions = 8;
    }
}

// تحديث عنوان اللعبة
function updateGameTitle() {
    const titleElement = document.querySelector('.game-header h1');
    if (titleElement) {
        titleElement.textContent = `🐾 لعبة تصنيف الحيوانات - عمر ${playerAge} سنوات`;
    }
}

// حفظ الجلسة كمتوقفة
async function savePausedSession() {
    console.log('💾 [science_animals] savePausedSession called', {
        hasStartedGame,
        correctAnswers,
        totalQuestions,
        gameTimer: typeof gameTimer !== 'undefined' ? gameTimer : 'undefined'
    });
    
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
        const taskId = urlParams.get('task_id') || sessionStorage.getItem('current_task_id');
        const sessionId = urlParams.get('session_id') || sessionStorage.getItem('current_session_id');
        
        console.log('📋 [science_animals] Identifiers:', { childId, taskId, sessionId });
        
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
        
        console.log('💾 [science_animals] savePausedSession - Values:', {
            correctAnswers: correctAnswers,
            window_correctAnswers: typeof window !== 'undefined' ? window.correctAnswers : 'undefined',
            totalQuestions: totalQuestions,
            window_totalQuestions: typeof window !== 'undefined' ? window.totalQuestions : 'undefined',
            currentCorrect: currentCorrect,
            totalQ: totalQ,
            completedPercentage: completedPercentage,
            calculation: `(${currentCorrect} / ${totalQ}) × 100 = ${completedPercentage}%`
        });
        
        // استخدام gameTimer الخاص باللعبة أو getElapsedTime من task_timer
        let elapsedSeconds = 0;
        if (typeof gameTimer !== 'undefined' && gameTimer > 0) {
            elapsedSeconds = gameTimer; // gameTimer بالثواني
        } else if (typeof getElapsedTime === 'function') {
            elapsedSeconds = getElapsedTime();
        }
        const durationMinutes = Math.max(1, Math.floor(elapsedSeconds / 60)); // على الأقل دقيقة واحدة

        console.log('📊 [science_animals] Percentage calculation:', {
            currentCorrect: currentCorrect,
            totalQ: totalQ,
            completedPercentage: completedPercentage,
            formula: `(${currentCorrect} / ${totalQ}) × 100 = ${completedPercentage}%`,
            gameTimer: typeof gameTimer !== 'undefined' ? gameTimer : 'undefined',
            elapsedSeconds,
            durationMinutes
        });

        // تحديد إذا كانت جميع الأسئلة تم حلها (فقط إذا انتهت اللعبة)
        // في savePausedSession، اللعبة لم تنته بعد (تم إغلاق النافذة)، لذلك all_questions_answered = false
        const allQuestionsAnswered = false; // دائماً false في savePausedSession لأن اللعبة لم تنته
        
        const payload = {
            child_id: parseInt(childId),
            task_id: parseInt(taskId),
            session_id: sessionId ? parseInt(sessionId) : null,
            duration: durationMinutes,
            completed_percentage: completedPercentage,
            all_questions_answered: allQuestionsAnswered
        };

        const json = JSON.stringify(payload);
        
        console.log('📤 [science_animals] Sending paused session:', payload);
        
        // استخدام fetch مع keepalive للحفظ (أفضل من sendBeacon لأنه ينتظر الرد)
        const response = await fetch('../api/complete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
            keepalive: true
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ [science_animals] fetch keepalive paused session', result);
        
        if (!result.success) {
            console.error('❌ [science_animals] Server returned error:', result.message);
            throw new Error(result.message || 'فشل حفظ الجلسة المتوقفة');
        }
        
        return result;
    } catch (e) {
        console.error('❌ [science_animals] حفظ متوقف فشل:', e);
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
    gameTimer = 0;
    
    // جعل المتغيرات متاحة في window لاستخدامها من task_timer.js
    window.score = score;
    window.correctAnswers = correctAnswers;
    window.totalQuestions = totalQuestions;
    window.currentQuestionNumber = currentQuestionNumber;
    
    console.log('🎮 [science_animals] startNewGame - Variables set:', {
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        window_correctAnswers: window.correctAnswers,
        window_totalQuestions: window.totalQuestions
    });
    
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
}

// إنشاء الأسئلة
function generateQuestions() {
    questions = [];
    
    // للأعمار الصغيرة (4-7): أسئلة بسيطة "أي حيوان هذا؟"
    if (gameDifficulty.mode === 'simple') {
        // اختيار قائمة الحيوانات حسب العمر
        const animalsList = playerAge <= 5 ? verySimpleAnimals : simpleAnimals;
        const shuffledAnimals = shuffleArray([...animalsList]);
        
        for (let i = 0; i < totalQuestions && i < shuffledAnimals.length; i++) {
            const correctAnimal = shuffledAnimals[i];
            const wrongAnimals = shuffledAnimals.filter(a => a.name !== correctAnimal.name && a.category !== correctAnimal.category);
            const shuffledWrong = shuffleArray([...wrongAnimals]);
            const wrongOption = shuffledWrong[0]; // خيار خاطئ واحد فقط
            
            // خيارات مع الرموز التعبيرية كبيرة وجذابة للأطفال
            const options = [
                `${correctAnimal.emoji} ${correctAnimal.name}`,
                `${wrongOption.emoji} ${wrongOption.name}`
            ];
            const shuffledOptions = shuffleArray(options);
            
            // العثور على النص الصحيح بعد الخلط
            const correctText = shuffledOptions.find(opt => opt.includes(correctAnimal.name));
            
            questions.push({
                animal: correctAnimal,
                correctAnswer: correctText, // حفظ النص الكامل كإجابة صحيحة
                options: shuffledOptions
            });
        }
    } else {
        // للأعمار الكبيرة: أسئلة تصنيف
        const categories = gameDifficulty.categories;
        
        // إنشاء قائمة بجميع الحيوانات المتاحة
        let allAnimals = [];
        categories.forEach(category => {
            const categoryAnimals = animalsDatabase[category].map(animal => ({
                ...animal,
                category: category
            }));
            allAnimals = allAnimals.concat(categoryAnimals);
        });
        
        // خلط الحيوانات عشوائياً
        allAnimals = shuffleArray(allAnimals);
        
        // إنشاء 10 أسئلة
        for (let i = 0; i < totalQuestions && i < allAnimals.length; i++) {
            const animal = allAnimals[i];
            const wrongCategories = categories.filter(cat => cat !== animal.category);
            const shuffledWrongCategories = shuffleArray([...wrongCategories]);
            const wrongOptions = shuffledWrongCategories.slice(0, gameDifficulty.optionsCount - 1);
            
            const options = [animal.category, ...wrongOptions];
            const shuffledOptions = shuffleArray(options);
            
            questions.push({
                animal: animal,
                correctAnswer: animal.category,
                options: shuffledOptions
            });
        }
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
    
    // تغيير نص السؤال حسب الوضع (بسيط أو تصنيف)
    let questionText;
    if (gameDifficulty.mode === 'simple') {
        if (playerAge <= 5) {
            questionText = 'شو اسم هاد الحيوان؟'; // نص أبسط للأعمار الصغيرة جداً
        } else {
            questionText = 'أي حيوان هذا؟';
        }
    } else {
        if (playerAge <= 9) {
            questionText = 'شو نوع هاد الحيوان؟'; // نص أبسط للأعمار المتوسطة
        } else {
            questionText = 'ما نوع هذا الحيوان؟';
        }
    }
    document.getElementById('questionText').textContent = questionText;
    
    // عرض الحيوان
    document.getElementById('animalEmoji').textContent = currentQuestion.animal.emoji;
    
    // للأعمار الصغيرة: إخفاء اسم الحيوان، للأعمار الكبيرة: إظهاره
    if (gameDifficulty.mode === 'simple') {
        document.getElementById('animalName').textContent = '؟'; // فقط علامة استفهام
    } else {
        document.getElementById('animalName').textContent = currentQuestion.animal.name;
    }
    
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
        button.textContent = option;
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
        
        console.log('✅ [science_animals] Correct answer!', {
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
            window_correctAnswers: window.correctAnswers,
            window_totalQuestions: window.totalQuestions
        });
        // رسائل مختلفة حسب العمر
        if (playerAge <= 5) {
            feedbackElement.textContent = '🎉 رائع! صح!';
        } else if (playerAge <= 7) {
            feedbackElement.textContent = '🎉 ممتاز! إجابة صحيحة!';
        } else {
            feedbackElement.textContent = '🎉 ممتاز! إجابة صحيحة!';
        }
        feedbackElement.className = 'feedback correct';
        
        // إبراز الإجابة الصحيحة
        buttons.forEach(btn => {
            if (btn.textContent === currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            }
        });
    } else {
        // رسائل مختلفة حسب العمر
        if (playerAge <= 5) {
            feedbackElement.textContent = `❌ مش صح. الجواب الصحيح: ${currentQuestion.correctAnswer}`;
        } else if (playerAge <= 7) {
            feedbackElement.textContent = `❌ غير صحيح. الإجابة الصحيحة: ${currentQuestion.correctAnswer}`;
        } else {
            feedbackElement.textContent = `❌ غير صحيح. الإجابة الصحيحة هي: ${currentQuestion.correctAnswer}`;
        }
        feedbackElement.className = 'feedback incorrect';
        
        // إبراز الإجابة الخاطئة والصحيحة
        buttons.forEach(btn => {
            if (btn.textContent === selectedAnswer) {
                btn.classList.add('incorrect');
            }
            if (btn.textContent === currentQuestion.correctAnswer) {
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
    console.log('🎮 endGame called (science_animals_game)', {
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
    
    // إيقاف المؤقت
    stopTimer();
    
    // إيقاف مؤقت المهمة
    if (typeof stopTaskTimer === 'function') {
        stopTaskTimer();
    }
    
    // حفظ النتائج في قاعدة البيانات
    console.log('💾 محاولة حفظ النتائج...', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        allQuestionsAnswered: currentQuestionNumber > totalQuestions
    });
    let earnedBadges = [];
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
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    
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
    
    // عرض الوقت الإجمالي
    const minutes = Math.floor(gameTimer / 60);
    const seconds = gameTimer % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const finalTimeElement = document.getElementById('finalTime');
    if (finalTimeElement) {
        finalTimeElement.textContent = timeString;
    }
}

// رجوع
async function goBack(skipSave = false) {
    // تحديد أننا نغادر بشكل مقصود
    isNavigatingAway = true;
    
    // حفظ الجلسة كمتوقفة قبل الرجوع (فقط إذا لم يتم حفظها مسبقاً)
    if (!skipSave && hasStartedGame) {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
        
        // حفظ فقط إذا لم تنته اللعبة
        if (!isGameOverVisible) {
            console.log('💾 حفظ الجلسة كمتوقفة قبل الرجوع...');
            await savePausedSession();
        }
    }
    
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
        window.location.href = `child_view.html?child_id=${childId}`;
    } else {
        // إذا لم نجد child_id، نعود إلى parent_dashboard
        window.location.href = 'parent_dashboard.html';
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
        // النتيجة محفوظة مسبقاً في endGame()، فقط نرجع (تخطي الحفظ)
        isNavigatingAway = true;
        goBack(true);
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

    // العودة لصفحة الطفل (تخطي الحفظ لأننا حفظناها بالفعل)
    goBack(true);
}

