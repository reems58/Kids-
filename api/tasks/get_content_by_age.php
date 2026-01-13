<?php
/**
 * جلب المحتوى التعليمي حسب العمر
 */
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../../config/database.php';
require_once 'check_auth.php';

// التحقق من تسجيل الدخول
checkAuth();

// الحصول على العمر من الطلب
$age = isset($_GET['age']) ? (int)$_GET['age'] : null;

if ($age === null || $age < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'العمر مطلوب ويجب أن يكون رقمًا صحيحًا'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // جلب المحتوى المناسب للعمر والفئة (حيث يكون العمر مطابق تماماً)
    // إضافة فلتر حسب الفئة إذا كان موجوداً
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    
    $sql = "
        SELECT 
            content_id,
            content_name,
            content_name_ar,
            content_type,
            content_url,
            content_category,
            title,
            topic,
            category,
            difficulty,
            min_age,
            max_age,
            icon,
            created_at
        FROM content
        WHERE min_age = ? AND max_age = ?
    ";
    
    $params = [$age, $age];
    
    // إضافة فلتر الفئة إذا كان محدداً
    if ($category && in_array($category, ['عربي', 'علوم', 'رياضيات'])) {
        $sql .= " AND content_category = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY content_category ASC, content_type ASC, content_name_ar ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $content = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // تجميع المحتوى حسب الفئة والنوع
    $groupedContent = [
        'عربي' => ['لعبة' => [], 'فيديو' => []],
        'علوم' => ['لعبة' => [], 'فيديو' => []],
        'رياضيات' => ['لعبة' => [], 'فيديو' => []]
    ];
    
    foreach ($content as $item) {
        $cat = $item['content_category'] ?? 'عربي';
        $type = $item['content_type'] ?? 'لعبة';
        if (isset($groupedContent[$cat][$type])) {
            $groupedContent[$cat][$type][] = $item;
        }
    }
    
    echo json_encode([
        'success' => true,
        'age' => $age,
        'content' => $content,
        'grouped_content' => $groupedContent,
        'count' => count($content)
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    error_log("Get Content By Age Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في جلب المحتوى: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

