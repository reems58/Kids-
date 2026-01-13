<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$parent_id = isset($_GET['parent_id']) ? (int)$_GET['parent_id'] : 0;

if (!$parent_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الأهل مطلوب']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            c.child_id,
            c.child_name,
            c.age,
            c.gender,
            c.birth_date,
            c.profile_img,
            c.last_activity,
            c.total_time,
            c.total_stars,
            c.title,
            (SELECT COUNT(*) FROM sessions WHERE child_id = c.child_id AND status = 'completed') as session_count,
            c.created_at
        FROM children c
        WHERE c.parent_id = ?
        ORDER BY c.created_at DESC
    ");
    
    $stmt->execute([$parent_id]);
    $children = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'children' => $children
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب البيانات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

