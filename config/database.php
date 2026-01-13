<?php
// ملف الاتصال بقاعدة البيانات
$host = 'localhost';
$dbname = 'kids_learning';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // إرجاع JSON بدلاً من die لتتمكن من معالجته في API
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في الاتصال بقاعدة البيانات: ' . $e->getMessage() . '. يرجى التأكد من أن MySQL يعمل وأن قاعدة البيانات موجودة'
    ]);
    exit;
}
?>

