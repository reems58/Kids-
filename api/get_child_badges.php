<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب']);
    exit;
}

// دالة لتحديد اللقب حسب النقاط
function getScoreTitle($score) {
    if ($score >= 90 && $score <= 100) {
        return 'ممتاز! 🏆';
    } elseif ($score >= 60 && $score < 90) {
        return 'رائع جداً! 🥇';
    } elseif ($score >= 30 && $score < 60) {
        return 'جيد جداً! 🥈';
    } elseif ($score >= 10 && $score < 30) {
        return 'حاول مرة أخرى! ⭐';
    } else {
        return 'استمر في المحاولة! 👍';
    }
}

try {
    // جلب الشارات المكتسبة من جدول child_badges مع معلومات المهمة والنقاط
    $stmt = $pdo->prepare("
        SELECT 
            b.badge_id,
            b.badge_name,
            b.badge_name_ar,
            b.badge_icon,
            b.color_code,
            b.level,
            b.description,
            cb.stars_earned,
            cb.awarded_at,
            (SELECT t.task_name_ar 
             FROM sessions s 
             INNER JOIN tasks t ON s.task_id = t.task_id 
             WHERE s.child_id = cb.child_id 
             AND s.status = 'completed' 
             AND DATE(s.end_time) = DATE(cb.awarded_at)
             ORDER BY s.end_time DESC 
             LIMIT 1) as task_name,
            (SELECT t.task_id 
             FROM sessions s 
             INNER JOIN tasks t ON s.task_id = t.task_id 
             WHERE s.child_id = cb.child_id 
             AND s.status = 'completed' 
             AND DATE(s.end_time) = DATE(cb.awarded_at)
             ORDER BY s.end_time DESC 
             LIMIT 1) as task_id,
            (SELECT s.completed_percentage 
             FROM sessions s 
             WHERE s.child_id = cb.child_id 
             AND s.status = 'completed' 
             AND DATE(s.end_time) = DATE(cb.awarded_at)
             ORDER BY s.end_time DESC 
             LIMIT 1) as completed_percentage
        FROM child_badges cb
        INNER JOIN badges b ON cb.badge_id = b.badge_id
        WHERE cb.child_id = ?
        ORDER BY cb.awarded_at DESC, b.level ASC
    ");
    $stmt->execute([$child_id]);
    $earned_badges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // تنسيق البيانات
    $formatted_badges = [];
    foreach ($earned_badges as $badge) {
        // حساب النقاط من completed_percentage (افتراض أن 100% = 100 نقطة)
        $score = (int)($badge['completed_percentage'] ?? 0);
        $score_title = getScoreTitle($score);
        
        $formatted_badges[] = [
            'badge_id' => $badge['badge_id'],
            'badge_name' => $badge['badge_name'],
            'badge_name_ar' => $badge['badge_name_ar'],
            'badge_icon' => $badge['badge_icon'],
            'color_code' => $badge['color_code'],
            'level' => $badge['level'],
            'description' => $badge['description'],
            'stars_earned' => (int)$badge['stars_earned'],
            'earned_at' => $badge['awarded_at'],
            'task_name' => $badge['task_name'] ?? null,
            'task_id' => $badge['task_id'] ?? null,
            'score' => $score,
            'score_title' => $score_title
        ];
    }
    
    echo json_encode([
        'success' => true,
        'badges' => $formatted_badges,
        'count' => count($formatted_badges)
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب الشارات: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

