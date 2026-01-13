<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

// السماح فقط بطلبات POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة، استخدم POST فقط'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// قراءة بيانات JSON من الطلب
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['child_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'معرف الطفل مطلوب'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$child_id = (int)$data['child_id'];

if ($child_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'معرف الطفل غير صالح'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // حذف الطفل
    $stmt = $pdo->prepare("DELETE FROM children WHERE child_id = ?");
    $stmt->execute([$child_id]);

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'الطفل غير موجود أو تم حذفه مسبقاً'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // بفضل القيود في قاعدة البيانات:
    // - سيتم حذف الجلسات والتقارير المرتبطة بالطفل تلقائياً (ON DELETE CASCADE)
    // - سيتم تعيين child_id في المهام إلى NULL (ON DELETE SET NULL)

    echo json_encode([
        'success' => true,
        'message' => 'تم حذف الطفل بنجاح'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في حذف الطفل: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

?>


