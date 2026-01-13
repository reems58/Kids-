<?php
/**
 * ملف التحقق من تسجيل الدخول وملكية الطفل/المهمة
 */
// إذا لم يتم استدعاء session_start() بعد، نستدعيه
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// إذا لم يتم تعريف $pdo بعد، نستدعي database.php
if (!isset($pdo)) {
    $dbPath = __DIR__ . '/../../config/database.php';
    if (file_exists($dbPath)) {
        require_once $dbPath;
    } else {
        // إذا فشل تحميل قاعدة البيانات، نرسل خطأ
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
        }
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في تحميل ملف قاعدة البيانات'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * التحقق من تسجيل الدخول
 */
function checkAuth() {
    if (!isset($_SESSION['parent_id']) && !isset($_SESSION['user_id'])) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'غير مسجل دخول. يرجى تسجيل الدخول أولاً'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $_SESSION['parent_id'] ?? $_SESSION['user_id'];
}

/**
 * التحقق من ملكية الطفل
 */
function checkChildOwnership($pdo, $parent_id, $child_id) {
    $stmt = $pdo->prepare("SELECT child_id FROM children WHERE child_id = ? AND parent_id = ?");
    $stmt->execute([$child_id, $parent_id]);
    $child = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$child) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'الطفل غير موجود أو ليس لديك صلاحية للوصول إليه'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    return true;
}

/**
 * التحقق من ملكية المهمة
 */
function checkTaskOwnership($pdo, $parent_id, $task_id) {
    $stmt = $pdo->prepare("
        SELECT task_id, child_id, parent_id 
        FROM tasks 
        WHERE task_id = ? AND parent_id = ?
    ");
    $stmt->execute([$task_id, $parent_id]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$task) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'المهمة غير موجودة أو ليس لديك صلاحية للوصول إليها'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    return $task;
}
?>

