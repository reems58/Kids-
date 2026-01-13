<?php
/**
 * إضافة مهمة جديدة مع تحديد الترتيب
 */
// تفعيل عرض الأخطاء للتطوير
error_reporting(E_ALL);
ini_set('display_errors', 0); // لا نعرض الأخطاء مباشرة، نرسلها في JSON
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');

// بدء الجلسة
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// تحميل ملف قاعدة البيانات
if (!file_exists(__DIR__ . '/../../config/database.php')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في تحميل ملف قاعدة البيانات'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
require_once __DIR__ . '/../../config/database.php';

// تحميل ملف التحقق من المصادقة
if (!file_exists(__DIR__ . '/check_auth.php')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في تحميل ملف التحقق من المصادقة'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
require_once __DIR__ . '/check_auth.php';

// التحقق من تسجيل الدخول
try {
    $parent_id = checkAuth();
    if (!$parent_id) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'غير مسجل دخول. يرجى تسجيل الدخول أولاً'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في التحقق من تسجيل الدخول: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// قراءة البيانات المرسلة
$input = file_get_contents('php://input');
if (empty($input)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'لم يتم إرسال أي بيانات'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في قراءة البيانات المرسلة: ' . json_last_error_msg()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التحقق من وجود اتصال قاعدة البيانات
if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في الاتصال بقاعدة البيانات'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التحقق من البيانات المطلوبة
if (!isset($data['child_id']) || !isset($data['content_id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'معرف الطفل ومعرف المحتوى مطلوبان'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$child_id = (int)$data['child_id'];
$content_id = (int)$data['content_id'];
$task_name = isset($data['task_name']) ? trim($data['task_name']) : '';
$task_name_ar = isset($data['task_name_ar']) ? trim($data['task_name_ar']) : '';
$description = isset($data['description']) ? trim($data['description']) : null;
$duration_minutes = isset($data['duration_minutes']) ? (int)$data['duration_minutes'] : 10;
$order_index = isset($data['order_index']) ? (int)$data['order_index'] : null; // null يعني إضافة في النهاية
$parent_note = isset($data['parent_note']) ? trim($data['parent_note']) : null;

// التحقق من ملكية الطفل
checkChildOwnership($pdo, $parent_id, $child_id);

// التحقق من وجود المحتوى
$contentStmt = $pdo->prepare("SELECT content_id, content_name, content_name_ar FROM content WHERE content_id = ?");
$contentStmt->execute([$content_id]);
$content = $contentStmt->fetch(PDO::FETCH_ASSOC);

if (!$content) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'المحتوى غير موجود'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// إذا لم يتم تحديد اسم المهمة، استخدم اسم المحتوى
if (empty($task_name_ar)) {
    $task_name_ar = !empty($content['content_name_ar']) ? $content['content_name_ar'] : 'مهمة جديدة';
}
if (empty($task_name)) {
    $task_name = !empty($content['content_name']) ? $content['content_name'] : 'New Task';
}

// التأكد من أن الأسماء ليست فارغة
if (empty($task_name)) {
    $task_name = 'New Task';
}
if (empty($task_name_ar)) {
    $task_name_ar = 'مهمة جديدة';
}

// التحقق النهائي من البيانات المطلوبة قبل الإدراج
if (empty($task_name) || empty($task_name_ar)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'اسم المهمة مطلوب'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // بدء المعاملة (Transaction)
    $pdo->beginTransaction();
    
    // إذا لم يتم تحديد الترتيب، ضعه في النهاية
    if ($order_index === null) {
        $maxOrderStmt = $pdo->prepare("
            SELECT COALESCE(MAX(order_index), 0) as max_order 
            FROM tasks 
            WHERE child_id = ? AND parent_id = ?
        ");
        $maxOrderStmt->execute([$child_id, $parent_id]);
        $maxOrder = $maxOrderStmt->fetch(PDO::FETCH_ASSOC);
        $order_index = ($maxOrder && isset($maxOrder['max_order'])) ? $maxOrder['max_order'] + 1 : 1;
    } else {
        // إذا تم تحديد ترتيب، نزح المهام الموجودة
        $shiftStmt = $pdo->prepare("
            UPDATE tasks 
            SET order_index = order_index + 1 
            WHERE child_id = ? AND parent_id = ? AND order_index >= ?
        ");
        $shiftStmt->execute([$child_id, $parent_id, $order_index]);
    }
    
    // إضافة المهمة الجديدة
    $insertStmt = $pdo->prepare("
        INSERT INTO tasks (
            parent_id, 
            child_id, 
            content_id, 
            task_name, 
            task_name_ar, 
            description, 
            duration_minutes, 
            order_index, 
            parent_note,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    
    $insertStmt->execute([
        $parent_id,
        $child_id,
        $content_id,
        $task_name,
        $task_name_ar,
        $description,
        $duration_minutes,
        $order_index,
        $parent_note
    ]);
    
    $task_id = $pdo->lastInsertId();
    
    // تأكيد المعاملة
    $pdo->commit();
    
    // جلب المهمة المضافة مع تفاصيل المحتوى
    $taskStmt = $pdo->prepare("
        SELECT 
            t.*,
            c.content_name,
            c.content_name_ar,
            c.icon
        FROM tasks t
        INNER JOIN content c ON t.content_id = c.content_id
        WHERE t.task_id = ?
    ");
    $taskStmt->execute([$task_id]);
    $newTask = $taskStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$newTask) {
        throw new Exception('فشل جلب المهمة المضافة');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'تم إضافة المهمة بنجاح',
        'task' => $newTask,
        'task_id' => $task_id
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    // إلغاء المعاملة في حالة الخطأ
    if (isset($pdo) && $pdo->inTransaction()) {
        try {
            $pdo->rollBack();
        } catch (Exception $rollbackEx) {
            error_log("Rollback Error: " . $rollbackEx->getMessage());
        }
    }
    
    $errorCode = $e->getCode();
    $errorMessage = $e->getMessage();
    $errorFile = $e->getFile();
    $errorLine = $e->getLine();
    
    error_log("Add Task Error (PDO): " . $errorMessage . " (Code: " . $errorCode . ") in " . $errorFile . ":" . $errorLine);
    
    // رسالة خطأ مخصصة حسب نوع الخطأ
    $userMessage = 'خطأ في إضافة المهمة';
    
    if ($errorCode == '42S02') {
        $userMessage = 'خطأ في قاعدة البيانات: الجدول غير موجود';
    } else if ($errorCode == '42S22') {
        $userMessage = 'خطأ في قاعدة البيانات: عمود غير موجود';
    } else if ($errorCode == '23000') {
        $userMessage = 'خطأ: البيانات مكررة أو غير صحيحة';
    } else if (strpos($errorMessage, 'Foreign key constraint') !== false) {
        $userMessage = 'خطأ: المحتوى أو الطفل غير موجود';
    } else if (strpos($errorMessage, 'Unknown column') !== false) {
        $userMessage = 'خطأ في قاعدة البيانات: عمود مفقود في الجدول';
    } else {
        $userMessage = 'خطأ في إضافة المهمة: ' . $errorMessage;
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $userMessage,
        'debug' => $errorMessage // فقط للتطوير
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch(Exception $e) {
    // إلغاء المعاملة في حالة الخطأ
    if (isset($pdo) && $pdo->inTransaction()) {
        try {
            $pdo->rollBack();
        } catch (Exception $rollbackEx) {
            error_log("Rollback Error: " . $rollbackEx->getMessage());
        }
    }
    
    $errorMessage = $e->getMessage();
    $errorFile = $e->getFile();
    $errorLine = $e->getLine();
    
    error_log("Add Task Error (General): " . $errorMessage . " in " . $errorFile . ":" . $errorLine);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في إضافة المهمة: ' . $errorMessage,
        'debug' => $errorMessage // فقط للتطوير
    ], JSON_UNESCAPED_UNICODE);
    exit;
}