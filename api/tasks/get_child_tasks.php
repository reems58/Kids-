<?php
/**
 * جلب مهام طفل معين مع تفاصيل المحتوى
 */
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../../config/database.php';
require_once 'check_auth.php';

// التحقق من تسجيل الدخول
$parent_id = checkAuth();

// الحصول على child_id من الطلب
$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode([
        'success' => false,
        'message' => 'معرف الطفل مطلوب'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التحقق من ملكية الطفل
checkChildOwnership($pdo, $parent_id, $child_id);

try {
    // جلب المهام مع تفاصيل المحتوى مرتبة حسب order_index
    $stmt = $pdo->prepare("
        SELECT 
            t.task_id,
            t.task_name,
            t.task_name_ar,
            t.description,
            t.duration_minutes,
            t.order_index,
            t.status,
            t.time_completed,
            t.parent_note,
            t.created_at,
            c.content_id,
            c.content_name,
            c.content_name_ar,
            c.title,
            c.topic,
            c.category,
            c.difficulty,
            c.min_age,
            c.max_age,
            c.icon
        FROM tasks t
        INNER JOIN content c ON t.content_id = c.content_id
        WHERE t.child_id = ? AND t.parent_id = ?
        ORDER BY t.order_index ASC, t.created_at ASC
    ");
    
    $stmt->execute([$child_id, $parent_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // تصفية المهام: إظهار المهام النشطة (pending, in_progress) والمهام المتوقفة (paused)
    // المهام القديمة فقط تظهر في التقارير والإنجازات
    $filteredTasks = [];
    foreach ($tasks as $task) {
        // إظهار المهام المتوقفة في القائمة (المستخدم يريد رؤيتها)
        
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
        
        // جلب آخر جلسة للمهمة
        $sessionStmt = $pdo->prepare("
            SELECT 
                session_id,
                status,
                completed_percentage,
                duration_minutes
            FROM sessions
            WHERE task_id = ? AND child_id = ?
            ORDER BY start_time DESC
            LIMIT 1
        ");
        $sessionStmt->execute([$task['task_id'], $child_id]);
        $session = $sessionStmt->fetch(PDO::FETCH_ASSOC);
        
        $task['last_session'] = $session ?: null;
        $filteredTasks[] = $task;
    }
    
    echo json_encode([
        'success' => true,
        'tasks' => $filteredTasks,
        'count' => count($filteredTasks)
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    error_log("Get Child Tasks Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب المهام: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

