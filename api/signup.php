<?php
// تفعيل عرض الأخطاء للتطوير
error_reporting(E_ALL);
ini_set('display_errors', 0); // لا نعرض الأخطاء مباشرة، نرسلها في JSON
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// قراءة البيانات المرسلة
$data = json_decode(file_get_contents('php://input'), true);

// التحقق من وجود البيانات
if (!isset($data['first_name']) || !isset($data['last_name']) || !isset($data['email']) || !isset($data['phone']) || !isset($data['gender']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'يرجى إدخال جميع البيانات المطلوبة'
    ]);
    exit;
}

$first_name = trim($data['first_name']);
$last_name = trim($data['last_name']);
$email = trim($data['email']);
$phone = trim($data['phone']);
$gender = trim($data['gender']);
$password = $data['password'];

// التحقق من صحة البيانات
if (empty($first_name) || empty($last_name) || empty($email) || empty($phone) || empty($gender) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'يرجى إدخال جميع البيانات المطلوبة'
    ]);
    exit;
}

// التحقق من صحة الجنس
if (!in_array($gender, ['أب', 'أم'])) {
    echo json_encode([
        'success' => false,
        'message' => 'الجنس غير صحيح'
    ]);
    exit;
}

// التحقق من صحة الاسم الأول (الحد الأدنى للطول فقط)
if (strlen($first_name) < 2) {
    echo json_encode([
        'success' => false,
        'message' => 'الاسم الأول يجب أن يكون حرفين على الأقل'
    ]);
    exit;
}

// التحقق من صحة الاسم الأخير (الحد الأدنى للطول فقط)
if (strlen($last_name) < 2) {
    echo json_encode([
        'success' => false,
        'message' => 'الاسم الأخير يجب أن يكون حرفين على الأقل'
    ]);
    exit;
}

// التحقق من صحة البريد الإلكتروني
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'البريد الإلكتروني غير صحيح'
    ]);
    exit;
}

// التحقق من صحة رقم الهاتف (يبدأ بـ 07 ويتكون من 10 أرقام)
if (!preg_match('/^07\d{8}$/', $phone)) {
    echo json_encode([
        'success' => false,
        'message' => 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 07 ويتكون من 10 أرقام)'
    ]);
    exit;
}

// التحقق من قوة كلمة المرور
if (strlen($password) < 8) {
    echo json_encode([
        'success' => false,
        'message' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    ]);
    exit;
}

try {
    // التحقق من وجود البريد الإلكتروني
    $stmt = $pdo->prepare("SELECT id FROM parents WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'البريد الإلكتروني مستخدم بالفعل'
        ]);
        exit;
    }

    // التحقق من وجود رقم الهاتف
    $stmt = $pdo->prepare("SELECT id FROM parents WHERE phone = ?");
    $stmt->execute([$phone]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'رقم الهاتف مستخدم بالفعل'
        ]);
        exit;
    }

    // تشفير كلمة المرور
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // إدراج المستخدم الجديد
    $stmt = $pdo->prepare("INSERT INTO parents (first_name, last_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)");
    
    // تنفيذ الإدراج مع معالجة الأخطاء
    try {
        $result = $stmt->execute([$first_name, $last_name, $email, $phone, $gender, $hashedPassword]);
        
        if (!$result) {
            throw new Exception("فشل في إدراج البيانات");
        }
        
        $userId = $pdo->lastInsertId();
        
        if (!$userId) {
            throw new Exception("فشل في الحصول على معرف المستخدم");
        }
        
        // بدء الجلسة
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['user_id'] = $userId;
        $_SESSION['parent_id'] = $userId; // للأهل
        $_SESSION['user_name'] = $first_name . ' ' . $last_name;
        $_SESSION['user_email'] = $email;

        echo json_encode([
            'success' => true,
            'message' => 'تم إنشاء الحساب بنجاح',
            'user' => [
                'id' => $userId,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'name' => $first_name . ' ' . $last_name,
                'email' => $email
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $ex) {
        throw new PDOException("خطأ في إدراج البيانات: " . $ex->getMessage());
    }

} catch(PDOException $e) {
    // معالجة الأخطاء المختلفة
    $errorCode = $e->getCode();
    $errorMessage = $e->getMessage();
    
    // تسجيل الخطأ في ملف log (للتطوير فقط)
    error_log("Signup Error: " . $errorMessage . " (Code: " . $errorCode . ")");
    
    if ($errorCode == 23000) {
        // خطأ في التكرار (UNIQUE constraint)
        echo json_encode([
            'success' => false,
            'message' => 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل'
        ]);
    } else if ($errorCode == '42S02') {
        // الجدول غير موجود
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في قاعدة البيانات: الجدول غير موجود. يرجى التأكد من إنشاء الجدول'
        ]);
    } else if ($errorCode == '1049') {
        // قاعدة البيانات غير موجودة
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في قاعدة البيانات: قاعدة البيانات غير موجودة. يرجى إنشاء قاعدة البيانات أولاً'
        ]);
    } else if ($errorCode == '2002' || $errorCode == '1045') {
        // خطأ في الاتصال
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في الاتصال بقاعدة البيانات. يرجى التأكد من أن MySQL يعمل'
        ]);
    } else {
        // خطأ عام - إظهار رسالة واضحة
        $userMessage = 'حدث خطأ أثناء إنشاء الحساب';
        
        // فحص نوع الخطأ
        if (strpos($errorMessage, 'Unknown column') !== false) {
            if (strpos($errorMessage, 'gender') !== false) {
                $userMessage = 'عمود الجنس غير موجود في الجدول. يرجى إضافة العمود أولاً';
            } else {
                $userMessage = 'عمود مفقود في الجدول: ' . $errorMessage;
            }
        } else if (strpos($errorMessage, 'parents') !== false) {
            $userMessage = 'الجدول غير موجود';
        } else if (strpos($errorMessage, 'Data too long') !== false) {
            $userMessage = 'البيانات المدخلة طويلة جداً';
        }
        
        echo json_encode([
            'success' => false,
            'message' => $userMessage,
            'debug' => $errorMessage // فقط للتطوير - احذفه في الإنتاج
        ], JSON_UNESCAPED_UNICODE);
    }
} catch(Exception $e) {
    // معالجة الأخطاء العامة
    error_log("General Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
    ]);
}
?>

