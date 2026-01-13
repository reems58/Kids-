<?php
// ملف اختبار الاتصال بقاعدة البيانات
header('Content-Type: application/json; charset=utf-8');

require_once 'config/database.php';

try {
    // اختبار الاتصال
    $stmt = $pdo->query("SELECT 1");
    
    // اختبار وجود الجدول
    $stmt = $pdo->query("SHOW TABLES LIKE 'parents'");
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        // اختبار بنية الجدول
        $stmt = $pdo->query("DESCRIBE parents");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo json_encode([
            'success' => true,
            'message' => 'الاتصال بقاعدة البيانات ناجح',
            'database' => 'kids_learning',
            'table_exists' => true,
            'columns' => $columns
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'قاعدة البيانات متصلة ولكن جدول parents غير موجود',
            'database' => 'kids_learning',
            'table_exists' => false,
            'solution' => 'قم بتنفيذ ملف database.sql في phpMyAdmin'
        ]);
    }
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في الاتصال: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'solution' => 'تأكد من: 1) MySQL يعمل في XAMPP 2) قاعدة البيانات kids_learning موجودة 3) جدول parents موجود'
    ]);
}
?>

