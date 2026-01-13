<?php
/**
 * جلب كل المحتوى التعليمي
 */
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../../config/database.php';
require_once 'check_auth.php';

// التحقق من تسجيل الدخول
checkAuth();

try {
    // جلب كل المحتوى
    $stmt = $pdo->prepare("
        SELECT 
            content_id,
            content_name,
            content_name_ar,
            title,
            topic,
            category,
            difficulty,
            min_age,
            max_age,
            icon,
            created_at
        FROM content
        ORDER BY content_name_ar ASC
    ");
    
    $stmt->execute();
    $content = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'content' => $content,
        'count' => count($content)
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    error_log("Get All Content Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب المحتوى: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

