// لعبة تكوين الكلمات (ترتيب الحروف)
let currentQuestion = null;
let score = 0;
let correctAnswers = 0;
let currentQuestionNumber = 1;
let totalQuestions = 10;
let questions = [];
let playerAge = 7;
let selectedLetters = []; // الحروف المختارة في الفتحات
let availableLetters = []; // الحروف المتاحة
let isNavigatingAway = false; // لتخطي beforeunload عند الرجوع المقصود
let hasStartedGame = false;

// تعريف الدوال في النطاق العام مسبقاً (قبل استخدامها في HTML)
let goBack, goBackWithConfirm;

// كلمات بسيطة للأطفال الصغار (4-6 سنوات)
const simpleWords = [
    { word: 'أب', meaning: 'أب' },
    { word: 'أم', meaning: 'أم' },
    { word: 'باب', meaning: 'باب' },
    { word: 'بيت', meaning: 'بيت' },
    { word: 'دب', meaning: 'دب' },
    { word: 'سمك', meaning: 'سمك' },
    { word: 'فيل', meaning: 'فيل' },
    { word: 'قمر', meaning: 'قمر' },
    { word: 'لبن', meaning: 'لبن' },
    { word: 'موز', meaning: 'موز' },
    { word: 'نمر', meaning: 'نمر' },
    { word: 'يد', meaning: 'يد' }
];

// كلمات متوسطة (7-9 سنوات)
const mediumWords = [
    { word: 'أسد', meaning: 'أسد' },
    { word: 'بطة', meaning: 'بطة' },
    { word: 'تاج', meaning: 'تاج' },
    { word: 'جمل', meaning: 'جمل' },
    { word: 'حوت', meaning: 'حوت' },
    { word: 'حصان', meaning: 'حصان' },
    { word: 'خروف', meaning: 'خروف' },
    { word: 'ديك', meaning: 'ديك' },
    { word: 'رجل', meaning: 'رجل' },
    { word: 'سمك', meaning: 'سمك' },
    { word: 'شمس', meaning: 'شمس' },
    { word: 'فيل', meaning: 'فيل' },
    { word: 'قمر', meaning: 'قمر' },
    { word: 'كتاب', meaning: 'كتاب' },
    { word: 'لبن', meaning: 'لبن' },
    { word: 'موز', meaning: 'موز' }
];

// كلمات متقدمة (10-12 سنة)
const advancedWords = [
    { word: 'أرنب', meaning: 'أرنب' },
    { word: 'برتقال', meaning: 'برتقال' },
    { word: 'تفاح', meaning: 'تفاح' },
    { word: 'جزر', meaning: 'جزر' },
    { word: 'حوت', meaning: 'حوت' },
    { word: 'خنفساء', meaning: 'خنفساء' },
    { word: 'دولفين', meaning: 'دولفين' },
    { word: 'زرافة', meaning: 'زرافة' },
    { word: 'شجرة', meaning: 'شجرة' },
    { word: 'عصفور', meaning: 'عصفور' },
    { word: 'فراشة', meaning: 'فراشة' },
    { word: 'قرد', meaning: 'قرد' },
    { word: 'كوب', meaning: 'كوب' },
    { word: 'ليمون', meaning: 'ليمون' },
    { word: 'مدرسة', meaning: 'مدرسة' }
];

// بدء اللعبة
document.addEventListener('DOMContentLoaded', function() {
    // ربط زر الرجوع
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔙 Back button clicked');
            if (typeof goBackWithConfirm === 'function') {
                goBackWithConfirm();
            } else {
                console.error('❌ goBackWithConfirm is not a function!');
                alert('خطأ: الدالة غير متاحة. يرجى تحديث الصفحة.');
            }
        });
    } else {
        console.warn('⚠️ Back button not found!');
    }
    
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

// تحديث عنوان اللعبة
function updateGameTitle() {
    const titleElement = document.querySelector('.game-header h1');
    if (titleElement) {
        titleElement.textContent = `🎮 لعبة تكوين الكلمات - عمر ${playerAge} سنوات`;
    }
}

// تحديد قائمة الكلمات حسب العمر
function getWordListByAge(age) {
    if (age >= 4 && age <= 6) {
        return simpleWords;
    } else if (age >= 7 && age <= 9) {
        return mediumWords;
    } else if (age >= 10 && age <= 12) {
        return advancedWords;
    }
    return simpleWords;
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
    const wordList = getWordListByAge(playerAge);
    
    // اختيار 10 كلمات عشوائية
    const shuffledWords = [...wordList].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < totalQuestions && i < shuffledWords.length; i++) {
        questions.push(shuffledWords[i]);
    }
}

// عرض السؤال التالي
function showNextQuestion() {
    if (currentQuestionNumber > totalQuestions) {
        endGame();
        return;
    }
    
    currentQuestion = questions[currentQuestionNumber - 1];
    selectedLetters = [];
    availableLetters = [];
    
    // تحديث النص
    document.getElementById('wordHint').textContent = `كلمة تعني: ${currentQuestion.meaning}`;
    
    // تحويل الكلمة إلى مصفوفة حروف وخلطها
    const wordLetters = currentQuestion.word.split('');
    availableLetters = [...wordLetters].sort(() => 0.5 - Math.random());
    
    // إنشاء الفتحات والحروف
    displayAnswerSlots();
    displayLetterOptions();
    
    // مسح التعليقات
    const feedback = document.getElementById('feedback');
    feedback.textContent = '';
    feedback.className = 'feedback empty';
    
    // تحديث شريط التقدم
    const progress = (currentQuestionNumber / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// عرض فتحات الإجابة
function displayAnswerSlots() {
    const slotsContainer = document.getElementById('answerSlots');
    slotsContainer.innerHTML = '';
    
    selectedLetters = new Array(currentQuestion.word.length).fill(null);
    
    for (let i = 0; i < currentQuestion.word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'answer-slot';
        slot.id = `slot-${i}`;
        slot.onclick = () => removeLetterFromSlot(i);
        slotsContainer.appendChild(slot);
    }
}

// عرض خيارات الحروف
function displayLetterOptions() {
    const optionsContainer = document.getElementById('letterOptions');
    optionsContainer.innerHTML = '';
    
    availableLetters.forEach((letter, index) => {
        const option = document.createElement('div');
        option.className = 'letter-option';
        option.textContent = letter;
        option.id = `letter-${index}`;
        option.onclick = () => selectLetter(letter, index);
        optionsContainer.appendChild(option);
    });
}

// اختيار حرف
function selectLetter(letter, letterIndex) {
    // البحث عن أول فتحة فارغة
    const emptySlotIndex = selectedLetters.findIndex(slot => slot === null);
    
    if (emptySlotIndex !== -1) {
        // وضع الحرف في الفتحة
        selectedLetters[emptySlotIndex] = letter;
        
        // تحديث عرض الفتحة
        const slot = document.getElementById(`slot-${emptySlotIndex}`);
        slot.textContent = letter;
        slot.classList.add('filled');
        
        // تعطيل الحرف المستخدم
        const letterOption = document.getElementById(`letter-${letterIndex}`);
        letterOption.classList.add('used');
        
        // التحقق من اكتمال الإجابة
        checkIfComplete();
    }
}

// إزالة حرف من فتحة
function removeLetterFromSlot(slotIndex) {
    if (selectedLetters[slotIndex] !== null) {
        const letter = selectedLetters[slotIndex];
        selectedLetters[slotIndex] = null;
        
        // مسح الفتحة
        const slot = document.getElementById(`slot-${slotIndex}`);
        slot.textContent = '';
        slot.classList.remove('filled');
        
        // إعادة تفعيل الحرف
        const letterOptions = document.querySelectorAll('.letter-option');
        letterOptions.forEach(option => {
            if (option.textContent === letter && option.classList.contains('used')) {
                option.classList.remove('used');
                return;
            }
        });
    }
}

// التحقق من اكتمال الإجابة
function checkIfComplete() {
    const isComplete = selectedLetters.every(letter => letter !== null);
    if (isComplete) {
        // يمكن تفعيل زر التحقق تلقائياً أو إظهار رسالة
    }
}

// فحص الإجابة
function checkAnswer() {
    const userAnswer = selectedLetters.join('');
    const feedback = document.getElementById('feedback');
    
    // التحقق من اكتمال الإجابة
    if (selectedLetters.some(letter => letter === null)) {
        feedback.textContent = '⚠️ الرجاء ملء جميع الفتحات';
        feedback.className = 'feedback incorrect';
        return;
    }
    
    if (userAnswer === currentQuestion.word) {
        // إجابة صحيحة
        correctAnswers++;
        score += 10;
        // تحديث window للمتغيرات
        window.score = score;
        window.correctAnswers = correctAnswers;
        feedback.textContent = '🎉 ممتاز! إجابة صحيحة';
        feedback.className = 'feedback correct';
        
        // تلوين الفتحات باللون الأخضر
        for (let i = 0; i < selectedLetters.length; i++) {
            const slot = document.getElementById(`slot-${i}`);
            slot.classList.add('correct');
        }
        
        playSound('success');
        
        // الانتقال للسؤال التالي بعد ثانيتين
        setTimeout(() => {
            currentQuestionNumber++;
            // تحديث window.currentQuestionNumber
            window.currentQuestionNumber = currentQuestionNumber;
            showNextQuestion();
        }, 2000);
    } else {
        // إجابة خاطئة
        feedback.textContent = `❌ خطأ! الكلمة الصحيحة هي: ${currentQuestion.word}`;
        feedback.className = 'feedback incorrect';
        
        // تلوين الفتحات باللون الأحمر
        for (let i = 0; i < selectedLetters.length; i++) {
            const slot = document.getElementById(`slot-${i}`);
            if (selectedLetters[i] !== currentQuestion.word[i]) {
                slot.classList.add('incorrect');
            } else {
                slot.classList.add('correct');
            }
        }
        
        playSound('error');
        
        // إعادة بعد 3 ثواني
        setTimeout(() => {
            resetAnswer();
        }, 3000);
    }
    
    // تحديث الإحصائيات
    updateStats();
}

// إعادة الإجابة
function resetAnswer() {
    selectedLetters = new Array(currentQuestion.word.length).fill(null);
    
    // مسح الفتحات
    for (let i = 0; i < currentQuestion.word.length; i++) {
        const slot = document.getElementById(`slot-${i}`);
        slot.textContent = '';
        slot.classList.remove('filled', 'correct', 'incorrect');
    }
    
    // إعادة تفعيل جميع الحروف
    const letterOptions = document.querySelectorAll('.letter-option');
    letterOptions.forEach(option => {
        option.classList.remove('used');
    });
    
    // مسح التعليقات
    const feedback = document.getElementById('feedback');
    feedback.textContent = '';
    feedback.className = 'feedback empty';
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('questionNumber').textContent = `${currentQuestionNumber} / ${totalQuestions}`;
    document.getElementById('correctAnswers').textContent = correctAnswers;
}

// إنهاء اللعبة
async function endGame() {
    console.log('🎮 endGame called (arabic_word_formation)', {
        currentQuestionNumber: currentQuestionNumber,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers
    });
    
    // التأكد من تحديث window.currentQuestionNumber قبل حفظ النتائج
    window.currentQuestionNumber = currentQuestionNumber;
    window.totalQuestions = totalQuestions;
    window.correctAnswers = correctAnswers;
    
    // تحديد أننا نغادر بشكل مقصود (بعد حفظ النتائج)
    isNavigatingAway = true;
    
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
    console.log('saveScoreAndComplete function exists?', typeof saveScoreAndComplete === 'function');
    
    let earnedBadges = [];
    if (typeof saveScoreAndComplete === 'function') {
        try {
            const result = await saveScoreAndComplete();
            console.log('📊 نتيجة حفظ النتائج:', result);
            
            if (result && result.success) {
                console.log('✅ تم حفظ النتائج بنجاح!', {
                    stars: result.stars,
                    total_stars: result.total_stars,
                    badges: result.badges?.length || 0,
                    title: result.title
                });
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
goBack = async function(skipSave = false) {
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
goBackWithConfirm = async function() {
    console.log('🔙 goBackWithConfirm called');
    
    // التحقق من حالة اللعبة
    const gameOverScreen = document.getElementById('gameOverScreen');
    const isGameOverVisible = gameOverScreen && gameOverScreen.style.display !== 'none';
    
    // إذا انتهت اللعبة (كل الأسئلة تم حلها)، احفظ النتيجة مباشرة بدون رسالة
    if (isGameOverVisible) {
        console.log('✅ اللعبة انتهت - حفظ النتيجة والعودة مباشرة');
        // النتيجة محفوظة مسبقاً في endGame()، فقط نرجع
        isNavigatingAway = true;
        goBack(true); // تخطي الحفظ لأن النتيجة محفوظة مسبقاً
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

// ربط الدوال في النطاق العام
window.goBackWithConfirm = goBackWithConfirm;
window.goBack = goBack;

// التأكد من أن الدوال متاحة في النطاق العام
console.log('✅ Functions bound to window:', {
    goBackWithConfirm: typeof window.goBackWithConfirm,
    goBack: typeof window.goBack
});

