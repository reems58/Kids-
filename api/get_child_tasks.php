<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب']);
    exit;
}

try {
    // ملاحظة: لا نستخدم JOIN مع جدول الجلسات هنا حتى لا تتكرر المهام
    // إذا كان هناك أكثر من جلسة لنفس المهمة. سنحسب حالة المهمة
    // (قيد التنفيذ / مكتملة) لاحقاً باستعلامات منفصلة لكل مهمة.
    $stmt = $pdo->prepare("
        SELECT 
            t.task_id,
            t.task_name,
            t.task_name_ar,
            t.description,
            t.duration_minutes,
            t.order_index,
            t.status,
            c.content_name_ar as subject_name_ar,
            c.icon as subject_icon
        FROM tasks t
        JOIN content c ON t.content_id = c.content_id
        WHERE t.child_id = ?
        ORDER BY t.order_index ASC, t.created_at ASC
    ");
    
    $stmt->execute([$child_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // تصفية المهام: إظهار فقط مهام اليوم (التي لديها جلسات بدأت اليوم أو لم تبدأ بعد)
    // المهام القديمة (التي لديها جلسات قديمة فقط) تظهر فقط في صفحة الإنجازات
    $filteredTasks = [];
    foreach ($tasks as $task) {
        // التحقق من وجود جلسة حديثة (أقل من 24 ساعة)
        $checkStmt = $pdo->prepare("
            SELECT COUNT(*) as new_count
            FROM sessions 
            WHERE child_id = ? 
            AND task_id = ? 
            AND start_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        $checkStmt->execute([$child_id, $task['task_id']]);
        $newResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $hasNewSession = ($newResult['new_count'] > 0);
        
        // التحقق من وجود جلسة قديمة فقط (أكثر من 24 ساعة)
        $checkStmt2 = $pdo->prepare("
            SELECT COUNT(*) as old_count
            FROM sessions 
            WHERE child_id = ? 
            AND task_id = ? 
            AND start_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        $checkStmt2->execute([$child_id, $task['task_id']]);
        $oldResult = $checkStmt2->fetch(PDO::FETCH_ASSOC);
        $hasOnlyOldSessions = ($oldResult['old_count'] > 0 && !$hasNewSession);
        
        // إخفاء المهام التي لديها جلسات قديمة فقط (تظهر فقط في الإنجازات)
        if ($hasOnlyOldSessions) {
            continue; // تخطي هذه المهمة
        }
        
        // التحقق من حالة الجلسة الأخيرة
        // إذا كانت المهمة مكتملة بالفعل في جدول tasks، نحافظ على حالتها ولا نكتب عليها
        // لأن المهمة المكتملة يجب أن تبقى مكتملة دائماً
        if ($task['status'] !== 'completed') {
            $checkStmt3 = $pdo->prepare("
                SELECT status
                FROM sessions 
                WHERE child_id = ? 
                AND task_id = ? 
                AND start_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                ORDER BY start_time DESC
                LIMIT 1
            ");
            $checkStmt3->execute([$child_id, $task['task_id']]);
            $sessionResult = $checkStmt3->fetch(PDO::FETCH_ASSOC);
            
            // تحديث status بناءً على حالة الجلسة الأخيرة (فقط إذا لم تكن المهمة مكتملة)
            if ($sessionResult) {
                if ($sessionResult['status'] === 'in_progress') {
                    $task['status'] = 'in_progress';
                } elseif ($sessionResult['status'] === 'paused') {
                    $task['status'] = 'paused';
                } elseif ($sessionResult['status'] === 'completed') {
                    $task['status'] = 'completed';
                }
            }
        }
        // إذا كانت المهمة مكتملة، نحافظ على حالتها كما هي
        
        $filteredTasks[] = $task;
    }
    
    echo json_encode([
        'success' => true,
        'tasks' => $filteredTasks
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب المهام: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

