<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['parent_id']) || !isset($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'البيانات المطلوبة غير مكتملة']);
    exit;
}

$parent_id = (int)$data['parent_id'];
$email = trim($data['email']);

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'يرجى إدخال البريد الإلكتروني']);
    exit;
}

// التحقق من صحة البريد الإلكتروني
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'البريد الإلكتروني غير صحيح']);
    exit;
}

try {
    // التحقق من أن البريد الإلكتروني غير مستخدم من قبل مستخدم آخر
    $stmt = $pdo->prepare("SELECT id FROM parents WHERE email = ? AND id != ?");
    $stmt->execute([$email, $parent_id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        echo json_encode([
            'success' => false,
            'message' => 'البريد الإلكتروني مستخدم من قبل مستخدم آخر'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // تحديث البريد الإلكتروني في قاعدة البيانات
    $stmt = $pdo->prepare("
        UPDATE parents 
        SET email = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([$email, $parent_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'تم تحديث البريد الإلكتروني بنجاح',
            'email' => $email
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'لم يتم العثور على المستخدم أو لم يتم تحديث البيانات'
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch(PDOException $e) {
    // التحقق من خطأ تكرار البريد الإلكتروني
    if ($e->getCode() == 23000) {
        echo json_encode([
            'success' => false,
            'message' => 'البريد الإلكتروني مستخدم من قبل مستخدم آخر'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في تحديث البريد الإلكتروني: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}
?>

