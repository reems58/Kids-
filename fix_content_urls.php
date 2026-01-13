<?php
/**
 * ملف لإصلاح روابط المحتوى الفارغة
 * استخدم: http://localhost/kids_learning/fix_content_urls.php
 */
header('Content-Type: text/html; charset=utf-8');
require_once 'config/database.php';

// روابط الألعاب حسب نوع المحتوى
$defaultUrls = [
    'عربي' => 'html/arabic_game.html',
    'رياضيات' => 'html/math_game.html',
    'علوم' => 'html/science_animals_game.html'
];

try {
    // جلب جميع المحتويات التي لا تحتوي على رابط
    $stmt = $pdo->prepare("
        SELECT 
            c.content_id,
            c.content_name_ar,
            c.category,
            c.content_type,
            COUNT(t.task_id) as task_count
        FROM content c
        LEFT JOIN tasks t ON c.content_id = t.content_id
        WHERE (c.content_url IS NULL OR c.content_url = '' OR c.content_url LIKE '%example.com%')
        GROUP BY c.content_id
    ");
    
    $stmt->execute();
    $contents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo '<!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>إصلاح روابط المحتوى</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 10px; max-width: 900px; margin: 0 auto; }
            h1 { color: #333; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .success { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 10px 0; color: #2e7d32; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: right; border: 1px solid #ddd; }
            th { background: #667eea; color: white; }
            .btn { background: #4caf50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
            .btn:hover { background: #45a049; }
            .btn-danger { background: #f44336; }
            .btn-danger:hover { background: #da190b; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 إصلاح روابط المحتوى</h1>';
    
    if (count($contents) > 0) {
        echo '<div class="info">
            <h3>تم العثور على ' . count($contents) . ' محتوى بدون رابط</h3>
        </div>';
        
        echo '<table>
            <tr>
                <th>معرف المحتوى</th>
                <th>اسم المحتوى</th>
                <th>الفئة</th>
                <th>عدد المهام</th>
                <th>الرابط المقترح</th>
                <th>إجراء</th>
            </tr>';
        
        foreach ($contents as $content) {
            $suggestedUrl = '';
            if (isset($defaultUrls[$content['category']])) {
                $suggestedUrl = $defaultUrls[$content['category']];
            } else {
                // محاولة تخمين الرابط من الاسم
                if (stripos($content['content_name_ar'], 'عربي') !== false || stripos($content['content_name_ar'], 'حروف') !== false) {
                    $suggestedUrl = 'html/arabic_game.html';
                } elseif (stripos($content['content_name_ar'], 'رياض') !== false || stripos($content['content_name_ar'], 'أرقام') !== false) {
                    $suggestedUrl = 'html/math_game.html';
                } elseif (stripos($content['content_name_ar'], 'علوم') !== false || stripos($content['content_name_ar'], 'حيوانات') !== false) {
                    $suggestedUrl = 'html/science_animals_game.html';
                } else {
                    $suggestedUrl = 'html/arabic_game.html'; // افتراضي
                }
            }
            
            echo '<tr>
                <td>' . $content['content_id'] . '</td>
                <td>' . htmlspecialchars($content['content_name_ar']) . '</td>
                <td>' . htmlspecialchars($content['category'] ?? 'غير محدد') . '</td>
                <td>' . $content['task_count'] . '</td>
                <td><code>' . htmlspecialchars($suggestedUrl) . '</code></td>
                <td>
                    <a href="?fix=' . $content['content_id'] . '&url=' . urlencode($suggestedUrl) . '" class="btn">إصلاح</a>
                </td>
            </tr>';
        }
        
        echo '</table>';
        
        // معالجة طلب الإصلاح
        if (isset($_GET['fix']) && isset($_GET['url'])) {
            $content_id = (int)$_GET['fix'];
            $url = $_GET['url'];
            
            $updateStmt = $pdo->prepare("UPDATE content SET content_url = ? WHERE content_id = ?");
            $updateStmt->execute([$url, $content_id]);
            
            echo '<div class="success">
                <h3>✅ تم تحديث رابط المحتوى بنجاح!</h3>
                <p>تم تحديث المحتوى رقم ' . $content_id . ' برابط: ' . htmlspecialchars($url) . '</p>
                <a href="?" class="btn">تحديث الصفحة</a>
            </div>';
        }
        
        // زر لإصلاح الكل
        echo '<div style="margin-top: 20px;">
            <h3>إصلاح تلقائي لجميع المحتويات:</h3>
            <p>سيتم إصلاح جميع المحتويات تلقائياً حسب الفئة</p>
            <a href="?fix_all=1" class="btn" onclick="return confirm(\'هل أنت متأكد من إصلاح جميع المحتويات؟\')">إصلاح الكل تلقائياً</a>
        </div>';
        
        // معالجة إصلاح الكل
        if (isset($_GET['fix_all'])) {
            $fixed = 0;
            foreach ($contents as $content) {
                $suggestedUrl = '';
                if (isset($defaultUrls[$content['category']])) {
                    $suggestedUrl = $defaultUrls[$content['category']];
                } else {
                    if (stripos($content['content_name_ar'], 'عربي') !== false || stripos($content['content_name_ar'], 'حروف') !== false) {
                        $suggestedUrl = 'html/arabic_game.html';
                    } elseif (stripos($content['content_name_ar'], 'رياض') !== false) {
                        $suggestedUrl = 'html/math_game.html';
                    } elseif (stripos($content['content_name_ar'], 'علوم') !== false) {
                        $suggestedUrl = 'html/science_animals_game.html';
                    } else {
                        $suggestedUrl = 'html/arabic_game.html';
                    }
                }
                
                $updateStmt = $pdo->prepare("UPDATE content SET content_url = ? WHERE content_id = ?");
                $updateStmt->execute([$suggestedUrl, $content['content_id']]);
                $fixed++;
            }
            
            echo '<div class="success">
                <h3>✅ تم إصلاح ' . $fixed . ' محتوى بنجاح!</h3>
                <a href="?" class="btn">تحديث الصفحة</a>
            </div>';
        }
        
    } else {
        echo '<div class="success">
            <h3>✅ ممتاز! جميع المحتويات تحتوي على روابط</h3>
            <p>لا توجد محتويات تحتاج إلى إصلاح</p>
        </div>';
    }
    
    echo '</div></body></html>';
    
} catch(PDOException $e) {
    echo '<div style="background: #ffebee; padding: 15px; border-radius: 5px; color: #c62828;">
        <h3>❌ خطأ في قاعدة البيانات</h3>
        <p>' . htmlspecialchars($e->getMessage()) . '</p>
    </div>';
}
?>

