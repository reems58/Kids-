<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['parent_id']) && !isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'غير مسجل دخول']);
    exit;
}

$parent_id = $_SESSION['parent_id'] ?? $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("
        SELECT id, first_name, last_name, email, phone, gender, created_at 
        FROM parents 
        WHERE id = ?
    ");
    
    $stmt->execute([$parent_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $user['name'] = $user['first_name'] . ' ' . $user['last_name'];
        echo json_encode([
            'success' => true,
            'user' => $user
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'المستخدم غير موجود'
        ], JSON_UNESCAPED_UNICODE);
    }
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب البيانات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
