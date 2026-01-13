<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$parent_id = isset($_GET['parent_id']) ? (int)$_GET['parent_id'] : 0;

if (!$parent_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الأهل مطلوب']);
    exit;
}

try {
    // الوقت الكلي
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total_time), 0) as total_time 
        FROM children 
        WHERE parent_id = ?
    ");
    $stmt->execute([$parent_id]);
    $timeResult = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_time = $timeResult['total_time'] ?? 0;
    
    // إجمالي الجلسات (التي لها end_time)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total_sessions 
        FROM sessions s
        JOIN children c ON s.child_id = c.child_id
        WHERE c.parent_id = ? 
        AND s.end_time IS NOT NULL
    ");
    $stmt->execute([$parent_id]);
    $sessionsResult = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_sessions = $sessionsResult['total_sessions'] ?? 0;
    
    // إجمالي النجوم (يمكن حسابه من الشارات أو الجلسات)
    $total_stars = $total_sessions; // مؤقتاً
    
    echo json_encode([
        'success' => true,
        'total_time' => (int)$total_time,
        'total_sessions' => (int)$total_sessions,
        'total_stars' => (int)$total_stars
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب الإحصائيات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

