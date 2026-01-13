<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// قراءة البيانات المرسلة
$data = json_decode(file_get_contents('php://input'), true);

// التحقق من وجود البيانات
if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
    ]);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];
$rememberMe = isset($data['rememberMe']) ? $data['rememberMe'] : false;

try {
    // البحث عن المستخدم
    $stmt = $pdo->prepare("SELECT * FROM parents WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        ]);
        exit;
    }

    // التحقق من كلمة المرور
    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        ]);
        exit;
    }

    // بدء الجلسة
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['parent_id'] = $user['id']; // للأهل
    $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['user_email'] = $user['email'];
    
    // إذا كان تذكرني مفعّل، إنشاء cookie
    if ($rememberMe) {
        $token = bin2hex(random_bytes(32));
        setcookie('remember_token', $token, time() + (86400 * 30), '/'); // 30 يوم
        // يمكن حفظ الـ token في قاعدة البيانات لاحقًا
    }

    echo json_encode([
        'success' => true,
        'message' => 'تم تسجيل الدخول بنجاح',
        'user' => [
            'id' => $user['id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email']
        ]
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تسجيل الدخول'
    ]);
}
?>

