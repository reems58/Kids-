<?php
// ملف تشخيص مشكلة إنشاء الحساب
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

require_once 'config/database.php';

$debug = [];

try {
    // 1. التحقق من الاتصال
    $debug['connection'] = 'نجح';
    
    // 2. التحقق من وجود الجدول
    $stmt = $pdo->query("SHOW TABLES LIKE 'parents'");
    $tableExists = $stmt->rowCount() > 0;
    $debug['table_exists'] = $tableExists;
    
    if (!$tableExists) {
        echo json_encode([
            'success' => false,
            'message' => 'الجدول parents غير موجود',
            'debug' => $debug
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    // 3. التحقق من الأعمدة
    $stmt = $pdo->query("DESCRIBE parents");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'Field');
    $debug['columns'] = $columnNames;
    $debug['has_gender'] = in_array('gender', $columnNames);
    
    // 4. اختبار البيانات
    $testData = [
        'first_name' => 'اسم',
        'last_name' => 'العائلة',
        'email' => 'test' . time() . '@example.com',
        'phone' => '07' . rand(10000000, 99999999),
        'gender' => 'أب',
        'password' => 'Test1234'
    ];
    
    $debug['test_data'] = $testData;
    
    // 5. التحقق من صحة البيانات
    $first_name = trim($testData['first_name']);
    $last_name = trim($testData['last_name']);
    $email = trim($testData['email']);
    $phone = trim($testData['phone']);
    $gender = trim($testData['gender']);
    $password = $testData['password'];
    
    // التحقق من الجنس
    if (!in_array($gender, ['أب', 'أم'])) {
        $debug['gender_check'] = 'فشل: ' . $gender;
    } else {
        $debug['gender_check'] = 'نجح';
    }
    
    // 6. محاولة الإدراج
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO parents (first_name, last_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)";
    $debug['sql'] = $sql;
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$first_name, $last_name, $email, $phone, $gender, $hashedPassword]);
    
    $debug['execute_result'] = $result;
    
    if ($result) {
        $userId = $pdo->lastInsertId();
        $debug['user_id'] = $userId;
        
        // حذف السجل التجريبي
        $stmt = $pdo->prepare("DELETE FROM parents WHERE id = ?");
        $stmt->execute([$userId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'كل شيء يعمل بشكل صحيح!',
            'debug' => $debug
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        $errorInfo = $stmt->errorInfo();
        $debug['error_info'] = $errorInfo;
        
        echo json_encode([
            'success' => false,
            'message' => 'فشل في الإدراج',
            'debug' => $debug
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
    
} catch(PDOException $e) {
    $debug['error'] = $e->getMessage();
    $debug['error_code'] = $e->getCode();
    $debug['error_file'] = $e->getFile();
    $debug['error_line'] = $e->getLine();
    
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ: ' . $e->getMessage(),
        'debug' => $debug
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch(Exception $e) {
    $debug['error'] = $e->getMessage();
    
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ عام: ' . $e->getMessage(),
        'debug' => $debug
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>

