<?php
/**
 * جلب جميع المهام التي عملها الطفل مع حالتها وتاريخها
 */
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // جلب جميع الجلسات التي عملها الطفل مع معلومات المهمة
    $stmt = $pdo->prepare("
        SELECT 
            s.session_id,
            s.task_id,
            s.status,
            s.start_time,
            s.end_time,
            s.duration_minutes as session_duration_minutes,
            s.completed_percentage,
            t.task_name,
            t.task_name_ar,
            t.description,
            t.duration_minutes as task_duration_minutes,
            c.content_name_ar,
            c.icon as content_icon,
            CASE 
                WHEN s.status = 'completed' THEN 'مكتملة'
                WHEN s.status = 'in_progress' THEN 'قيد التنفيذ'
                WHEN s.status = 'paused' THEN 'متوقفة'
                ELSE 'غير معروف'
            END as status_ar
        FROM sessions s
        INNER JOIN tasks t ON s.task_id = t.task_id
        LEFT JOIN content c ON t.content_id = c.content_id
        WHERE s.child_id = ?
        AND s.status IN ('completed', 'paused')
        ORDER BY s.start_time DESC
    ");
    
    $stmt->execute([$child_id]);
    $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // تنسيق البيانات
    $formatted_achievements = [];
    foreach ($achievements as $achievement) {
        // المدة المحددة من قبل الأهل
        $task_duration_minutes = (int)$achievement['task_duration_minutes'];
        
        // المدة الفعلية التي استغرقها الطفل
        $session_duration_minutes = (int)$achievement['session_duration_minutes'];
        
        // حساب المدة من start_time و end_time إذا كانت المدة 0 أو غير موجودة
        if ($session_duration_minutes == 0 && $achievement['start_time'] && $achievement['end_time']) {
            $start = new DateTime($achievement['start_time']);
            $end = new DateTime($achievement['end_time']);
            $diff = $start->diff($end);
            // حساب المدة بالدقائق
            $session_duration_minutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
            // إذا كانت المدة أقل من دقيقة، نعرضها كدقيقة واحدة على الأقل
            if ($session_duration_minutes == 0 && $diff->s > 0) {
                $session_duration_minutes = 1;
            }
        }
        
        $formatted_achievements[] = [
            'session_id' => (int)$achievement['session_id'],
            'task_id' => (int)$achievement['task_id'],
            'task_name' => $achievement['task_name_ar'] ?: $achievement['task_name'],
            'description' => $achievement['description'],
            'content_name' => $achievement['content_name_ar'],
            'content_icon' => $achievement['content_icon'],
            'status' => $achievement['status'],
            'status_ar' => $achievement['status_ar'],
            'completed_percentage' => (int)$achievement['completed_percentage'],
            'task_duration_minutes' => $task_duration_minutes,
            'session_duration_minutes' => $session_duration_minutes,
            'start_time' => $achievement['start_time'],
            'end_time' => $achievement['end_time'],
            'date' => $achievement['start_time'] ? date('Y-m-d', strtotime($achievement['start_time'])) : null,
            'time' => $achievement['start_time'] ? date('H:i', strtotime($achievement['start_time'])) : null
        ];
    }
    
    echo json_encode([
        'success' => true,
        'achievements' => $formatted_achievements,
        'count' => count($formatted_achievements)
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب الإنجازات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

