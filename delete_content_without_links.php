<?php
/**
 * حذف المحتويات التي لا تحتوي على رابط صحيح
 * هذا السكريبت يحذف جميع المحتويات التي:
 * 1. لا تحتوي على content_url (NULL أو فارغ)
 * 2. تحتوي على روابط تجريبية (example.com أو VIDEO_ID_)
 */

header('Content-Type: text/html; charset=utf-8');
require_once 'config/database.php';

try {
    // عرض المحتويات التي سيتم حذفها (للتحقق)
    $checkStmt = $pdo->prepare("
        SELECT 
            content_id,
            content_name_ar,
            content_type,
            content_url,
            category
        FROM content
        WHERE 
            content_url IS NULL 
            OR content_url = '' 
            OR content_url LIKE '%example.com%'
            OR content_url LIKE '%VIDEO_ID_%'
            OR content_url = 'YOUR_YOUTUBE_LINK_HERE'
        ORDER BY content_id
    ");
    
    $checkStmt->execute();
    $contentToDelete = $checkStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $count = count($contentToDelete);
    
    echo "<!DOCTYPE html>";
    echo "<html dir='rtl' lang='ar'>";
    echo "<head>";
    echo "<meta charset='UTF-8'>";
    echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    echo "<title>حذف المحتويات بدون روابط</title>";
    echo "<style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 10px;
        }
        .info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-right: 4px solid #2196f3;
        }
        .warning {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-right: 4px solid #ffc107;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: right;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #6366f1;
            color: white;
        }
        tr:hover {
            background: #f5f5f5;
        }
        .btn {
            background: #dc3545;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        .btn:hover {
            background: #c82333;
        }
        .btn-success {
            background: #28a745;
        }
        .btn-success:hover {
            background: #218838;
        }
        .btn-secondary {
            background: #6c757d;
        }
        .btn-secondary:hover {
            background: #5a6268;
        }
    </style>";
    echo "</head>";
    echo "<body>";
    echo "<div class='container'>";
    echo "<h1>🗑️ حذف المحتويات بدون روابط</h1>";
    
    if ($count > 0) {
        echo "<div class='warning'>";
        echo "<strong>⚠️ تحذير:</strong> سيتم حذف <strong>{$count}</strong> محتوى بدون رابط صحيح.";
        echo "<br>سيتم حذف المهام المرتبطة بهذه المحتويات تلقائياً.";
        echo "</div>";
        
        echo "<h2>المحتويات التي سيتم حذفها:</h2>";
        echo "<table>";
        echo "<tr>";
        echo "<th>المعرف</th>";
        echo "<th>الاسم</th>";
        echo "<th>النوع</th>";
        echo "<th>الرابط</th>";
        echo "<th>الفئة</th>";
        echo "</tr>";
        
        foreach ($contentToDelete as $content) {
            echo "<tr>";
            echo "<td>{$content['content_id']}</td>";
            echo "<td>{$content['content_name_ar']}</td>";
            echo "<td>{$content['content_type']}</td>";
            echo "<td>" . ($content['content_url'] ? htmlspecialchars(substr($content['content_url'], 0, 50)) . '...' : 'فارغ') . "</td>";
            echo "<td>{$content['category']}</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // إذا تم الضغط على زر الحذف
        if (isset($_POST['confirm_delete']) && $_POST['confirm_delete'] === 'yes') {
            $deleteStmt = $pdo->prepare("
                DELETE FROM content
                WHERE 
                    content_url IS NULL 
                    OR content_url = '' 
                    OR content_url LIKE '%example.com%'
                    OR content_url LIKE '%VIDEO_ID_%'
                    OR content_url = 'YOUR_YOUTUBE_LINK_HERE'
            ");
            
            $deleteStmt->execute();
            $deletedCount = $deleteStmt->rowCount();
            
            // جلب عدد المحتويات المتبقية
            $remainingStmt = $pdo->query("SELECT COUNT(*) as count FROM content");
            $remaining = $remainingStmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<div class='info' style='background: #d4edda; border-right-color: #28a745;'>";
            echo "<strong>✅ تم الحذف بنجاح!</strong><br>";
            echo "تم حذف <strong>{$deletedCount}</strong> محتوى.<br>";
            echo "عدد المحتويات المتبقية: <strong>{$remaining['count']}</strong>";
            echo "</div>";
            
            echo "<a href='delete_content_without_links.php' class='btn btn-secondary'>العودة</a>";
        } else {
            echo "<form method='POST' onsubmit='return confirm(\"هل أنت متأكد من حذف {$count} محتوى؟ هذا الإجراء لا يمكن التراجع عنه.\");'>";
            echo "<input type='hidden' name='confirm_delete' value='yes'>";
            echo "<button type='submit' class='btn'>🗑️ حذف جميع المحتويات المحددة</button>";
            echo "<a href='html/parent_dashboard.html' class='btn btn-secondary'>إلغاء</a>";
            echo "</form>";
        }
    } else {
        echo "<div class='info'>";
        echo "<strong>✅ لا توجد محتويات بدون روابط!</strong><br>";
        echo "جميع المحتويات تحتوي على روابط صحيحة.";
        echo "</div>";
        
        // جلب عدد المحتويات المتبقية
        $remainingStmt = $pdo->query("SELECT COUNT(*) as count FROM content");
        $remaining = $remainingStmt->fetch(PDO::FETCH_ASSOC);
        echo "<p>عدد المحتويات الإجمالي: <strong>{$remaining['count']}</strong></p>";
        
        echo "<a href='html/parent_dashboard.html' class='btn btn-success'>العودة للوحة التحكم</a>";
    }
    
    echo "</div>";
    echo "</body>";
    echo "</html>";
    
} catch(PDOException $e) {
    echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24;'>";
    echo "<strong>❌ خطأ:</strong> " . htmlspecialchars($e->getMessage());
    echo "</div>";
}
?>

