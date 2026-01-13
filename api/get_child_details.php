<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            child_id,
            child_name,
            age,
            gender,
            birth_date,
            profile_img,
            last_activity,
            total_time
        FROM children 
        WHERE child_id = ?
    ");
    
    $stmt->execute([$child_id]);
    $child = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$child) {
        echo json_encode(['success' => false, 'message' => 'الطفل غير موجود']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'child' => $child
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب البيانات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

