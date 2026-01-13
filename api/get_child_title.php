<?php
/**
 * جلب لقب الطفل ومجموع النجوم
 */
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            child_id,
            child_name,
            total_stars,
            title,
            (SELECT COUNT(*) FROM sessions WHERE child_id = ? AND status = 'completed') as completed_sessions
        FROM children 
        WHERE child_id = ?
    ");
    
    $stmt->execute([$child_id, $child_id]);
    $child = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$child) {
        echo json_encode(['success' => false, 'message' => 'الطفل غير موجود'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // إعادة حساب اللقب دائماً بناءً على مجموع النجوم الحالي
    $total_stars = (int)$child['total_stars'];
    $current_title = $child['title'] ?? null;
    $calculated_title = null;
    
    if ($total_stars < 10) {
        $calculated_title = 'مبتدئ 🎈';
    } elseif ($total_stars >= 10 && $total_stars <= 30) {
        $calculated_title = 'مستكشف 🚀';
    } elseif ($total_stars > 30) {
        $calculated_title = 'نجم التعلم 🌟';
    } else {
        $calculated_title = 'مبتدئ 🎈';
    }
    
    // تحديث اللقب دائماً في قاعدة البيانات لضمان التزامن
    try {
        $updateStmt = $pdo->prepare("UPDATE children SET title = ? WHERE child_id = ?");
        $updateStmt->execute([$calculated_title, $child_id]);
        $child['title'] = $calculated_title;
        error_log("get_child_title: Updated title for child_id $child_id: '$current_title' -> '$calculated_title' (total_stars: $total_stars)");
    } catch(PDOException $e) {
        error_log("get_child_title: Error updating title: " . $e->getMessage());
        // حتى لو فشل التحديث، نعيد اللقب المحسوب
        $child['title'] = $calculated_title;
    }
    
    echo json_encode([
        'success' => true,
        'child' => [
            'child_id' => $child['child_id'],
            'child_name' => $child['child_name'],
            'total_stars' => (int)$child['total_stars'],
            'title' => $child['title'],
            'completed_sessions' => (int)$child['completed_sessions']
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب البيانات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

