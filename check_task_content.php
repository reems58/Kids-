<?php
/**
 * ملف للتحقق من محتوى المهام
 * استخدم: http://localhost/kids_learning/check_task_content.php?child_id=1
 */
header('Content-Type: text/html; charset=utf-8');
require_once 'config/database.php';

$child_id = isset($_GET['child_id']) ? (int)$_GET['child_id'] : 0;

if (!$child_id) {
    echo '<h2>يرجى إدخال معرف الطفل</h2>';
    echo '<p>استخدم: check_task_content.php?child_id=1</p>';
    exit;
}

try {
    // جلب المهمة الحالية
    $stmt = $pdo->prepare("
        SELECT 
            t.task_id,
            t.task_name,
            t.task_name_ar,
            t.description,
            t.duration_minutes,
            t.status,
            t.order_index,
            c.content_id,
            c.content_name,
            c.content_name_ar,
            c.content_url,
            c.content_type,
            c.icon
        FROM tasks t
        JOIN content c ON t.content_id = c.content_id
        WHERE t.child_id = ? 
        AND t.status = 'pending'
        ORDER BY t.order_index ASC
        LIMIT 1
    ");
    
    $stmt->execute([$child_id]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo '<!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>فحص محتوى المهمة</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 10px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .error { background: #ffebee; padding: 15px; border-radius: 5px; margin: 10px 0; color: #c62828; }
            .success { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 10px 0; color: #2e7d32; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: right; border: 1px solid #ddd; }
            th { background: #667eea; color: white; }
            .url { word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>فحص محتوى المهمة للطفل #' . $child_id . '</h1>';
    
    if ($task) {
        echo '<div class="success">
            <h3>✅ تم العثور على مهمة</h3>
        </div>';
        
        echo '<table>
            <tr><th>المعلومة</th><th>القيمة</th></tr>
            <tr><td>معرف المهمة</td><td>' . htmlspecialchars($task['task_id']) . '</td></tr>
            <tr><td>اسم المهمة (عربي)</td><td>' . htmlspecialchars($task['task_name_ar']) . '</td></tr>
            <tr><td>المدة (دقائق)</td><td>' . htmlspecialchars($task['duration_minutes']) . '</td></tr>
            <tr><td>الترتيب</td><td>' . htmlspecialchars($task['order_index']) . '</td></tr>
            <tr><td>معرف المحتوى</td><td>' . htmlspecialchars($task['content_id']) . '</td></tr>
            <tr><td>اسم المحتوى</td><td>' . htmlspecialchars($task['content_name_ar']) . '</td></tr>
            <tr><td>نوع المحتوى</td><td>' . htmlspecialchars($task['content_type'] ?? 'غير محدد') . '</td></tr>
            <tr><td><strong>رابط المحتوى (content_url)</strong></td><td class="url">' . 
                ($task['content_url'] ? '<span style="color: green;">' . htmlspecialchars($task['content_url']) . '</span>' : 
                '<span style="color: red;">❌ فارغ أو غير موجود</span>') . '</td></tr>
        </table>';
        
        if (empty($task['content_url']) || trim($task['content_url']) === '') {
            echo '<div class="error">
                <h3>⚠️ المشكلة: رابط المحتوى فارغ!</h3>
                <p>يجب تحديث جدول <code>content</code> وإضافة <code>content_url</code> للمحتوى رقم ' . $task['content_id'] . '</p>
                <p><strong>استخدم هذا الاستعلام:</strong></p>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
UPDATE content 
SET content_url = \'html/arabic_game.html\' 
WHERE content_id = ' . $task['content_id'] . ';
                </pre>
            </div>';
        } else {
            echo '<div class="success">
                <h3>✅ رابط المحتوى موجود</h3>
                <p>الرابط: <a href="' . htmlspecialchars($task['content_url']) . '" target="_blank">' . htmlspecialchars($task['content_url']) . '</a></p>
            </div>';
        }
        
        // جلب جميع المهام للطفل
        $stmt2 = $pdo->prepare("
            SELECT 
                t.task_id,
                t.task_name_ar,
                t.order_index,
                t.status,
                c.content_url
            FROM tasks t
            JOIN content c ON t.content_id = c.content_id
            WHERE t.child_id = ?
            ORDER BY t.order_index ASC
        ");
        $stmt2->execute([$child_id]);
        $allTasks = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        
        echo '<h2>جميع مهام الطفل</h2>';
        echo '<table>
            <tr>
                <th>الترتيب</th>
                <th>اسم المهمة</th>
                <th>الحالة</th>
                <th>رابط المحتوى</th>
            </tr>';
        
        foreach ($allTasks as $t) {
            $statusColor = $t['status'] === 'pending' ? '#ff9800' : ($t['status'] === 'completed' ? '#4caf50' : '#2196f3');
            echo '<tr>
                <td>' . $t['order_index'] . '</td>
                <td>' . htmlspecialchars($t['task_name_ar']) . '</td>
                <td><span style="color: ' . $statusColor . ';">' . htmlspecialchars($t['status']) . '</span></td>
                <td class="url">' . ($t['content_url'] ? htmlspecialchars($t['content_url']) : '<span style="color: red;">❌ فارغ</span>') . '</td>
            </tr>';
        }
        
        echo '</table>';
        
    } else {
        echo '<div class="error">
            <h3>❌ لا توجد مهمة متاحة</h3>
            <p>لا توجد مهمة في حالة "pending" للطفل رقم ' . $child_id . '</p>
        </div>';
        
        // جلب جميع المهام للطفل
        $stmt2 = $pdo->prepare("
            SELECT 
                t.task_id,
                t.task_name_ar,
                t.order_index,
                t.status
            FROM tasks t
            WHERE t.child_id = ?
            ORDER BY t.order_index ASC
        ");
        $stmt2->execute([$child_id]);
        $allTasks = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($allTasks) > 0) {
            echo '<h2>جميع مهام الطفل (جميع الحالات)</h2>';
            echo '<table>
                <tr>
                    <th>الترتيب</th>
                    <th>اسم المهمة</th>
                    <th>الحالة</th>
                </tr>';
            
            foreach ($allTasks as $t) {
                $statusColor = $t['status'] === 'pending' ? '#ff9800' : ($t['status'] === 'completed' ? '#4caf50' : '#2196f3');
                echo '<tr>
                    <td>' . $t['order_index'] . '</td>
                    <td>' . htmlspecialchars($t['task_name_ar']) . '</td>
                    <td><span style="color: ' . $statusColor . ';">' . htmlspecialchars($t['status']) . '</span></td>
                </tr>';
            }
            
            echo '</table>';
        }
    }
    
    echo '</div></body></html>';
    
} catch(PDOException $e) {
    echo '<div class="error">
        <h3>❌ خطأ في قاعدة البيانات</h3>
        <p>' . htmlspecialchars($e->getMessage()) . '</p>
    </div>';
}
?>

