<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب']);
    exit;
}

try {
    // جلب المهمة الحالية (الأولى في الترتيب والتي لم تكتمل بعد - pending أو in_progress فقط)
    // المهام المتوقفة (paused) لا تظهر في القائمة الحالية، تظهر فقط في التقارير والإنجازات
    $stmt = $pdo->prepare("
        SELECT 
            t.task_id,
            t.task_name,
            t.task_name_ar,
            t.description,
            t.duration_minutes,
            t.parent_note,
            t.status,
            c.content_id,
            c.content_name_ar as subject_name_ar,
            c.content_url,
            c.content_type,
            c.icon as subject_icon,
            c.min_age,
            c.max_age
        FROM tasks t
        JOIN content c ON t.content_id = c.content_id
        WHERE t.child_id = ? 
        AND (t.status = 'pending' OR t.status = 'in_progress')
        ORDER BY 
            CASE 
                WHEN t.status = 'in_progress' THEN 1
                WHEN t.status = 'pending' THEN 2
                ELSE 3
            END,
            t.order_index ASC
        LIMIT 1
    ");
    
    $stmt->execute([$child_id]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($task) {
        echo json_encode([
            'success' => true,
            'task' => $task
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'لا توجد مهمة متاحة'
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب المهمة: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

