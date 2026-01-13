<?php
/**
 * حذف مهمة مع إعادة ترتيب المهام تلقائياً
 */
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../../config/database.php';
require_once 'check_auth.php';

// التحقق من تسجيل الدخول
$parent_id = checkAuth();

// قراءة البيانات المرسلة
$data = json_decode(file_get_contents('php://input'), true);

// التحقق من البيانات المطلوبة
if (!isset($data['task_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'معرف المهمة مطلوب'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$task_id = (int)$data['task_id'];

// التحقق من ملكية المهمة
$task = checkTaskOwnership($pdo, $parent_id, $task_id);
$child_id = $task['child_id'];
$old_order_index = null;

try {
    // بدء المعاملة (Transaction)
    $pdo->beginTransaction();
    
    // جلب ترتيب المهمة قبل الحذف
    $orderStmt = $pdo->prepare("SELECT order_index FROM tasks WHERE task_id = ?");
    $orderStmt->execute([$task_id]);
    $orderResult = $orderStmt->fetch();
    
    if ($orderResult) {
        $old_order_index = $orderResult['order_index'];
    }
    
    // حذف المهمة
    $deleteStmt = $pdo->prepare("DELETE FROM tasks WHERE task_id = ? AND parent_id = ?");
    $deleteStmt->execute([$task_id, $parent_id]);
    
    if ($deleteStmt->rowCount() === 0) {
        throw new Exception('فشل حذف المهمة');
    }
    
    // إعادة ترتيب المهام المتبقية (تقليل order_index للمهام التي بعد المهمة المحذوفة)
    if ($old_order_index !== null) {
        $reorderStmt = $pdo->prepare("
            UPDATE tasks 
            SET order_index = order_index - 1 
            WHERE child_id = ? AND parent_id = ? AND order_index > ?
        ");
        $reorderStmt->execute([$child_id, $parent_id, $old_order_index]);
    }
    
    // تأكيد المعاملة
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'تم حذف المهمة بنجاح',
        'task_id' => $task_id
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    // إلغاء المعاملة في حالة الخطأ
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Delete Task Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في حذف المهمة: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch(Exception $e) {
    // إلغاء المعاملة في حالة الخطأ
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Delete Task Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

