<?php
/**
 * جلب المهام التي أضافها الأهل للطفل
 * يعرض فقط المهام المرتبطة بالطفل من جدول tasks
 */
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل مطلوب'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // جلب معلومات الطفل
    $stmt = $pdo->prepare("
        SELECT 
            child_id,
            child_name,
            age,
            birth_date
        FROM children 
        WHERE child_id = ?
    ");
    
    $stmt->execute([$child_id]);
    $child = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$child) {
        echo json_encode(['success' => false, 'message' => 'الطفل غير موجود'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // حساب العمر
    $age = null;
    if (!empty($child['birth_date']) && $child['birth_date'] !== '0000-00-00') {
        try {
            $birthDate = new DateTime($child['birth_date']);
            $today = new DateTime();
            $diff = $today->diff($birthDate);
            $age = $diff->y;
            if ($age < 1 && !empty($child['age'])) {
                $age = (int)$child['age'];
            }
        } catch (Exception $e) {
            if (!empty($child['age']) && $child['age'] > 0) {
                $age = (int)$child['age'];
            }
        }
    }
    
    if (($age === null || $age < 1) && !empty($child['age']) && $child['age'] > 0) {
        $age = (int)$child['age'];
    }
    
    // جلب المهام المرتبطة بالطفل مع تفاصيل المحتوى
    $stmt = $pdo->prepare("
        SELECT 
            t.task_id,
            t.task_name,
            t.task_name_ar,
            t.description,
            t.duration_minutes,
            t.order_index,
            t.status,
            t.parent_note,
            c.content_id,
            c.content_name,
            c.content_name_ar,
            c.content_type,
            c.content_url,
            c.content_category,
            c.category,
            c.title,
            c.icon,
            c.min_age,
            c.max_age
        FROM tasks t
        INNER JOIN content c ON t.content_id = c.content_id
        WHERE t.child_id = ?
        ORDER BY t.order_index ASC, t.created_at ASC
    ");
    
    $stmt->execute([$child_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // تحويل المهام إلى تنسيق المحتوى للتطابق مع الواجهة
    $content = [];
    foreach ($tasks as $task) {
        $content[] = [
            'content_id' => $task['content_id'],
            'task_id' => $task['task_id'],
            'content_name' => $task['content_name'],
            'content_name_ar' => $task['task_name_ar'] ?: $task['content_name_ar'],
            'content_type' => $task['content_type'] ?: 'لعبة',
            'content_url' => $task['content_url'],
            'content_category' => $task['content_category'] ?: $task['category'] ?: 'عربي',
            'title' => $task['title'],
            'icon' => $task['icon'],
            'min_age' => $task['min_age'],
            'max_age' => $task['max_age'],
            'task_status' => $task['status'],
            'order_index' => $task['order_index'],
            'duration_minutes' => $task['duration_minutes'],
            'parent_note' => $task['parent_note']
        ];
    }
    
    // تجميع المحتوى حسب الفئة والنوع
    $groupedContent = [
        'عربي' => ['لعبة' => [], 'فيديو' => []],
        'علوم' => ['لعبة' => [], 'فيديو' => []],
        'رياضيات' => ['لعبة' => [], 'فيديو' => []]
    ];
    
    foreach ($content as $item) {
        $cat = $item['content_category'] ?? 'عربي';
        $type = $item['content_type'] ?? 'لعبة';
        if (isset($groupedContent[$cat]) && isset($groupedContent[$cat][$type])) {
            $groupedContent[$cat][$type][] = $item;
        }
    }
    
    echo json_encode([
        'success' => true,
        'child' => [
            'child_id' => $child['child_id'],
            'child_name' => $child['child_name'],
            'age' => $age ?: $child['age']
        ],
        'content' => $content,
        'grouped_content' => $groupedContent,
        'count' => count($content),
        'games_count' => count(array_filter($content, fn($item) => ($item['content_type'] ?? 'لعبة') === 'لعبة')),
        'videos_count' => count(array_filter($content, fn($item) => ($item['content_type'] ?? '') === 'فيديو'))
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    error_log("Get Child Content Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب المحتوى: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

