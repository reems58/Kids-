// لعبة الحروف العربية
let currentQuestion = null;
let score = 0;
let correctAnswers = 0;
let currentQuestionNumber = 1;
let totalQuestions = 10;
let questions = [];
let playerAge = 7; // العمر الافتراضي
let gameDifficulty = {
    level: 'beginner' // beginner, intermediate, advanced
};

// متغيرات لمراقبة حالة اللعبة وزر الرجوع
let arabicIsHandlingBack = false;
let arabicHasStartedGame = false;
let arabicIsNavigatingAway = false;

// جعل المتغيرات متاحة في window لاستخدامها من task_timer.js
window.score = score;
window.correctAnswers = correctAnswers;
window.totalQuestions = totalQuestions;

// مؤقت المهمة - سيتم تحميله من task_timer.js

// حفظ المهمة كـ "متوقفة" عند الخروج المفاجئ
async function arabicSavePausedSession() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
        const taskId = urlParams.get('task_id') || sessionStorage.getItem('current_task_id');
        // قراءة session_id من URL أولاً، ثم من sessionStorage
        const sessionId = urlParams.get('session_id') || sessionStorage.getItem('current_session_id');
        if (!childId || !taskId) {
            console.warn('⚠️ [arabic] لا توجد معرفات كافية للحفظ كمتوقفة', { childId, taskId, sessionId });
            return;
        }

        const currentScore = typeof window.score !== 'undefined' ? window.score : 0;
        const currentCorrect = typeof window.correctAnswers !== 'undefined' ? window.correctAnswers : 0;
        const totalQ = typeof window.totalQuestions !== 'undefined' ? window.totalQuestions : 10;
        const currentQNum = typeof window.currentQuestionNumber !== 'undefined' ? window.currentQuestionNumber : (typeof currentQuestionNumber !== 'undefined' ? currentQuestionNumber : 1);
        
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

        if (navigator.sendBeacon) {
            const blob = new Blob([json], { type: 'application/json' });
            const ok = navigator.sendBeacon('../api/complete_task.php', blob);
            console.log('📡 [arabic] sendBeacon paused session', ok, payload);
            return;
        }

        await fetch('../api/complete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
            keepalive: true
        });
        console.log('✅ [arabic] fetch keepalive paused session', payload);
    } catch (e) {
        console.error('❌ [arabic] حفظ متوقف فشل:', e);
    }
}

// الحروف العربية
const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

// كلمات بسيطة جداً للأطفال الصغار (4-6 سنوات) - كلمات قصيرة وسهلة جداً
const simpleWords = [
    // حرف الألف
    { word: 'أب', letter: 'أ', meaning: 'أب' },
    { word: 'أم', letter: 'أ', meaning: 'أم' },
    
    // حرف الباء
    { word: 'باب', letter: 'ب', meaning: 'باب' },
    { word: 'بيت', letter: 'ب', meaning: 'بيت' },
    { word: 'بطة', letter: 'ب', meaning: 'بطة' },
    
    // حرف التاء
    { word: 'تمر', letter: 'ت', meaning: 'تمر' },
    { word: 'تفاح', letter: 'ت', meaning: 'تفاح' },
    
    // حرف الجيم
    { word: 'جمل', letter: 'ج', meaning: 'جمل' },
    { word: 'جزر', letter: 'ج', meaning: 'جزر' },
    
    // حرف الحاء
    { word: 'حوت', letter: 'ح', meaning: 'حوت' },
    { word: 'حصان', letter: 'ح', meaning: 'حصان' },
    
    // حرف الدال
    { word: 'دب', letter: 'د', meaning: 'دب' },
    { word: 'ديك', letter: 'د', meaning: 'ديك' },
    
    // حرف الراء
    { word: 'رجل', letter: 'ر', meaning: 'رجل' },
    { word: 'رمان', letter: 'ر', meaning: 'رمان' },
    
    // حرف السين
    { word: 'سمك', letter: 'س', meaning: 'سمك' },
    { word: 'شمس', letter: 'ش', meaning: 'شمس' },
    
    // حرف العين
    { word: 'عسل', letter: 'ع', meaning: 'عسل' },
    { word: 'عصفور', letter: 'ع', meaning: 'عصفور' },
    
    // حرف الفاء
    { word: 'فيل', letter: 'ف', meaning: 'فيل' },
    { word: 'فراشة', letter: 'ف', meaning: 'فراشة' },
    
    // حرف القاف
    { word: 'قمر', letter: 'ق', meaning: 'قمر' },
    { word: 'قط', letter: 'ق', meaning: 'قط' },
    
    // حرف الكاف
    { word: 'كتاب', letter: 'ك', meaning: 'كتاب' },
    { word: 'كرة', letter: 'ك', meaning: 'كرة' },
    
    // حرف اللام
    { word: 'لبن', letter: 'ل', meaning: 'لبن' },
    { word: 'ليمون', letter: 'ل', meaning: 'ليمون' },
    
    // حرف الميم
    { word: 'موز', letter: 'م', meaning: 'موز' },
    { word: 'ماء', letter: 'م', meaning: 'ماء' },
    
    // حرف النون
    { word: 'نمر', letter: 'ن', meaning: 'نمر' },
    { word: 'نار', letter: 'ن', meaning: 'نار' },
    
    // حرف الهاء
    { word: 'هدهد', letter: 'ه', meaning: 'هدهد' },
    { word: 'هلال', letter: 'ه', meaning: 'هلال' },
    
    // حرف الواو
    { word: 'ورد', letter: 'و', meaning: 'ورد' },
    { word: 'وادي', letter: 'و', meaning: 'وادي' },
    
    // حرف الياء
    { word: 'يد', letter: 'ي', meaning: 'يد' },
    { word: 'يمامة', letter: 'ي', meaning: 'يمامة' }
];

// كلمات متوسطة (7-9 سنوات)
const mediumWords = [
    { word: 'أسد', letter: 'أ', meaning: 'أسد' },
    { word: 'بطة', letter: 'ب', meaning: 'بطة' },
    { word: 'تاج', letter: 'ت', meaning: 'تاج' },
    { word: 'ثعبان', letter: 'ث', meaning: 'ثعبان' },
    { word: 'جزر', letter: 'ج', meaning: 'جزر' },
    { word: 'حصان', letter: 'ح', meaning: 'حصان' },
    { word: 'خروف', letter: 'خ', meaning: 'خروف' },
    { word: 'دولفين', letter: 'د', meaning: 'دولفين' },
    { word: 'ذئب', letter: 'ذ', meaning: 'ذئب' },
    { word: 'زرافة', letter: 'ز', meaning: 'زرافة' },
    { word: 'شجرة', letter: 'ش', meaning: 'شجرة' },
    { word: 'صقر', letter: 'ص', meaning: 'صقر' },
    { word: 'طاووس', letter: 'ط', meaning: 'طاووس' },
    { word: 'عصفور', letter: 'ع', meaning: 'عصفور' },
    { word: 'غزال', letter: 'غ', meaning: 'غزال' }
];

// كلمات متقدمة (10-12 سنة)
const advancedWords = [
    { word: 'أرنب', letter: 'أ', meaning: 'أرنب' },
    { word: 'برتقال', letter: 'ب', meaning: 'برتقال' },
    { word: 'توت', letter: 'ت', meaning: 'توت' },
    { word: 'ثعلب', letter: 'ث', meaning: 'ثعلب' },
    { word: 'جندب', letter: 'ج', meaning: 'جندب' },
    { word: 'حوت', letter: 'ح', meaning: 'حوت' },
    { word: 'خنفساء', letter: 'خ', meaning: 'خنفساء' },
    { word: 'ديك', letter: 'د', meaning: 'ديك' },
    { word: 'ذرة', letter: 'ذ', meaning: 'ذرة' },
    { word: 'زيتون', letter: 'ز', meaning: 'زيتون' },
    { word: 'شمعة', letter: 'ش', meaning: 'شمعة' },
    { word: 'صندوق', letter: 'ص', meaning: 'صندوق' },
    { word: 'ضفدع', letter: 'ض', meaning: 'ضفدع' },
    { word: 'طائر', letter: 'ط', meaning: 'طائر' },
    { word: 'ظبي', letter: 'ظ', meaning: 'ظبي' },
    { word: 'عنكبوت', letter: 'ع', meaning: 'عنكبوت' },
    { word: 'غيمة', letter: 'غ', meaning: 'غيمة' }
];

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
    const durationParam = urlParams.get('duration');
    const childIdParam = urlParams.get('child_id');
    const taskIdParam = urlParams.get('task_id');
    
    if (ageParam) {
        playerAge = parseInt(ageParam);
    }
    if (childIdParam) {
        sessionStorage.setItem('current_child_id', childIdParam);
    }
    if (taskIdParam) {
        sessionStorage.setItem('current_task_id', taskIdParam);
    }
    
    // إعداد سلوك زر الرجوع في المتصفح (سهم الرجوع عند الـ URL)
    try {
        // إضافة حالة في الـ history حتى نستطيع التقاط حدث الرجوع
        window.history.pushState({ page: 'arabic_game' }, '', window.location.href);
        
        window.addEventListener('popstate', async function () {
            console.log('🔙 [arabic_game] popstate event', {
                arabicIsHandlingBack,
                arabicHasStartedGame
            });
            
            if (arabicIsHandlingBack) return;
            arabicIsHandlingBack = true;
            
            const gameOverScreen = document.getElementById('gameOverScreen');
            const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
            
            // إذا لم تنتهِ اللعبة بعد، نطلب التأكيد ونحفظ كمهمة متوقفة
            if (!isGameOverVisible && arabicHasStartedGame) {
                // إعادة إضافة الحالة حتى لا يخرج مباشرة
                window.history.pushState({ page: 'arabic_game' }, '', window.location.href);
                
                const confirmLeave = confirm('هل أنت متأكد من الخروج من اللعبة؟ سيتم حفظ المهمة كـ \"متوقفة\" في صفحة الإنجازات.');
                if (!confirmLeave) {
                    arabicIsHandlingBack = false;
                    return;
                }
                
                await arabicSavePausedSession();
            }
            
            // في جميع الأحوال نرجع لصفحة الطفل
            arabicIsNavigatingAway = true;
            goBack();
            arabicIsHandlingBack = false;
        });
        
        // beforeunload للحفظ عند الإغلاق/التحديث
        window.addEventListener('beforeunload', function(e) {
            if (arabicIsNavigatingAway) return;
            const gameOverScreen = document.getElementById('gameOverScreen');
            const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
            if (isGameOverVisible || !arabicHasStartedGame) return;
            
            console.log('⚠️ [arabic] beforeunload saving paused');
            arabicSavePausedSession();
            e.preventDefault();
            e.returnValue = '';
            return '';
        });
    } catch (e) {
        console.error('❌ [arabic_game] خطأ في تهيئة سلوك زر الرجوع:', e);
    }
    
    // تحديد الصعوبة بناءً على العمر
    setDifficultyByAge(playerAge);
    
    // تحديث العنوان
    updateGameTitle();
    
    startNewGame();
});

// تحديد الصعوبة بناءً على العمر
function setDifficultyByAge(age) {
    if (age >= 4 && age <= 6) {
        gameDifficulty.level = 'beginner';
        gameDifficulty.wordList = simpleWords;
    } else if (age >= 7 && age <= 9) {
        gameDifficulty.level = 'intermediate';
        gameDifficulty.wordList = mediumWords;
    } else if (age >= 10 && age <= 12) {
        gameDifficulty.level = 'advanced';
        gameDifficulty.wordList = advancedWords;
    } else {
        gameDifficulty.level = 'beginner';
        gameDifficulty.wordList = simpleWords;
    }
}

// تحديث عنوان اللعبة
function updateGameTitle() {
    const titleElement = document.querySelector('.game-header h1');
    if (titleElement) {
        titleElement.textContent = `🎮 لعبة الحروف العربية - عمر ${playerAge} سنوات`;
    }
}

// بدء لعبة جديدة
function startNewGame() {
    score = 0;
    correctAnswers = 0;
    currentQuestionNumber = 1;
    questions = [];
    // تحديث window
    window.score = 0;
    window.correctAnswers = 0;
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
    
    // تحديد أن اللعبة بدأت
    arabicHasStartedGame = true;
}

// إنشاء الأسئلة
function generateQuestions() {
    questions = [];
    const wordList = gameDifficulty.wordList;
    
    // التحقق من وجود قائمة الكلمات
    if (!wordList || wordList.length === 0) {
        console.error('قائمة الكلمات فارغة!', gameDifficulty);
        // استخدام القائمة الافتراضية
        gameDifficulty.wordList = simpleWords;
        return generateQuestions(); // إعادة المحاولة
    }
    
    // قائمة لتتبع الكلمات المستخدمة (لتجنب التكرار)
    const usedWords = [];
    // قائمة لتتبع الحروف المستخدمة في الخيارات الخاطئة (لتنويع الخيارات)
    const usedWrongLetters = [];
    
    // نسخة من قائمة الكلمات للعمل عليها
    let availableWords = [...wordList];
    
    for (let i = 0; i < totalQuestions && availableWords.length > 0; i++) {
        // اختيار كلمة عشوائية من الكلمات المتاحة (غير المستخدمة)
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const randomWord = availableWords[randomIndex];
        
        // إزالة الكلمة من القائمة المتاحة لتجنب التكرار
        availableWords.splice(randomIndex, 1);
        
        // التحقق من صحة الكلمة
        if (!randomWord || !randomWord.letter || !randomWord.word) {
            console.error('كلمة غير صحيحة:', randomWord);
            continue;
        }
        
        // التحقق من عدم تكرار الكلمة
        if (usedWords.includes(randomWord.word)) {
            console.warn('تم تخطي كلمة مكررة:', randomWord.word);
            continue;
        }
        
        // إضافة الكلمة إلى قائمة المستخدمة
        usedWords.push(randomWord.word);
        
        // إنشاء خيارات (الحرف الصحيح + 3 خيارات خاطئة)
        const correctLetter = randomWord.letter;
        
        // التأكد من أن الحرف الصحيح موجود في قائمة الحروف
        if (!arabicLetters.includes(correctLetter)) {
            console.error('الحرف غير موجود في القائمة:', correctLetter, 'الكلمة:', randomWord.word);
            continue; // تخطي هذه الكلمة
        }
        
        // اختيار حروف خاطئة مختلفة (تجنب تكرار نفس الحروف في الخيارات)
        const wrongLetters = arabicLetters.filter(l => 
            l !== correctLetter && 
            !usedWrongLetters.includes(l) // تجنب الحروف المستخدمة مؤخراً
        );
        
        // إذا لم يكن هناك حروف كافية، أعد تعيين القائمة
        if (wrongLetters.length < 3) {
            // إعادة تعيين الحروف المستخدمة (احتفظ بآخر 5 فقط)
            usedWrongLetters.splice(0, Math.max(0, usedWrongLetters.length - 5));
            const freshWrongLetters = arabicLetters.filter(l => 
                l !== correctLetter && 
                !usedWrongLetters.includes(l)
            );
            if (freshWrongLetters.length >= 3) {
                wrongLetters.push(...freshWrongLetters);
            } else {
                // إذا لم يكن هناك خيارات كافية، استخدم أي حروف
                wrongLetters.push(...arabicLetters.filter(l => l !== correctLetter));
            }
        }
        
        // خلط الحروف الخاطئة واختيار 3 منها
        const shuffledWrong = wrongLetters.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        // إضافة الحروف الخاطئة المختارة إلى قائمة المستخدمة
        shuffledWrong.forEach(letter => {
            if (!usedWrongLetters.includes(letter)) {
                usedWrongLetters.push(letter);
            }
        });
        
        // إنشاء الخيارات مع التأكد من وجود الحرف الصحيح
        const options = [correctLetter, ...shuffledWrong];
        
        // خلط عشوائي صحيح (Fisher-Yates shuffle)
        for (let j = options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [options[j], options[k]] = [options[k], options[j]];
        }
        
        // التأكد من أن الحرف الصحيح موجود في الخيارات
        const correctIndex = options.indexOf(correctLetter);
        if (correctIndex === -1) {
            console.error('خطأ: الحرف الصحيح غير موجود في الخيارات!', correctLetter, options);
            // إصلاح: ضع الحرف الصحيح في البداية
            options[0] = correctLetter;
        }
        
        // التأكد من أن الخيارات صحيحة
        if (options.length < 4) {
            console.error('عدد الخيارات غير كافٍ:', options.length);
            continue;
        }
        
        // التأكد من عدم تكرار الحروف في الخيارات
        const uniqueOptions = [...new Set(options)];
        if (uniqueOptions.length < 4) {
            console.warn('تم اكتشاف حروف مكررة في الخيارات، إصلاح...');
            // إصلاح: إضافة حروف جديدة بدلاً من المكررة
            const missingCount = 4 - uniqueOptions.length;
            const additionalLetters = arabicLetters.filter(l => 
                !uniqueOptions.includes(l) && 
                l !== correctLetter
            ).sort(() => 0.5 - Math.random()).slice(0, missingCount);
            options.splice(0, options.length, ...uniqueOptions, ...additionalLetters);
        }
        
        const finalCorrectIndex = options.indexOf(correctLetter);
        if (finalCorrectIndex === -1) {
            console.error('الحرف الصحيح غير موجود في الخيارات النهائية!');
            continue;
        }
        
        questions.push({
            word: randomWord.word,
            letter: correctLetter,
            meaning: randomWord.meaning,
            options: options,
            correctIndex: finalCorrectIndex
        });
    }
    
    // التحقق من أن عدد الأسئلة كافٍ
    if (questions.length < totalQuestions) {
        console.warn(`تم إنشاء ${questions.length} سؤال فقط من ${totalQuestions} المطلوبة`);
        totalQuestions = questions.length;
    }
    
    console.log('تم إنشاء', questions.length, 'سؤال بدون تكرار');
    console.log('الكلمات المستخدمة:', usedWords);
}

// عرض السؤال التالي
function showNextQuestion() {
    if (currentQuestionNumber > totalQuestions) {
        endGame();
        return;
    }
    
    // التحقق من وجود أسئلة
    if (!questions || questions.length === 0) {
        console.error('لا توجد أسئلة!');
        generateQuestions();
    }
    
    // التحقق من وجود السؤال الحالي
    if (currentQuestionNumber - 1 >= questions.length) {
        console.error('السؤال غير موجود!');
        endGame();
        return;
    }
    
    currentQuestion = questions[currentQuestionNumber - 1];
    
    // التحقق من وجود السؤال والخيارات
    if (!currentQuestion) {
        console.error('السؤال الحالي غير موجود!');
        endGame();
        return;
    }
    
    if (!currentQuestion.options || currentQuestion.options.length === 0) {
        console.error('لا توجد خيارات للسؤال!', currentQuestion);
        // إعادة إنشاء السؤال
        generateQuestions();
        if (questions.length > 0) {
            currentQuestion = questions[currentQuestionNumber - 1];
        } else {
            console.error('فشل إنشاء الأسئلة!');
            return;
        }
    }
    
    // تحديث السؤال
    const questionTypeEl = document.getElementById('questionType');
    const questionMainEl = document.getElementById('questionMain');
    const questionHintEl = document.getElementById('questionHint');
    
    if (questionTypeEl) {
        questionTypeEl.textContent = 'اختر الحرف الصحيح';
    }
    if (questionMainEl) {
        questionMainEl.textContent = currentQuestion.word;
    }
    if (questionHintEl) {
        questionHintEl.textContent = `كلمة تبدأ بحرف: ${currentQuestion.meaning}`;
    }
    
    // عرض الخيارات - استخدام setTimeout للتأكد من أن DOM جاهز
    // التأكد من أن الخيارات موجودة قبل العرض
    if (!currentQuestion.options || currentQuestion.options.length === 0) {
        console.error('لا توجد خيارات قبل عرض السؤال!', currentQuestion);
        // إعادة إنشاء السؤال
        generateQuestions();
        if (questions.length > 0 && currentQuestionNumber <= questions.length) {
            currentQuestion = questions[currentQuestionNumber - 1];
        } else {
            console.error('فشل إنشاء الأسئلة بعد إعادة المحاولة!');
            return;
        }
    }
    
    // مسح التعليقات
    const feedback = document.getElementById('feedback');
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'feedback empty';
    }
    
    // تحديث شريط التقدم
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const progress = (currentQuestionNumber / totalQuestions) * 100;
        progressFill.style.width = progress + '%';
    }
    
    // عرض الخيارات - استخدام setTimeout للتأكد من أن DOM جاهز
    setTimeout(() => {
        displayOptions();
    }, 100);
}

// عرض الخيارات
function displayOptions() {
    console.log('displayOptions called');
    console.log('currentQuestion:', currentQuestion);
    
    const optionsContainer = document.getElementById('answerOptions');
    
    if (!optionsContainer) {
        console.error('عنصر answerOptions غير موجود في DOM!');
        // محاولة إيجاده مرة أخرى
        setTimeout(() => {
            const retryContainer = document.getElementById('answerOptions');
            if (retryContainer) {
                console.log('تم العثور على answerOptions في المحاولة الثانية');
                displayOptions();
            } else {
                console.error('فشل العثور على answerOptions حتى بعد المحاولة الثانية');
            }
        }, 200);
        return;
    }
    
    if (!currentQuestion) {
        console.error('currentQuestion غير معرف!');
        return;
    }
    
    if (!currentQuestion.options || currentQuestion.options.length === 0) {
        console.error('لا توجد خيارات للعرض!', currentQuestion);
        // إنشاء خيارات افتراضية
        currentQuestion.options = ['أ', 'ب', 'ت', 'ث'];
        currentQuestion.correctIndex = 0;
    }
    
    console.log('عرض الخيارات:', currentQuestion.options);
    console.log('عدد الخيارات:', currentQuestion.options.length);
    
    // مسح الخيارات السابقة
    optionsContainer.innerHTML = '';
    optionsContainer.style.display = 'grid'; // التأكد من أن العرض grid
    
    // إنشاء الأزرار
    let buttonsCreated = 0;
    currentQuestion.options.forEach((option, index) => {
        if (!option || option.trim() === '') {
            console.warn('خيار فارغ في الفهرس:', index);
            return;
        }
        
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.textContent = option;
        button.setAttribute('data-index', index);
        button.style.cssText = 'padding: 25px; font-size: 32px; border: 3px solid #667eea; border-radius: 15px; background: white; cursor: pointer; min-height: 100px; display: flex; align-items: center; justify-content: center;';
        button.onclick = function() {
            checkAnswer(index);
        };
        
        optionsContainer.appendChild(button);
        buttonsCreated++;
        console.log('تم إنشاء زر:', option, 'في الفهرس:', index);
    });
    
    console.log('تم إنشاء', buttonsCreated, 'زر من', currentQuestion.options.length, 'خيار');
    
    // التحقق من أن الخيارات تم إنشاؤها
    const createdButtons = optionsContainer.querySelectorAll('.answer-option');
    console.log('عدد الأزرار المنشأة:', createdButtons.length);
    
    if (createdButtons.length === 0) {
        console.error('فشل إنشاء الخيارات!');
        // محاولة إصلاح: إنشاء خيارات افتراضية مباشرة
        const defaultOptions = currentQuestion.options || ['أ', 'ب', 'ت', 'ث'];
        defaultOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-option';
            button.style.cssText = 'padding: 25px; font-size: 32px; border: 3px solid #667eea; border-radius: 15px; background: white; cursor: pointer;';
            button.textContent = option;
            button.onclick = function() {
                checkAnswer(index);
            };
            optionsContainer.appendChild(button);
        });
    } else {
        console.log('✅ تم إنشاء', createdButtons.length, 'خيار بنجاح');
    }
}

// فحص الإجابة
function checkAnswer(selectedIndex) {
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.answer-option');
    
    // تعطيل جميع الأزرار
    buttons.forEach(btn => {
        btn.classList.add('disabled');
    });
    
    if (selectedIndex === currentQuestion.correctIndex) {
        // إجابة صحيحة
        correctAnswers++;
        score += 10;
        // تحديث window للوصول من task_timer.js
        window.correctAnswers = correctAnswers;
        window.score = score;
        feedback.textContent = '🎉 ممتاز! إجابة صحيحة';
        feedback.className = 'feedback correct';
        
        // تمييز الإجابة الصحيحة
        buttons[selectedIndex].classList.add('correct');
        
        playSound('success');
    } else {
        // إجابة خاطئة
        feedback.textContent = `❌ خطأ! الحرف الصحيح هو: ${currentQuestion.letter}`;
        feedback.className = 'feedback incorrect';
        
        // تمييز الإجابة الخاطئة والصحيحة
        buttons[selectedIndex].classList.add('incorrect');
        buttons[currentQuestion.correctIndex].classList.add('correct');
        
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
    console.log('🎮 endGame called (arabic_game)');
    let earnedBadges = [];
    console.log('Score:', score, 'Correct:', correctAnswers, 'Total:', totalQuestions);
    
    // التأكد من تحديث window.currentQuestionNumber قبل حفظ النتائج
    window.currentQuestionNumber = currentQuestionNumber;
    window.totalQuestions = totalQuestions;
    window.correctAnswers = correctAnswers;
    
    // تحديد أننا نغادر بشكل مقصود
    arabicIsNavigatingAway = true;
    
    // إيقاف المؤقت
    if (typeof stopTaskTimer === 'function') {
        stopTaskTimer();
    }
    
    // حفظ النتائج في قاعدة البيانات
    console.log('💾 محاولة حفظ النتائج...', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        allQuestionsAnswered: currentQuestionNumber > totalQuestions
    });
    if (typeof saveScoreAndComplete === 'function' || typeof window.saveScoreAndComplete === 'function') {
        const saveFunction = saveScoreAndComplete || window.saveScoreAndComplete;
        try {
            const result = await saveFunction();
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
    } else {
        console.error('❌ saveScoreAndComplete function not found!');
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
    if (type === 'success') {
        console.log('Success sound');
    } else if (type === 'error') {
        console.log('Error sound');
    }
}

// العودة للصفحة السابقة
async function goBack() {
    // تحديد أننا نغادر بشكل مقصود
    arabicIsNavigatingAway = true;
    
    // حفظ الجلسة كمتوقفة قبل الرجوع
    if (arabicHasStartedGame) {
        console.log('💾 حفظ الجلسة كمتوقفة قبل الرجوع...');
        await arabicSavePausedSession();
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

// زر الرجوع داخل اللعبة مع حفظ المهمة كمتوقفة إذا لم تكتمل
async function goBackWithConfirm() {
    console.log('🔙 [arabic_game] goBackWithConfirm called', { arabicHasStartedGame });
    
    // التحقق إن كانت شاشة النهاية ظاهرة (المهمة مكتملة)
    const gameOverScreen = document.getElementById('gameOverScreen');
    const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
    
    // دائماً اطلب التأكيد قبل الخروج
    const confirmLeave = confirm('هل أنت متأكد؟ سيتم فقدان التقدم.');
    if (!confirmLeave) {
        console.log('❌ [arabic_game] المستخدم ألغى الرجوع');
        return;
    }
    
    // حفظ التقدم الحالي كمهمة متوقفة إذا لم تنته اللعبة
    if (!isGameOverVisible && arabicHasStartedGame) {
        try {
            await arabicSavePausedSession();
            console.log('✅ [arabic_game] تم حفظ المهمة كمتوقفة من زر الرجوع الداخلي');
        } catch (e) {
            console.error('❌ [arabic_game] خطأ في حفظ حالة المهمة من زر الرجوع:', e);
        }
    }
    
    // في جميع الأحوال نرجع لصفحة الطفل
    goBack();
}

// ربط الدوال مع window لتفادي مشاكل النطاق
window.goBackWithConfirm = goBackWithConfirm;
window.goBack = goBack;

