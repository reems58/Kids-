<?php
/**
 * حذف فيديوهات YouTube للعمر 4 سنوات
 * هذا السكريبت يحذف جميع فيديوهات YouTube الخاصة بالعمر 4 سنوات
 */

header('Content-Type: text/html; charset=utf-8');
require_once 'config/database.php';

try {
    // عرض الفيديوهات التي سيتم حذفها (للتحقق)
    $checkStmt = $pdo->prepare("
        SELECT 
            content_id,
            content_name_ar,
            content_type,
            content_url,
            content_category,
            min_age,
            max_age
        FROM content
        WHERE 
            content_type = 'فيديو'
            AND min_age = 4
            AND max_age = 4
            AND (
                content_url LIKE '%youtube.com%' 
                OR content_url LIKE '%youtu.be%'
            )
        ORDER BY content_category, content_id
    ");
    
    $checkStmt->execute();
    $videosToDelete = $checkStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $count = count($videosToDelete);
    
    echo "<!DOCTYPE html>";
    echo "<html dir='rtl' lang='ar'>";
    echo "<head>";
    echo "<meta charset='UTF-8'>";
    echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    echo "<title>حذف فيديوهات YouTube للعمر 4 سنوات</title>";
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
            border-bottom: 3px solid #dc3545;
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
        .success {
            background: #d4edda;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-right: 4px solid #28a745;
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
            background: #dc3545;
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
            text-decoration: none;
            display: inline-block;
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
        .url-cell {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    </style>";
    echo "</head>";
    echo "<body>";
    echo "<div class='container'>";
    echo "<h1>🗑️ حذف فيديوهات YouTube للعمر 4 سنوات</h1>";
    
    if ($count > 0) {
        echo "<div class='warning'>";
        echo "<strong>⚠️ تحذير:</strong> سيتم حذف <strong>{$count}</strong> فيديو YouTube للعمر 4 سنوات.";
        echo "<br>سيتم حذف المهام المرتبطة بهذه الفيديوهات تلقائياً.";
        echo "</div>";
        
        echo "<h2>الفيديوهات التي سيتم حذفها:</h2>";
        echo "<table>";
        echo "<tr>";
        echo "<th>المعرف</th>";
        echo "<th>الاسم</th>";
        echo "<th>الفئة</th>";
        echo "<th>الرابط</th>";
        echo "<th>العمر</th>";
        echo "</tr>";
        
        foreach ($videosToDelete as $video) {
            echo "<tr>";
            echo "<td>{$video['content_id']}</td>";
            echo "<td>{$video['content_name_ar']}</td>";
            echo "<td>{$video['content_category']}</td>";
            echo "<td class='url-cell'>" . htmlspecialchars($video['content_url']) . "</td>";
            echo "<td>{$video['min_age']} سنوات</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // إذا تم الضغط على زر الحذف
        if (isset($_POST['confirm_delete']) && $_POST['confirm_delete'] === 'yes') {
            $deleteStmt = $pdo->prepare("
                DELETE FROM content
                WHERE 
                    content_type = 'فيديو'
                    AND min_age = 4
                    AND max_age = 4
                    AND (
                        content_url LIKE '%youtube.com%' 
                        OR content_url LIKE '%youtu.be%'
                    )
            ");
            
            $deleteStmt->execute();
            $deletedCount = $deleteStmt->rowCount();
            
            // جلب عدد المحتويات المتبقية
            $remainingStmt = $pdo->query("SELECT COUNT(*) as count FROM content");
            $remaining = $remainingStmt->fetch(PDO::FETCH_ASSOC);
            
            // جلب عدد فيديوهات YouTube المتبقية للعمر 4
            $remainingVideosStmt = $pdo->query("
                SELECT COUNT(*) as count 
                FROM content
                WHERE 
                    content_type = 'فيديو'
                    AND min_age = 4
                    AND max_age = 4
                    AND (
                        content_url LIKE '%youtube.com%' 
                        OR content_url LIKE '%youtu.be%'
                    )
            ");
            $remainingVideos = $remainingVideosStmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<div class='success'>";
            echo "<strong>✅ تم الحذف بنجاح!</strong><br>";
            echo "تم حذف <strong>{$deletedCount}</strong> فيديو YouTube للعمر 4 سنوات.<br>";
            echo "عدد المحتويات المتبقية: <strong>{$remaining['count']}</strong><br>";
            echo "عدد فيديوهات YouTube المتبقية للعمر 4: <strong>{$remainingVideos['count']}</strong>";
            echo "</div>";
            
            echo "<a href='delete_youtube_videos_age_4.php' class='btn btn-secondary'>العودة</a>";
        } else {
            echo "<form method='POST' onsubmit='return confirm(\"هل أنت متأكد من حذف {$count} فيديو YouTube للعمر 4 سنوات؟ هذا الإجراء لا يمكن التراجع عنه.\");'>";
            echo "<input type='hidden' name='confirm_delete' value='yes'>";
            echo "<button type='submit' class='btn'>🗑️ حذف جميع الفيديوهات المحددة</button>";
            echo "<a href='html/parent_dashboard.html' class='btn btn-secondary'>إلغاء</a>";
            echo "</form>";
        }
    } else {
        echo "<div class='info'>";
        echo "<strong>✅ لا توجد فيديوهات YouTube للعمر 4 سنوات!</strong><br>";
        echo "جميع فيديوهات YouTube للعمر 4 سنوات تم حذفها أو لا توجد في قاعدة البيانات.";
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

