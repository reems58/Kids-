<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['child_name']) || !isset($data['parent_id'])) {
    echo json_encode(['success' => false, 'message' => 'البيانات المطلوبة غير مكتملة']);
    exit;
}

$child_name = trim($data['child_name']);
$parent_id = (int)$data['parent_id'];
$age = isset($data['age']) ? (int)$data['age'] : null;
$gender = isset($data['gender']) ? $data['gender'] : null;
$birth_date = isset($data['birth_date']) ? $data['birth_date'] : null;

if (empty($child_name)) {
    echo json_encode(['success' => false, 'message' => 'اسم الطفل مطلوب']);
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
} else {
    // إذا لم يكن هناك عمر ولا تاريخ ميلاد
    echo json_encode([
        'success' => false, 
        'message' => 'يجب إدخال تاريخ الميلاد أو العمر. العمر يجب أن يكون بين 4 و 12 سنة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // التأكد من أن العمر محسوب وصحيح قبل الإدراج
    if (!$age || $age < 4 || $age > 12) {
        echo json_encode([
            'success' => false, 
            'message' => "عمر الطفل غير مناسب. يجب أن يكون العمر بين 4 و 12 سنة فقط."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO children (child_name, parent_id, age, gender, birth_date) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([$child_name, $parent_id, $age, $gender, $birth_date]);
    $child_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'تم إضافة الطفل بنجاح',
        'child_id' => $child_id
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في إضافة الطفل: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

