<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب']);
    exit;
}

try {
    // جلب جميع الجلسات التعليمية للطفل مع معلومات المهمة
    // حساب الوقت الفعلي من start_time و end_time
    $stmt = $pdo->prepare("
        SELECT 
            s.session_id,
            s.start_time,
            s.end_time,
            s.duration_minutes as session_duration_minutes,
            s.completed_percentage,
            s.stars,
            s.status,
            t.task_id,
            t.task_name_ar,
            t.task_name,
            t.duration_minutes as task_duration_minutes,
            c.content_name_ar,
            c.content_name,
            c.icon as content_icon,
            -- حساب الوقت الفعلي بالثواني ثم تحويله للدقائق (للدقة)
            TIMESTAMPDIFF(SECOND, s.start_time, s.end_time) as actual_duration_seconds
        FROM sessions s
        JOIN tasks t ON s.task_id = t.task_id
        LEFT JOIN content c ON t.content_id = c.content_id
        WHERE s.child_id = ?
        AND s.end_time IS NOT NULL
        ORDER BY s.start_time DESC
    ");
    
    $stmt->execute([$child_id]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // تنسيق البيانات للعرض
    $formatted_sessions = [];
    foreach ($sessions as $session) {
        // حساب الوقت الفعلي من start_time و end_time
        $actualDuration = 0;
        if ($session['start_time'] && $session['end_time']) {
            // استخدام القيمة المحسوبة من SQL (بالثواني) وتحويلها للدقائق
            if (isset($session['actual_duration_seconds']) && $session['actual_duration_seconds'] > 0) {
                // تحويل الثواني إلى دقائق (تقريب للأعلى إذا كانت 30 ثانية أو أكثر)
                $seconds = (int)$session['actual_duration_seconds'];
                $actualDuration = (int)ceil($seconds / 60); // تقريب للأعلى
            } else {
                // حساب يدوي إذا كان الحساب في SQL فشل
                try {
                    $start = new DateTime($session['start_time']);
                    $end = new DateTime($session['end_time']);
                    $diff = $start->diff($end);
                    // حساب إجمالي الثواني أولاً
                    $totalSeconds = ($diff->days * 24 * 60 * 60) + ($diff->h * 60 * 60) + ($diff->i * 60) + $diff->s;
                    // تحويل للدقائق (تقريب للأعلى)
                    $actualDuration = (int)ceil($totalSeconds / 60);
                } catch (Exception $e) {
                    // في حالة الخطأ، استخدام duration_minutes المحفوظ
                    $actualDuration = (int)($session['duration_minutes'] ?? 0);
                }
            }
        } else {
            // إذا لم يكن هناك start_time أو end_time، استخدام duration_minutes
            $actualDuration = (int)($session['duration_minutes'] ?? 0);
        }
        
        // التأكد من أن الوقت على الأقل دقيقة واحدة (إذا كانت الجلسة مكتملة)
        if ($actualDuration <= 0 && $session['status'] === 'completed') {
            $actualDuration = 1; // على الأقل دقيقة واحدة للجلسات المكتملة
        }
        
        // المدة المحددة من المهمة
        $taskDurationMinutes = (int)($session['task_duration_minutes'] ?? 0);
        
        $formatted_sessions[] = [
            'session_id' => $session['session_id'],
            'task_name' => $session['task_name_ar'] ?: $session['task_name'],
            'content_name' => $session['content_name_ar'] ?: $session['content_name'],
            'content_icon' => $session['content_icon'] ?: '🎮',
            'stars' => (int)($session['stars'] ?: 0),
            'duration_minutes' => $actualDuration, // الوقت الفعلي
            'task_duration_minutes' => $taskDurationMinutes, // المدة المحددة
            'completed_percentage' => (int)($session['completed_percentage'] ?: 0),
            'start_time' => $session['start_time'],
            'end_time' => $session['end_time'],
            'status' => $session['status']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'sessions' => $formatted_sessions,
        'total_sessions' => count($formatted_sessions)
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب الجلسات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

