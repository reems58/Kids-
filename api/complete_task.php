<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

error_log("=== complete_task: Received data ===");
error_log("Raw input: " . substr($raw_input, 0, 500)); // أول 500 حرف فقط
error_log("Decoded data: " . json_encode($data, JSON_UNESCAPED_UNICODE));
error_log("all_questions_answered in data: " . var_export($data['all_questions_answered'] ?? 'NOT SET', true));
error_log("====================================");

if (!isset($data['child_id']) || !isset($data['task_id'])) {
    echo json_encode(['success' => false, 'message' => 'البيانات المطلوبة غير مكتملة']);
    exit;
}

$child_id = (int)$data['child_id'];
$task_id = (int)$data['task_id'];
$session_id = isset($data['session_id']) ? (int)$data['session_id'] : null;
$duration = isset($data['duration']) ? (int)$data['duration'] : 0;
// قراءة all_questions_answered من البيانات المرسلة
$all_questions_answered = false;
if (isset($data['all_questions_answered'])) {
    $raw_value = $data['all_questions_answered'];
    
    // معالجة القيمة: قد تكون boolean true/false أو string "true"/"false" أو 1/0
    // تحويل إلى boolean صريح
    if ($raw_value === true || $raw_value === 'true' || $raw_value === 1 || $raw_value === '1') {
        $all_questions_answered = true;
    } else {
        $all_questions_answered = false;
    }
    
    error_log("complete_task: all_questions_answered - raw=" . var_export($raw_value, true) . " (type: " . gettype($raw_value) . "), processed=" . ($all_questions_answered ? 'true' : 'false') . " (type: " . gettype($all_questions_answered) . ")");
} else {
    error_log("complete_task: all_questions_answered NOT SET in data");
}

// جلب نسبة الإكمال - إذا لم يتم إرسالها، نحسبها من الجلسة الحالية أو نضع 0
$completed_percentage = 0;
if (isset($data['completed_percentage'])) {
    $completed_percentage = (int)$data['completed_percentage'];
    error_log("complete_task: received completed_percentage = $completed_percentage from client");
} elseif ($session_id) {
    // محاولة جلب النسبة من الجلسة الحالية إذا كانت موجودة
    try {
        $stmt = $pdo->prepare("SELECT completed_percentage FROM sessions WHERE session_id = ?");
        $stmt->execute([$session_id]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($session && isset($session['completed_percentage'])) {
            $completed_percentage = (int)$session['completed_percentage'];
            error_log("complete_task: using existing session completed_percentage = $completed_percentage");
        } else {
            error_log("WARNING: complete_task: completed_percentage not provided and session not found, using 0");
        }
    } catch (PDOException $e) {
        error_log("Error fetching session percentage: " . $e->getMessage());
        error_log("WARNING: complete_task: completed_percentage not provided, using 0");
    }
} else {
    error_log("WARNING: complete_task: completed_percentage not provided and no session_id, using 0");
}

// التأكد من أن النسبة بين 0 و 100
$completed_percentage = max(0, min(100, $completed_percentage));
error_log("complete_task: final completed_percentage = $completed_percentage");

try {
    $pdo->beginTransaction();
    
    // حساب النجوم بناءً على نسبة الإكمال
    // 100% = 5 نجوم، 80-99% = 4 نجوم، 60-79% = 3 نجوم، 40-59% = 2 نجوم، 1-39% = 1 نجمة، 0% = 0 نجوم
    $stars = 0;
    if ($completed_percentage >= 100) {
        $stars = 5;
    } elseif ($completed_percentage >= 80) {
        $stars = 4;
    } elseif ($completed_percentage >= 60) {
        $stars = 3;
    } elseif ($completed_percentage >= 40) {
        $stars = 2;
    } elseif ($completed_percentage > 0) {
        $stars = 1;
    } else {
        $stars = 0; // 0% = 0 نجوم
    }
    
    // تحديث الجلسة مع نسبة الإكمال والنجوم
    $session_status = 'paused'; // افتراضي: متوقفة
    if ($session_id) {
        // جلب الحالة الحالية للجلسة للتحقق من عدم تغييرها من completed إلى paused
        $stmt = $pdo->prepare("SELECT status FROM sessions WHERE session_id = ?");
        $stmt->execute([$session_id]);
        $current_session = $stmt->fetch(PDO::FETCH_ASSOC);
        $current_session_status = $current_session ? $current_session['status'] : null;
        
        // تحديد حالة الجلسة: مكتملة إذا كانت النسبة 100% أو إذا انتهت اللعبة (حل جميع الأسئلة)
        // استخدام === true للتأكد من أن القيمة boolean true وليس string "true"
        // التأكد من أن $all_questions_answered هو boolean true
        $is_all_answered = ($all_questions_answered === true);
        $should_complete = ($completed_percentage >= 100 || $is_all_answered);
        
        // إذا كانت الجلسة مكتملة مسبقاً، لا نسمح بتغييرها إلى paused
        // إلا إذا كان المستخدم يريد إعادة فتح المهمة (وهذا سيتم في مكان آخر)
        if ($current_session_status === 'completed' && !$should_complete && !$is_all_answered) {
            // إذا كانت الجلسة مكتملة مسبقاً ولا يوجد all_questions_answered، نحافظ على الحالة completed
            $session_status = 'completed';
            error_log("SESSION_PROTECTION: Session $session_id was already completed, keeping status as completed");
        } else {
            $session_status = $should_complete ? 'completed' : 'paused';
        }
        
        $all_answered_str = var_export($all_questions_answered, true);
        $all_answered_type = gettype($all_questions_answered);
        $is_all_answered_str = $is_all_answered ? 'YES' : 'NO';
        $should_complete_str = $should_complete ? 'true' : 'false';
        error_log("SESSION_STATUS_DECISION: session_id=$session_id | current_status=$current_session_status | completed_percentage=$completed_percentage | all_questions_answered=$all_answered_str (type:$all_answered_type) | is_all_answered=$is_all_answered_str | should_complete=$should_complete_str | final_session_status=$session_status");
        
        // حساب الوقت الفعلي من start_time و end_time بدلاً من الاعتماد على duration المرسل
        // هذا يضمن دقة الوقت حتى لو كان duration من JavaScript غير دقيق
        // استخدام الثواني للدقة ثم تحويل للدقائق
        $stmt = $pdo->prepare("
            UPDATE sessions 
            SET end_time = NOW(), 
                duration_minutes = GREATEST(?, CEIL(TIMESTAMPDIFF(SECOND, start_time, NOW()) / 60.0)),
                completed_percentage = ?, 
                stars = ?,
                status = ?
            WHERE session_id = ?
        ");
        $stmt->execute([$duration, $completed_percentage, $stars, $session_status, $session_id]);
    } else {
        // إذا لم تكن هناك جلسة موجودة، ننشئ جلسة جديدة (في حالة إغلاق النافذة قبل بدء الجلسة)
        // لكن يجب أن تكون الجلسة قد تم إنشاؤها مسبقاً من start_session.php
        // لذلك ننشئ جلسة جديدة فقط إذا كانت هناك محاولة للحفظ
        // تحديد حالة الجلسة: مكتملة إذا كانت النسبة 100% أو إذا انتهت اللعبة (حل جميع الأسئلة)
        // استخدام === true للتأكد من أن القيمة boolean true وليس string "true"
        $is_all_answered = ($all_questions_answered === true);
        $should_complete = ($completed_percentage >= 100 || $is_all_answered);
        $session_status = $should_complete ? 'completed' : 'paused';
        
        $all_answered_str = var_export($all_questions_answered, true);
        $all_answered_type = gettype($all_questions_answered);
        $is_all_answered_str = $is_all_answered ? 'YES' : 'NO';
        $should_complete_str = $should_complete ? 'true' : 'false';
        error_log("NEW_SESSION_DECISION: completed_percentage=$completed_percentage | all_questions_answered=$all_answered_str (type:$all_answered_type) | is_all_answered=$is_all_answered_str | should_complete=$should_complete_str | session_status=$session_status");
        
        // إنشاء جلسة جديدة مع start_time في الماضي (قبل duration)
        $stmt = $pdo->prepare("
            INSERT INTO sessions (child_id, task_id, start_time, end_time, duration_minutes, completed_percentage, stars, status)
            VALUES (?, ?, DATE_SUB(NOW(), INTERVAL ? MINUTE), NOW(), ?, ?, ?, ?)
        ");
        $stmt->execute([$child_id, $task_id, $duration, $duration, $completed_percentage, $stars, $session_status]);
        $session_id = $pdo->lastInsertId();
    }
    
    // تحديث حالة المهمة بناءً على حالة الجلسة
    // جلب الحالة الحالية للمهمة للتحقق من عدم تغييرها من completed إلى paused
    $stmt = $pdo->prepare("SELECT status FROM tasks WHERE task_id = ? AND child_id = ?");
    $stmt->execute([$task_id, $child_id]);
    $current_task = $stmt->fetch(PDO::FETCH_ASSOC);
    $current_task_status = $current_task ? $current_task['status'] : null;
    
    // إذا كانت المهمة مكتملة مسبقاً والجلسة أيضاً مكتملة، نحافظ على الحالة completed
    // إذا كانت المهمة مكتملة مسبقاً لكن الجلسة paused (من طلب لاحق بدون all_questions_answered)، نحافظ على completed
    if ($current_task_status === 'completed' && $session_status === 'paused' && !$is_all_answered) {
        // إذا كانت المهمة مكتملة مسبقاً والجلسة paused بدون all_questions_answered، نحافظ على completed
        $task_status = 'completed';
        error_log("TASK_PROTECTION: Task $task_id was already completed, keeping status as completed (session_status=$session_status)");
    } else {
    $task_status = ($session_status === 'completed') ? 'completed' : 'paused';
    }
    
    error_log("Updating task status: task_id=$task_id, child_id=$child_id, current_task_status=$current_task_status, session_status=$session_status, task_status=$task_status, completed_percentage=$completed_percentage");
    
    // تحديث حالة المهمة فقط إذا لم تكن مكتملة (للمهام المتوقفة يمكن إعادة فتحها)
    if ($task_status === 'completed') {
        // للمهام المكتملة: تحديث الحالة ووقت الإكمال
        $stmt = $pdo->prepare("
            UPDATE tasks 
            SET status = ?,
                time_completed = NOW()
            WHERE task_id = ? AND child_id = ?
        ");
        $stmt->execute([$task_status, $task_id, $child_id]);
        
        // التحقق من عدد الصفوف المحدثة
        $rowsAffected = $stmt->rowCount();
        error_log("Task completed update: task_id=$task_id, child_id=$child_id, status=$task_status, rows_affected=$rowsAffected");
    } else {
        // للمهام المتوقفة: تحديث الحالة دائماً (حتى لو كانت in_progress)
        // لكن لا نغير من completed إلى paused
        if ($current_task_status !== 'completed') {
        $stmt = $pdo->prepare("
            UPDATE tasks 
            SET status = ?
            WHERE task_id = ? AND child_id = ?
        ");
        $stmt->execute([$task_status, $task_id, $child_id]);
        
        // التحقق من عدد الصفوف المحدثة
        $rowsAffected = $stmt->rowCount();
            error_log("Task paused update: task_id=$task_id, child_id=$child_id, status=$task_status, rows_affected=$rowsAffected");
        } else {
            error_log("Task paused update SKIPPED: task_id=$task_id, child_id=$child_id, current_status=completed, cannot change to paused");
        }
    }
    
    // تسجيل التحديث للتشخيص
    error_log("Task status updated: task_id=$task_id, child_id=$child_id, status=$task_status, completed_percentage=$completed_percentage");
    
    // التحقق من الحالة الفعلية في قاعدة البيانات بعد التحديث
    $verifyStmt = $pdo->prepare("SELECT status FROM tasks WHERE task_id = ? AND child_id = ?");
    $verifyStmt->execute([$task_id, $child_id]);
    $actualStatus = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    error_log("Task status verification: task_id=$task_id, child_id=$child_id, actual_status_in_db=" . ($actualStatus['status'] ?? 'NOT FOUND'));
    
    // تحديث وقت الطفل الإجمالي ومجموع النجوم
    $stmt = $pdo->prepare("
        UPDATE children 
        SET total_time = total_time + ?, 
            total_stars = total_stars + ?,
            last_activity = NOW() 
        WHERE child_id = ?
    ");
    $stmt->execute([$duration, $stars, $child_id]);
    
    // تحديث اللقب بناءً على مجموع النجوم
    updateChildTitle($pdo, $child_id);
    
    // التحقق من الشارات المكتسبة بناءً على جميع المهام المكتملة
    $earned_badges = checkAndAwardBadges($pdo, $child_id, $completed_percentage, $duration);
    
    // إنشاء تقرير بعد إكمال المهمة (فقط للمهام المكتملة)
    if ($session_status === 'completed' && $session_id) {
        createReport($pdo, $child_id, $session_id, $task_id, $earned_badges, $duration, $completed_percentage, $stars);
    }
    
    $pdo->commit();
    
    // جلب اللقب الحالي للطفل
    $stmt = $pdo->prepare("SELECT title, total_stars FROM children WHERE child_id = ?");
    $stmt->execute([$child_id]);
    $child = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'تم إكمال المهمة بنجاح',
        'badges' => $earned_badges,
        'stars' => $stars,
        'total_stars' => $child['total_stars'],
        'title' => $child['title']
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في إكمال المهمة: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// دالة للتحقق من الشارات ومنحها بناءً على جميع المهام المكتملة
function checkAndAwardBadges($pdo, $child_id, $completed_percentage, $duration) {
    $earned_badges = [];
    
    // جلب إحصائيات الطفل من جميع المهام المكتملة
    $stmt = $pdo->prepare("
        SELECT 
            c.total_time,
            (SELECT COUNT(*) FROM sessions s 
             WHERE s.child_id = ? AND s.status = 'completed' AND s.completed_percentage = 100) as completed_sessions,
            (SELECT COUNT(*) FROM sessions s 
             WHERE s.child_id = ? AND s.status = 'completed') as total_sessions,
            (SELECT COUNT(DISTINCT s.task_id) FROM sessions s 
             WHERE s.child_id = ? AND s.status = 'completed') as distinct_completed_tasks
        FROM children c
        WHERE c.child_id = ?
    ");
    $stmt->execute([$child_id, $child_id, $child_id, $child_id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // جلب جميع الشارات المتاحة
    $stmt = $pdo->prepare("SELECT * FROM badges ORDER BY level ASC");
    $stmt->execute();
    $all_badges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // التحقق من كل شارة بناءً على جميع المهام المكتملة
    foreach ($all_badges as $badge) {
        $value = 0;
        
        // تحديد القيمة حسب نوع الشارة (بناءً على جميع المهام)
        if ($badge['badge_name'] == 'First Task') {
            // المهمة الأولى: أول جلسة مكتملة (بغض النظر عن نسبة الإكمال)
            $value = $stats['total_sessions'];
        } elseif ($badge['badge_name'] == 'Session Master') {
            // بطل الجلسة: عدد الجلسات المكتملة بنسبة 100% من جميع المهام
            $value = $stats['completed_sessions'];
        } elseif ($badge['badge_name'] == 'Time Champion') {
            // بطل الوقت: الوقت الإجمالي بالدقائق من جميع المهام
            $value = $stats['total_time'];
        } elseif ($badge['badge_name'] == 'Content Expert') {
            // خبير المحتوى: عدد المهام المختلفة المكتملة من جميع المهام
            $value = $stats['distinct_completed_tasks'];
        } elseif ($badge['badge_name'] == 'Quick Learner') {
            // المتعلم السريع: عدد الجلسات المكتملة (أي نسبة إكمال) من جميع المهام
            $value = $stats['total_sessions'];
        } elseif ($badge['badge_name'] == 'Perfect Score') {
            // النتيجة المثالية: نسبة الإكمال الحالية لهذه المهمة
            $value = $completed_percentage;
        }
        
        // تسجيل تشخيصي لمعايير الشارة
        error_log("Badge check (all tasks): {$badge['badge_name_ar']} ({$badge['badge_name']}) - value=$value, min={$badge['min_value']}, max={$badge['max_value']}, eligible=" . ($value >= $badge['min_value'] && $value <= $badge['max_value'] ? 'YES' : 'NO'));
        
        // حساب النسبة ضمن النطاق للتحقق من استحقاق الشارة
        $range = $badge['max_value'] - $badge['min_value'];
        $percentage_in_range = 0;
        if ($range > 0) {
            $percentage_in_range = (($value - $badge['min_value']) / $range) * 100;
        } else {
            // إذا كان النطاق صفر (مثل Perfect Score: 100-100)، النسبة 100% إذا حقق القيمة
            $percentage_in_range = ($value == $badge['min_value']) ? 100 : 0;
        }
        
        // التحقق من استحقاق الشارة: يجب أن تكون القيمة ضمن النطاق والنسبة أكبر من 0%
        // (لا نمنح الشارة إذا كانت النسبة 0%)
        if ($value >= $badge['min_value'] && $value <= $badge['max_value'] && $percentage_in_range > 0) {
            // التحقق من أن الطفل لم يحصل عليها من قبل من جدول child_badges
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as count 
                FROM child_badges 
                WHERE child_id = ? AND badge_id = ?
            ");
            $stmt->execute([$child_id, $badge['badge_id']]);
            $has_badge = $stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
            
            // إذا لم يحصل عليها من قبل، نحفظها في جدول child_badges
            if (!$has_badge) {
                try {
                    // حساب النجوم المكتسبة بناءً على نسبة إكمال المهمة الحالية
                    // وليس بناءً على النسبة ضمن نطاق الشارة
                    $stars_earned = 0; // افتراضي: 0 نجوم
                    
                    // تحديد النجوم بناءً على نسبة إكمال المهمة الحالية
                    // نفس نظام النجوم للمهمة: 100% = 5 نجوم، 80-99% = 4 نجوم، إلخ
                    if ($completed_percentage >= 100) {
                        $stars_earned = 5; // 100% = 5 نجوم
                    } elseif ($completed_percentage >= 80) {
                        $stars_earned = 4; // 80-99% = 4 نجوم
                    } elseif ($completed_percentage >= 60) {
                        $stars_earned = 3; // 60-79% = 3 نجوم
                    } elseif ($completed_percentage >= 40) {
                        $stars_earned = 2; // 40-59% = 2 نجوم
                    } elseif ($completed_percentage > 0) {
                        $stars_earned = 1; // 1-39% = 1 نجمة
                    } else {
                        $stars_earned = 0; // 0% = 0 نجوم
                    }
                    
                    error_log("Badge stars calculation: {$badge['badge_name_ar']} - value=$value, min={$badge['min_value']}, max={$badge['max_value']}, completed_percentage=$completed_percentage, stars_earned=$stars_earned");
                    
                    // حفظ الشارة في جدول child_badges
                    $stmt = $pdo->prepare("
                        INSERT INTO child_badges (child_id, badge_id, stars_earned) 
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE stars_earned = stars_earned
                    ");
                    $stmt->execute([$child_id, $badge['badge_id'], $stars_earned]);
                    
                    $earned_badges[] = [
                        'badge_id' => $badge['badge_id'],
                        'badge_name' => $badge['badge_name'],
                        'badge_name_ar' => $badge['badge_name_ar'],
                        'badge_icon' => $badge['badge_icon'],
                        'color_code' => $badge['color_code'],
                        'level' => $badge['level'],
                        'stars_earned' => $stars_earned
                    ];
                } catch (PDOException $e) {
                    // في حالة وجود خطأ، نستمر بدون حفظ الشارة
                    error_log("Error saving badge: " . $e->getMessage());
                }
            }
        }
    }
    
    return $earned_badges;
}

// دالة لإنشاء تقرير بعد إكمال المهمة
function createReport($pdo, $child_id, $session_id, $task_id, $earned_badges, $duration, $completed_percentage, $stars) {
    try {
        // جلب معلومات الطفل والوالد
        $stmt = $pdo->prepare("
            SELECT c.parent_id, c.child_name, c.total_time, c.total_stars, c.title,
                   t.task_name, t.task_name_ar, t.content_id,
                   co.content_name, co.content_name_ar
            FROM children c
            LEFT JOIN tasks t ON t.task_id = ?
            LEFT JOIN content co ON co.content_id = t.content_id
            WHERE c.child_id = ?
        ");
        $stmt->execute([$task_id, $child_id]);
        $child_info = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$child_info || !$child_info['parent_id']) {
            error_log("createReport: Child or parent not found for child_id: $child_id");
            return;
        }
        
        $parent_id = $child_info['parent_id'];
        
        // إعداد بيانات التقرير
        $achievements = [];
        if (count($earned_badges) > 0) {
            $achievements[] = "تم الحصول على " . count($earned_badges) . " شارة جديدة";
        }
        if ($completed_percentage >= 100) {
            $achievements[] = "إكمال المهمة بنسبة 100%";
        }
        if ($stars >= 4) {
            $achievements[] = "حصول على " . $stars . " نجوم";
        }
        
        $achievement_text = !empty($achievements) ? implode("، ", $achievements) : "تم إكمال المهمة بنجاح";
        
        // جلب معلومات الجلسة للحصول على التاريخ
        $sessionStmt = $pdo->prepare("SELECT start_time, end_time FROM sessions WHERE session_id = ?");
        $sessionStmt->execute([$session_id]);
        $sessionInfo = $sessionStmt->fetch(PDO::FETCH_ASSOC);
        
        $session_date = $sessionInfo ? date('Y-m-d', strtotime($sessionInfo['start_time'])) : date('Y-m-d');
        $session_time = $sessionInfo ? date('H:i', strtotime($sessionInfo['start_time'])) : date('H:i');
        
        // إعداد بيانات JSON للتقرير
        $report_data = [
            'task_name' => $child_info['task_name_ar'] ?? $child_info['task_name'] ?? 'مهمة',
            'content_name' => $child_info['content_name_ar'] ?? $child_info['content_name'] ?? '',
            'duration_minutes' => $duration,
            'completed_percentage' => $completed_percentage,
            'stars' => $stars,
            'badges_earned' => count($earned_badges),
            'badges' => $earned_badges,
            'child_name' => $child_info['child_name'],
            'child_title' => $child_info['title'],
            'total_stars' => $child_info['total_stars'],
            'total_time' => $child_info['total_time'],
            'session_date' => $session_date,
            'session_time' => $session_time,
            'start_time' => $sessionInfo['start_time'] ?? null,
            'end_time' => $sessionInfo['end_time'] ?? null
        ];
        
        // إدراج التقرير في قاعدة البيانات
        $stmt = $pdo->prepare("
            INSERT INTO reports (parent_id, child_id, session_id, achievement, report_data, total_time, generated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $parent_id,
            $child_id,
            $session_id,
            $achievement_text,
            json_encode($report_data, JSON_UNESCAPED_UNICODE),
            $duration
        ]);
        
        error_log("createReport: Report created successfully for child_id: $child_id, session_id: $session_id");
    } catch (PDOException $e) {
        error_log("createReport Error: " . $e->getMessage());
        // لا نوقف العملية إذا فشل إنشاء التقرير
    }
}

// دالة لتحديث لقب الطفل بناءً على مجموع النجوم
function updateChildTitle($pdo, $child_id) {
    // جلب مجموع النجوم واللقب الحالي للطفل
    $stmt = $pdo->prepare("SELECT total_stars, title FROM children WHERE child_id = ?");
    $stmt->execute([$child_id]);
    $child = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$child) {
        error_log("updateChildTitle: Child not found for child_id: $child_id");
        return;
    }
    
    $total_stars = (int)$child['total_stars'];
    $current_title = $child['title'] ?? null;
    $new_title = null;
    
    // تحديد اللقب بناءً على مجموع النجوم
    if ($total_stars < 10) {
        $new_title = 'مبتدئ 🎈';
    } elseif ($total_stars >= 10 && $total_stars <= 30) {
        $new_title = 'مستكشف 🚀';
    } elseif ($total_stars > 30) {
        $new_title = 'نجم التعلم 🌟';
    }
    
    // تحديث اللقب دائماً (حتى لو كان نفس اللقب) لضمان التحديث
    if ($new_title) {
        $stmt = $pdo->prepare("UPDATE children SET title = ? WHERE child_id = ?");
        $stmt->execute([$new_title, $child_id]);
        error_log("updateChildTitle: Updated title for child_id $child_id: '$current_title' -> '$new_title' (total_stars: $total_stars)");
    } else {
        error_log("updateChildTitle: No title calculated for child_id $child_id (total_stars: $total_stars)");
    }
}
?>

