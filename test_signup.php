<?php
// ملف اختبار إنشاء حساب
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config/database.php';

// بيانات تجريبية
$testData = [
    'first_name' => 'اسم',
    'last_name' => 'العائلة',
    'email' => 'test@example.com',
    'phone' => '0712345678',
    'gender' => 'أب',
    'password' => 'Test1234'
];

try {
    // التحقق من وجود الجدول والأعمدة
    $stmt = $pdo->query("DESCRIBE parents");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $hasGender = in_array('gender', $columns);
    
    if (!$hasGender) {
        echo json_encode([
            'success' => false,
            'message' => 'عمود gender غير موجود في الجدول',
            'columns' => $columns,
            'solution' => 'قم بتنفيذ: ALTER TABLE parents ADD COLUMN gender ENUM(\'أب\', \'أم\') NOT NULL AFTER password;'
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    // اختبار الإدراج
    $first_name = $testData['first_name'];
    $last_name = $testData['last_name'];
    $email = $testData['email'];
    $phone = $testData['phone'];
    $gender = $testData['gender'];
    $hashedPassword = password_hash($testData['password'], PASSWORD_DEFAULT);
    
    // حذف السجل التجريبي إذا كان موجوداً
    $stmt = $pdo->prepare("DELETE FROM parents WHERE email = ?");
    $stmt->execute([$email]);
    
    // محاولة الإدراج
    $stmt = $pdo->prepare("INSERT INTO parents (first_name, last_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)");
    $result = $stmt->execute([$first_name, $last_name, $email, $phone, $gender, $hashedPassword]);
    
    if ($result) {
        $userId = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'تم إنشاء الحساب التجريبي بنجاح',
            'user_id' => $userId,
            'columns' => $columns
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        
        // حذف السجل التجريبي
        $stmt = $pdo->prepare("DELETE FROM parents WHERE id = ?");
        $stmt->execute([$userId]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'فشل في إدراج البيانات',
            'error_info' => $stmt->errorInfo()
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ: ' . $e->getMessage(),
        'code' => $e->getCode(),
        'columns' => isset($columns) ? $columns : 'غير متاح'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>

