<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['child_id']) || !isset($data['child_name'])) {
    echo json_encode(['success' => false, 'message' => 'معرف الطفل والاسم مطلوبان']);
    exit;
}

// التحقق من تسجيل الدخول
$parent_id = isset($_SESSION['parent_id']) ? $_SESSION['parent_id'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null);

if (!$parent_id) {
    echo json_encode(['success' => false, 'message' => 'غير مسجل دخول']);
    exit;
}

$child_id = (int)$data['child_id'];
$child_name = trim($data['child_name']);
$age = isset($data['age']) && !empty($data['age']) ? (int)$data['age'] : null;
$gender = isset($data['gender']) ? $data['gender'] : null;
$birth_date = isset($data['birth_date']) && !empty($data['birth_date']) ? $data['birth_date'] : null;

if (empty($child_name)) {
    echo json_encode(['success' => false, 'message' => 'اسم الطفل مطلوب']);
    exit;
}

try {
    // التحقق من ملكية الطفل
    $checkStmt = $pdo->prepare("SELECT child_id FROM children WHERE child_id = ? AND parent_id = ?");
    $checkStmt->execute([$child_id, $parent_id]);
    if (!$checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'الطفل غير موجود أو ليس لديك صلاحية للتعديل']);
        exit;
    }
    
    // حساب العمر من تاريخ الميلاد إذا كان موجوداً
    if ($birth_date && !$age) {
        try {
            $birthDate = new DateTime($birth_date);
            $today = new DateTime();
            $diff = $today->diff($birthDate);
            $age = $diff->y;
        } catch (Exception $e) {
            // إذا فشل حساب العمر، نستخدم العمر المدخل إن وجد
        }
    }
    
    // التحقق من العمر (يجب أن يكون بين 4 و 12 سنة)
    if ($age !== null && $age > 0) {
        if ($age < 4 || $age > 12) {
            echo json_encode([
                'success' => false, 
                'message' => "عمر الطفل ({$age} سنوات) غير مناسب. يجب أن يكون العمر بين 4 و 12 سنة فقط."
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } else if ($birth_date) {
        // إذا كان هناك تاريخ ميلاد، يجب حساب العمر والتحقق منه
        try {
            $birthDate = new DateTime($birth_date);
            $today = new DateTime();
            $diff = $today->diff($birthDate);
            $calculatedAge = $diff->y;
            
            if ($calculatedAge < 4 || $calculatedAge > 12) {
                echo json_encode([
                    'success' => false, 
                    'message' => "عمر الطفل ({$calculatedAge} سنوات) غير مناسب. يجب أن يكون العمر بين 4 و 12 سنة فقط."
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $age = $calculatedAge;
        } catch (Exception $e) {
            echo json_encode([
                'success' => false, 
                'message' => 'تاريخ الميلاد غير صحيح'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    
    // بناء استعلام التحديث
    $updateFields = ['child_name = ?'];
    $params = [$child_name];
    
    if ($age !== null && $age > 0) {
        $updateFields[] = 'age = ?';
        $params[] = $age;
    }
    
    if ($gender !== null) {
        $updateFields[] = 'gender = ?';
        $params[] = $gender;
    }
    
    if ($birth_date !== null) {
        $updateFields[] = 'birth_date = ?';
        $params[] = $birth_date;
    }
    
    $params[] = $child_id; // للمكان الصحيح في WHERE
    $params[] = $parent_id; // للتحقق من الملكية
    
    $sql = "UPDATE children SET " . implode(', ', $updateFields) . " WHERE child_id = ? AND parent_id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث بيانات الطفل بنجاح',
        'child_id' => $child_id
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في تحديث بيانات الطفل: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

