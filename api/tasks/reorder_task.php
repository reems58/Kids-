<?php
/**
 * تغيير ترتيب المهام (للأعلى أو للأسفل)
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
if (!isset($data['task_id']) || !isset($data['direction'])) {
    echo json_encode([
        'success' => false,
        'message' => 'معرف المهمة واتجاه الحركة مطلوبان (direction: "up" أو "down")'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$task_id = (int)$data['task_id'];
$direction = strtolower(trim($data['direction']));

if (!in_array($direction, ['up', 'down'])) {
    echo json_encode([
        'success' => false,
        'message' => 'الاتجاه يجب أن يكون "up" أو "down"'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التحقق من ملكية المهمة
$task = checkTaskOwnership($pdo, $parent_id, $task_id);
$child_id = $task['child_id'];

try {
    // بدء المعاملة (Transaction)
    $pdo->beginTransaction();
    
    // جلب ترتيب المهمة الحالي
    $currentStmt = $pdo->prepare("SELECT order_index FROM tasks WHERE task_id = ?");
    $currentStmt->execute([$task_id]);
    $current = $currentStmt->fetch();
    
    if (!$current) {
        throw new Exception('المهمة غير موجودة');
    }
    
    $current_order = $current['order_index'];
    
    if ($direction === 'up') {
        // نقل للأعلى: تقليل order_index
        if ($current_order <= 0) {
            $pdo->rollBack();
            echo json_encode([
                'success' => false,
                'message' => 'المهمة في أعلى الترتيب بالفعل'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // البحث عن المهمة التي قبلها
        $prevStmt = $pdo->prepare("
            SELECT task_id, order_index 
            FROM tasks 
            WHERE child_id = ? AND parent_id = ? AND order_index = ?
        ");
        $prevStmt->execute([$child_id, $parent_id, $current_order - 1]);
        $prev = $prevStmt->fetch();
        
        if ($prev) {
            // تبديل الترتيب
            $update1 = $pdo->prepare("UPDATE tasks SET order_index = ? WHERE task_id = ?");
            $update1->execute([$current_order - 1, $task_id]);
            
            $update2 = $pdo->prepare("UPDATE tasks SET order_index = ? WHERE task_id = ?");
            $update2->execute([$current_order, $prev['task_id']]);
        } else {
            // لا توجد مهمة قبلها، فقط تقليل الترتيب
            $update1 = $pdo->prepare("UPDATE tasks SET order_index = ? WHERE task_id = ?");
            $update1->execute([$current_order - 1, $task_id]);
        }
        
    } else { // down
        // نقل للأسفل: زيادة order_index
        // البحث عن المهمة التي بعدها
        $nextStmt = $pdo->prepare("
            SELECT task_id, order_index 
            FROM tasks 
            WHERE child_id = ? AND parent_id = ? AND order_index = ?
        ");
        $nextStmt->execute([$child_id, $parent_id, $current_order + 1]);
        $next = $nextStmt->fetch();
        
        if ($next) {
            // تبديل الترتيب
            $update1 = $pdo->prepare("UPDATE tasks SET order_index = ? WHERE task_id = ?");
            $update1->execute([$current_order + 1, $task_id]);
            
            $update2 = $pdo->prepare("UPDATE tasks SET order_index = ? WHERE task_id = ?");
            $update2->execute([$current_order, $next['task_id']]);
        } else {
            // لا توجد مهمة بعدها، فقط زيادة الترتيب
            $update1 = $pdo->prepare("UPDATE tasks SET order_index = ? WHERE task_id = ?");
            $update1->execute([$current_order + 1, $task_id]);
        }
    }
    
    // تأكيد المعاملة
    $pdo->commit();
    
    // جلب المهمة المحدثة
    $taskStmt = $pdo->prepare("
        SELECT 
            t.*,
            c.content_name_ar,
            c.icon
        FROM tasks t
        INNER JOIN content c ON t.content_id = c.content_id
        WHERE t.task_id = ?
    ");
    $taskStmt->execute([$task_id]);
    $updatedTask = $taskStmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'تم تغيير ترتيب المهمة بنجاح',
        'task' => $updatedTask
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    // إلغاء المعاملة في حالة الخطأ
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Reorder Task Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في تغيير ترتيب المهمة: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch(Exception $e) {
    // إلغاء المعاملة في حالة الخطأ
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Reorder Task Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

