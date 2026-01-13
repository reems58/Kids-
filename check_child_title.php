<?php
/**
 * سكريبت للتحقق من لقب الطفل و total_stars
 */
header('Content-Type: text/html; charset=utf-8');
require_once 'config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 12; // افتراضي 12

try {
    // جلب بيانات الطفل
    $stmt = $pdo->prepare("
        SELECT 
            child_id,
            child_name,
            total_stars,
            title,
            (SELECT COUNT(*) FROM sessions WHERE child_id = ? AND status = 'completed') as completed_sessions,
            (SELECT SUM(stars) FROM sessions WHERE child_id = ? AND status = 'completed') as total_stars_from_sessions
        FROM children 
        WHERE child_id = ?
    ");
    $stmt->execute([$child_id, $child_id, $child_id]);
    $child = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$child) {
        echo "<h2>❌ الطفل غير موجود (child_id: $child_id)</h2>";
        exit;
    }
    
    // حساب اللقب المتوقع
    $total_stars = (int)$child['total_stars'];
    $expected_title = null;
    if ($total_stars < 10) {
        $expected_title = 'مبتدئ 🎈';
    } elseif ($total_stars >= 10 && $total_stars <= 30) {
        $expected_title = 'مستكشف 🚀';
    } elseif ($total_stars > 30) {
        $expected_title = 'نجم التعلم 🌟';
    }
    
    echo "<h2>📊 معلومات الطفل: {$child['child_name']} (ID: {$child['child_id']})</h2>";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse; font-family: Arial;'>";
    echo "<tr><th>المعلومة</th><th>القيمة</th></tr>";
    echo "<tr><td>total_stars (من جدول children)</td><td><strong>{$child['total_stars']}</strong></td></tr>";
    echo "<tr><td>title (من جدول children)</td><td><strong>{$child['title']}</strong></td></tr>";
    echo "<tr><td>اللقب المتوقع</td><td><strong>$expected_title</strong></td></tr>";
    echo "<tr><td>عدد الجلسات المكتملة</td><td>{$child['completed_sessions']}</td></tr>";
    echo "<tr><td>مجموع النجوم من الجلسات</td><td>{$child['total_stars_from_sessions']}</td></tr>";
    echo "</table>";
    
    // التحقق من التطابق
    if ($child['title'] !== $expected_title) {
        echo "<h3 style='color: red;'>⚠️ المشكلة: اللقب في قاعدة البيانات ({$child['title']}) لا يطابق اللقب المتوقع ($expected_title)</h3>";
        
        // تحديث اللقب
        $updateStmt = $pdo->prepare("UPDATE children SET title = ? WHERE child_id = ?");
        $updateStmt->execute([$expected_title, $child_id]);
        echo "<p style='color: green;'>✅ تم تحديث اللقب إلى: $expected_title</p>";
    } else {
        echo "<h3 style='color: green;'>✅ اللقب صحيح!</h3>";
    }
    
    // عرض آخر 5 جلسات
    echo "<h3>📋 آخر 5 جلسات:</h3>";
    $sessionsStmt = $pdo->prepare("
        SELECT 
            session_id,
            task_id,
            start_time,
            end_time,
            stars,
            completed_percentage,
            status
        FROM sessions 
        WHERE child_id = ? 
        ORDER BY start_time DESC 
        LIMIT 5
    ");
    $sessionsStmt->execute([$child_id]);
    $sessions = $sessionsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($sessions) {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse; font-family: Arial;'>";
        echo "<tr><th>Session ID</th><th>Task ID</th><th>Stars</th><th>Percentage</th><th>Status</th><th>Start Time</th></tr>";
        foreach ($sessions as $session) {
            echo "<tr>";
            echo "<td>{$session['session_id']}</td>";
            echo "<td>{$session['task_id']}</td>";
            echo "<td>{$session['stars']}</td>";
            echo "<td>{$session['completed_percentage']}%</td>";
            echo "<td>{$session['status']}</td>";
            echo "<td>{$session['start_time']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>لا توجد جلسات</p>";
    }
    
} catch(PDOException $e) {
    echo "<h2 style='color: red;'>❌ خطأ: " . $e->getMessage() . "</h2>";
}
?>

