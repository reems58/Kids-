<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['parent_id']) || !isset($data['name'])) {
    echo json_encode(['success' => false, 'message' => 'البيانات المطلوبة غير مكتملة']);
    exit;
}

$parent_id = (int)$data['parent_id'];
$name = trim($data['name']);

if (empty($name)) {
    echo json_encode(['success' => false, 'message' => 'يرجى إدخال الاسم']);
    exit;
}

try {
    // تقسيم الاسم إلى first_name و last_name
    $nameParts = explode(' ', $name, 2);
    $first_name = $nameParts[0];
    $last_name = isset($nameParts[1]) ? $nameParts[1] : '';
    
    // إذا لم يكن هناك last_name، نضع first_name في last_name
    if (empty($last_name)) {
        $last_name = $first_name;
    }
    
    // تحديث الاسم في قاعدة البيانات
    $stmt = $pdo->prepare("
        UPDATE parents 
        SET first_name = ?, last_name = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([$first_name, $last_name, $parent_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'تم تحديث الاسم بنجاح',
            'name' => $name
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'لم يتم العثور على المستخدم أو لم يتم تحديث البيانات'
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في تحديث الاسم: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

