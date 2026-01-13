// التبديل بين نماذج تسجيل الدخول وإنشاء الحساب
document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authContainer = document.querySelector('.auth-container');

    // التبديل إلى نموذج تسجيل الدخول
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        if (authContainer) {
            authContainer.classList.add('login-mode');
            authContainer.classList.remove('signup-mode');
        }
        clearAllErrors();
        clearAllMessages();
    });

    // التبديل إلى نموذج إنشاء الحساب
    signupTab.addEventListener('click', function() {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        if (authContainer) {
            authContainer.classList.add('signup-mode');
            authContainer.classList.remove('login-mode');
        }
        clearAllErrors();
        clearAllMessages();
    });

    // تعيين الحالة الأولية
    if (authContainer && loginForm.classList.contains('active')) {
        authContainer.classList.add('login-mode');
    }

    // معالجة نموذج تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // معالجة نموذج إنشاء الحساب
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignup();
    });

    // التحقق من صحة البيانات أثناء الكتابة
    setupRealTimeValidation();
});

// إظهار/إخفاء كلمة المرور
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// معالجة تسجيل الدخول
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // مسح الأخطاء السابقة
    clearLoginErrors();
    clearMessage('loginMessage');

    let isValid = true;

    // التحقق من البريد الإلكتروني
    if (!email) {
        showError('loginEmailError', 'يرجى إدخال البريد الإلكتروني');
        markFieldError('loginEmail');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('loginEmailError', 'البريد الإلكتروني غير صحيح');
        markFieldError('loginEmail');
        isValid = false;
    }

    // التحقق من كلمة المرور
    if (!password) {
        showError('loginPasswordError', 'يرجى إدخال كلمة المرور');
        markFieldError('loginPassword');
        isValid = false;
    } else if (password.length < 6) {
        showError('loginPasswordError', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        markFieldError('loginPassword');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // إرسال البيانات إلى الخادم
    const loginData = {
        email: email,
        password: password,
        rememberMe: rememberMe
    };

    // إرسال طلب تسجيل الدخول
    showMessage('loginMessage', 'جاري تسجيل الدخول...', 'success');
    simulateLoginRequest(loginData);
}

// معالجة إنشاء الحساب
function handleSignup() {
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const gender = document.getElementById('signupGender').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // مسح الأخطاء السابقة
    clearSignupErrors();
    clearMessage('signupMessage');

    let isValid = true;

    // التحقق من الاسم الأول
    if (!firstName) {
        showError('signupFirstNameError', 'يرجى إدخال الاسم الأول');
        markFieldError('signupFirstName');
        isValid = false;
    } else if (firstName.length < 2) {
        showError('signupFirstNameError', 'الاسم الأول يجب أن يكون حرفين على الأقل');
        markFieldError('signupFirstName');
        isValid = false;
    }

    // التحقق من الاسم الأخير
    if (!lastName) {
        showError('signupLastNameError', 'يرجى إدخال الاسم الأخير');
        markFieldError('signupLastName');
        isValid = false;
    } else if (lastName.length < 2) {
        showError('signupLastNameError', 'الاسم الأخير يجب أن يكون حرفين على الأقل');
        markFieldError('signupLastName');
        isValid = false;
    }

    // التحقق من البريد الإلكتروني
    if (!email) {
        showError('signupEmailError', 'يرجى إدخال البريد الإلكتروني');
        markFieldError('signupEmail');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signupEmailError', 'البريد الإلكتروني غير صحيح');
        markFieldError('signupEmail');
        isValid = false;
    }

    // التحقق من رقم الهاتف
    if (!phone) {
        showError('signupPhoneError', 'يرجى إدخال رقم الهاتف');
        markFieldError('signupPhone');
        isValid = false;
    } else if (!isValidPhone(phone)) {
        showError('signupPhoneError', 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 07 ويتكون من 10 أرقام)');
        markFieldError('signupPhone');
        isValid = false;
    }

    // التحقق من الجنس
    if (!gender) {
        showError('signupGenderError', 'يرجى اختيار الجنس');
        markFieldError('signupGender');
        isValid = false;
    }

    // التحقق من كلمة المرور
    if (!password) {
        showError('signupPasswordError', 'يرجى إدخال كلمة المرور');
        markFieldError('signupPassword');
        isValid = false;
    } else if (password.length < 8) {
        showError('signupPasswordError', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        markFieldError('signupPassword');
        isValid = false;
    } else if (!isStrongPassword(password)) {
        showError('signupPasswordError', 'كلمة المرور يجب أن تحتوي على أحرف وأرقام');
        markFieldError('signupPassword');
        isValid = false;
    }

    // التحقق من تأكيد كلمة المرور
    if (!confirmPassword) {
        showError('signupConfirmPasswordError', 'يرجى تأكيد كلمة المرور');
        markFieldError('signupConfirmPassword');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('signupConfirmPasswordError', 'كلمة المرور غير متطابقة');
        markFieldError('signupConfirmPassword');
        isValid = false;
    }

    // التحقق من الموافقة على الشروط
    if (!agreeTerms) {
        showError('termsError', 'يجب الموافقة على الشروط والأحكام');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // إرسال البيانات إلى الخادم
    const signupData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        gender: gender,
        password: password
    };

    // إرسال طلب إنشاء الحساب
    showMessage('signupMessage', 'جاري إنشاء الحساب...', 'success');
    simulateSignupRequest(signupData);
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// التحقق من صحة الاسم (يقبل الأحرف العربية والإنجليزية)
function isValidName(name) {
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
    return nameRegex.test(name);
}

// التحقق من صحة رقم الهاتف
function isValidPhone(phone) {
    const phoneRegex = /^07\d{8}$/;
    return phoneRegex.test(phone);
}

// التحقق من قوة كلمة المرور
function isStrongPassword(password) {
    // يجب أن تحتوي على أحرف وأرقام على الأقل
    const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(password);
    const hasNumbers = /\d/.test(password);
    return hasLetters && hasNumbers;
}

// إظهار رسالة خطأ
function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// إظهار رسالة نجاح/خطأ عامة
function showMessage(messageId, message, type) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
    }
}

// مسح رسالة
function clearMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.textContent = '';
        messageElement.className = 'form-message';
    }
}

// تحديد حقل به خطأ
function markFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
    }
}

// إزالة علامة الخطأ من حقل
function removeFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
    }
}

// مسح جميع أخطاء تسجيل الدخول
function clearLoginErrors() {
    clearError('loginEmailError');
    clearError('loginPasswordError');
    removeFieldError('loginEmail');
    removeFieldError('loginPassword');
}

// مسح جميع أخطاء إنشاء الحساب
function clearSignupErrors() {
    clearError('signupFirstNameError');
    clearError('signupLastNameError');
    clearError('signupEmailError');
    clearError('signupPhoneError');
    clearError('signupGenderError');
    clearError('signupPasswordError');
    clearError('signupConfirmPasswordError');
    clearError('termsError');
    removeFieldError('signupFirstName');
    removeFieldError('signupLastName');
    removeFieldError('signupEmail');
    removeFieldError('signupPhone');
    removeFieldError('signupGender');
    removeFieldError('signupPassword');
    removeFieldError('signupConfirmPassword');
}

// مسح خطأ محدد
function clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// مسح جميع الأخطاء
function clearAllErrors() {
    clearLoginErrors();
    clearSignupErrors();
}

// مسح جميع الرسائل
function clearAllMessages() {
    clearMessage('loginMessage');
    clearMessage('signupMessage');
}

// إعداد التحقق الفوري من صحة البيانات
function setupRealTimeValidation() {
    // التحقق من البريد الإلكتروني في تسجيل الدخول
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                showError('loginEmailError', 'البريد الإلكتروني غير صحيح');
                markFieldError('loginEmail');
            } else {
                clearError('loginEmailError');
                removeFieldError('loginEmail');
            }
        });
    }

    // التحقق من البريد الإلكتروني في إنشاء الحساب
    const signupEmail = document.getElementById('signupEmail');
    if (signupEmail) {
        signupEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                showError('signupEmailError', 'البريد الإلكتروني غير صحيح');
                markFieldError('signupEmail');
            } else {
                clearError('signupEmailError');
                removeFieldError('signupEmail');
            }
        });
    }

    // التحقق من رقم الهاتف
    const signupPhone = document.getElementById('signupPhone');
    if (signupPhone) {
        signupPhone.addEventListener('blur', function() {
            const phone = this.value.trim();
            if (phone && !isValidPhone(phone)) {
                showError('signupPhoneError', 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 07 ويتكون من 10 أرقام)');
                markFieldError('signupPhone');
            } else {
                clearError('signupPhoneError');
                removeFieldError('signupPhone');
            }
        });
    }

    // التحقق من تطابق كلمة المرور
    const signupPassword = document.getElementById('signupPassword');
    const signupConfirmPassword = document.getElementById('signupConfirmPassword');
    
    if (signupPassword && signupConfirmPassword) {
        signupConfirmPassword.addEventListener('blur', function() {
            const password = signupPassword.value;
            const confirmPassword = this.value;
            if (confirmPassword && password !== confirmPassword) {
                showError('signupConfirmPasswordError', 'كلمة المرور غير متطابقة');
                markFieldError('signupConfirmPassword');
            } else {
                clearError('signupConfirmPasswordError');
                removeFieldError('signupConfirmPassword');
            }
        });
    }
}

// دالة طلب تسجيل الدخول
async function simulateLoginRequest(loginData) {
    try {
        const response = await fetch('../api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // حفظ بيانات المستخدم في localStorage
            if (result.user) {
                localStorage.setItem('parent_id', result.user.id);
                sessionStorage.setItem('parent_id', result.user.id);
                localStorage.setItem('user_name', result.user.name);
                localStorage.setItem('user_email', result.user.email);
            }
            
            showMessage('loginMessage', 'تم تسجيل الدخول بنجاح! جاري الانتقال...', 'success');
            setTimeout(() => {
                window.location.href = '../html/parent_dashboard.html';
            }, 1500);
        } else {
            showMessage('loginMessage', result.message || 'فشل تسجيل الدخول', 'error');
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showMessage('loginMessage', 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.', 'error');
    }
}

// دالة طلب إنشاء الحساب
async function simulateSignupRequest(signupData) {
    try {
        console.log('إرسال بيانات إنشاء الحساب:', signupData);
        
        const response = await fetch('../api/signup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData)
        });
        
        console.log('حالة الاستجابة:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('نتيجة الاستجابة:', result);
        
        if (result.success) {
            // حفظ بيانات المستخدم في localStorage
            if (result.user) {
                localStorage.setItem('parent_id', result.user.id);
                localStorage.setItem('user_name', result.user.name);
                localStorage.setItem('user_email', result.user.email);
            }
            
            showMessage('signupMessage', 'تم إنشاء الحساب بنجاح! جاري الانتقال...', 'success');
            
            // الانتقال إلى لوحة تحكم الأهل بعد ثانيتين
            setTimeout(() => {
                window.location.href = '../html/parent_dashboard.html';
            }, 2000);
        } else {
            // إظهار رسالة الخطأ مع تفاصيل إضافية للتطوير
            const errorMsg = result.message || 'فشل إنشاء الحساب';
            console.error('خطأ في إنشاء الحساب:', result);
            showMessage('signupMessage', errorMsg + (result.debug ? ' (راجع Console للتفاصيل)' : ''), 'error');
        }
    } catch (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        showMessage('signupMessage', 'حدث خطأ أثناء إنشاء الحساب. يرجى فتح Console (F12) لمعرفة التفاصيل.', 'error');
    }
}

