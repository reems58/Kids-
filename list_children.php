<?php
/**
 * ملف لعرض جميع الأطفال مع معرفاتهم
 * استخدم: http://localhost/kids_learning/list_children.php
 */
header('Content-Type: text/html; charset=utf-8');
require_once 'config/database.php';

try {
    // جلب جميع الأطفال
    $stmt = $pdo->prepare("
        SELECT 
            c.child_id,
            c.child_name,
            c.birth_date,
            CONCAT(p.first_name, ' ', p.last_name) as parent_name,
            (SELECT COUNT(*) FROM tasks WHERE child_id = c.child_id) as tasks_count,
            (SELECT COUNT(*) FROM tasks WHERE child_id = c.child_id AND status = 'pending') as pending_tasks
        FROM children c
        LEFT JOIN parents p ON c.parent_id = p.id
        ORDER BY c.child_id ASC
    ");
    
    $stmt->execute();
    $children = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo '<!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>قائمة الأطفال</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 10px; max-width: 1000px; margin: 0 auto; }
            h1 { color: #333; text-align: center; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: right; border: 1px solid #ddd; }
            th { background: #667eea; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            tr:hover { background: #f0f0f0; }
            .btn { background: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 2px; }
            .btn:hover { background: #45a049; }
            .btn-primary { background: #2196f3; }
            .btn-primary:hover { background: #0b7dda; }
            .child-id { font-weight: bold; color: #667eea; font-size: 1.2em; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 0.85em; font-weight: bold; }
            .badge-success { background: #4caf50; color: white; }
            .badge-warning { background: #ff9800; color: white; }
            .badge-info { background: #2196f3; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>👶 قائمة الأطفال</h1>
            
            <div class="info">
                <h3>📋 كيفية الاستخدام:</h3>
                <ol>
                    <li>ابحث عن اسم الطفل في الجدول أدناه</li>
                    <li>انظر إلى عمود "معرف الطفل" - هذا هو الرقم الذي تحتاجه</li>
                    <li>استخدم هذا الرقم في الروابط:
                        <ul>
                            <li><code>check_task_content.php?child_id=<strong>الرقم</strong></code></li>
                            <li><code>child_view.html?child_id=<strong>الرقم</strong></code></li>
                        </ul>
                    </li>
                </ol>
            </div>';
    
    if (count($children) > 0) {
        echo '<table>
            <tr>
                <th>معرف الطفل</th>
                <th>اسم الطفل</th>
                <th>اسم الأهل</th>
                <th>تاريخ الميلاد</th>
                <th>عدد المهام</th>
                <th>المهام المعلقة</th>
                <th>إجراءات</th>
            </tr>';
        
        foreach ($children as $child) {
            $birthDate = $child['birth_date'] ? date('Y-m-d', strtotime($child['birth_date'])) : 'غير محدد';
            $tasksCount = $child['tasks_count'] ?? 0;
            $pendingTasks = $child['pending_tasks'] ?? 0;
            
            echo '<tr>
                <td class="child-id">' . $child['child_id'] . '</td>
                <td><strong>' . htmlspecialchars($child['child_name']) . '</strong></td>
                <td>' . htmlspecialchars($child['parent_name'] ?? 'غير محدد') . '</td>
                <td>' . $birthDate . '</td>
                <td><span class="badge badge-info">' . $tasksCount . '</span></td>
                <td><span class="badge ' . ($pendingTasks > 0 ? 'badge-warning' : 'badge-success') . '">' . $pendingTasks . '</span></td>
                <td>
                    <a href="check_task_content.php?child_id=' . $child['child_id'] . '" class="btn btn-primary" target="_blank">فحص المهام</a>
                    <a href="html/child_view.html?child_id=' . $child['child_id'] . '" class="btn" target="_blank">فتح صفحة الطفل</a>
                </td>
            </tr>';
        }
        
        echo '</table>';
        
        echo '<div class="info">
            <h3>💡 نصائح:</h3>
            <ul>
                <li>اضغط على "فحص المهام" لرؤية تفاصيل مهام الطفل</li>
                <li>اضغط على "فتح صفحة الطفل" لفتح صفحة الطفل مباشرة</li>
                <li>إذا كان "المهام المعلقة" = 0، فهذا يعني أن جميع المهام مكتملة أو لا توجد مهام</li>
            </ul>
        </div>';
        
    } else {
        echo '<div style="background: #ffebee; padding: 15px; border-radius: 5px; color: #c62828;">
            <h3>❌ لا توجد أطفال مسجلين</h3>
            <p>يرجى إضافة طفل أولاً من لوحة تحكم الأهل</p>
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

