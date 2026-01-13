<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['child_id']) || !isset($data['task_id'])) {
    echo json_encode(['success' => false, 'message' => 'البيانات المطلوبة غير مكتملة']);
    exit;
}

$child_id = (int)$data['child_id'];
$task_id = (int)$data['task_id'];

try {
    // جلب content_id من المهمة
    $taskStmt = $pdo->prepare("SELECT content_id FROM tasks WHERE task_id = ?");
    $taskStmt->execute([$task_id]);
    $task = $taskStmt->fetch(PDO::FETCH_ASSOC);
    $content_id = $task ? $task['content_id'] : null;
    
    // إنشاء الجلسة
    $stmt = $pdo->prepare("
        INSERT INTO sessions (child_id, task_id, content_id, status) 
        VALUES (?, ?, ?, 'in_progress')
    ");
    
    $stmt->execute([$child_id, $task_id, $content_id]);
    $session_id = $pdo->lastInsertId();
    
    // تحديث حالة المهمة إلى in_progress (فقط إذا لم تكن مكتملة)
    $updateTaskStmt = $pdo->prepare("
        UPDATE tasks 
        SET status = 'in_progress'
        WHERE task_id = ? AND child_id = ?
        AND status != 'completed'
    ");
    $updateTaskStmt->execute([$task_id, $child_id]);
    
    echo json_encode([
        'success' => true,
        'session' => [
            'session_id' => $session_id,
            'child_id' => $child_id,
            'task_id' => $task_id
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في بدء الجلسة: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

