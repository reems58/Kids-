<?php
// ملف تسجيل الخروج
session_start();

// مسح جميع متغيرات الجلسة
$_SESSION = array();

// تدمير الجلسة
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time()-3600, '/');
}

session_destroy();

// إرجاع JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'message' => 'تم تسجيل الخروج بنجاح'
]);
?>

