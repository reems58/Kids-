<?php
/**
 * إنشاء ملف SQL للمحتوى التعليمي
 * 3 فئات × 9 أعمار × 4 محتويات (2 ألعاب + 2 فيديوهات) = 108 محتوى
 * الفيديوهات من YouTube باللهجة العربية
 */

$output = "-- ============================================\n";
$output .= "-- إدراج محتوى تعليمي شامل للألعاب والفيديوهات\n";
$output .= "-- 3 فئات (عربي، علوم، رياضيات) × 9 أعمار (4-12) × 4 محتويات (2 لعبة + 2 فيديو) = 108 محتوى\n";
$output .= "-- الفيديوهات من YouTube باللهجة العربية\n";
$output .= "-- ============================================\n\n";

$output .= "USE kids_learning;\n\n";

$categories = [
    'عربي' => ['icon' => '📚', 'emoji' => '📚'],
    'علوم' => ['icon' => '🔬', 'emoji' => '🔬'],
    'رياضيات' => ['icon' => '🔢', 'emoji' => '🔢']
];

$ages = [4, 5, 6, 7, 8, 9, 10, 11, 12];

// ألعاب لكل فئة (2 ألعاب لكل عمر)
$games = [
    'عربي' => [
        'لعبة تعلم الحروف العربية',
        'لعبة القراءة والكتابة'
    ],
    'علوم' => [
        'لعبة الحيوانات والنباتات',
        'لعبة الطبيعة والفضاء'
    ],
    'رياضيات' => [
        'لعبة العد والأرقام',
        'لعبة الجمع والطرح'
    ]
];

// فيديوهات YouTube لكل فئة (2 فيديوهات لكل عمر)
// روابط YouTube - يرجى استبدالها بروابط حقيقية من قنوات تعليمية عربية
// أمثلة على قنوات جيدة: تعلم مع نور، سوبر جميل، تعلم مع زكريا، إلخ

// دالة لإنشاء روابط YouTube (نموذجية - يجب استبدالها)
function getYouTubeLink($category, $age, $index) {
    // هذه روابط نموذجية - يجب استبدالها بروابط حقيقية
    // يمكن البحث في YouTube عن: "تعليم [الفئة] للأطفال [العمر] سنوات"
    $baseUrls = [
        'عربي' => [
            'https://www.youtube.com/watch?v=VIDEO_ID_ARABIC_LETTERS',
            'https://www.youtube.com/watch?v=VIDEO_ID_ARABIC_STORIES'
        ],
        'علوم' => [
            'https://www.youtube.com/watch?v=VIDEO_ID_ANIMALS',
            'https://www.youtube.com/watch?v=VIDEO_ID_PLANTS'
        ],
        'رياضيات' => [
            'https://www.youtube.com/watch?v=VIDEO_ID_COUNTING',
            'https://www.youtube.com/watch?v=VIDEO_ID_MATH'
        ]
    ];
    
    // يمكن استخدام embed أو watch - سنستخدم watch
    return $baseUrls[$category][$index] ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
}

$youtubeVideos = [
    'عربي' => [
        'https://www.youtube.com/watch?v=VIDEO_ID_ARABIC_LETTERS', // فيديو تعليم الحروف
        'https://www.youtube.com/watch?v=VIDEO_ID_ARABIC_STORIES'  // فيديو القصص التعليمية
    ],
    'علوم' => [
        'https://www.youtube.com/watch?v=VIDEO_ID_ANIMALS', // فيديو عن الحيوانات
        'https://www.youtube.com/watch?v=VIDEO_ID_PLANTS'  // فيديو عن النباتات
    ],
    'رياضيات' => [
        'https://www.youtube.com/watch?v=VIDEO_ID_COUNTING', // فيديو تعلم العد
        'https://www.youtube.com/watch?v=VIDEO_ID_MATH'  // فيديو الجمع والطرح
    ]
];

$counter = 0;

// إدراج المحتوى لكل فئة
foreach ($categories as $category => $catInfo) {
    $output .= "-- ============================================\n";
    $output .= "-- فئة: {$category}\n";
    $output .= "-- ============================================\n\n";
    
    foreach ($ages as $age) {
        $output .= "-- العمر: {$age} سنوات\n\n";
        
        // إدراج لعبتين
        for ($i = 0; $i < 2; $i++) {
            $counter++;
            $title = $games[$category][$i] . " للعمر {$age}";
            $name = "game_" . ($category === 'عربي' ? 'arabi' : ($category === 'علوم' ? 'uloom' : 'riyadhiyat')) . "_{$age}_" . ($i+1);
            $url = "https://games.example.com/" . urlencode($category) . "/{$age}/game" . ($i+1);
            
            $titleEscaped = addslashes($title);
            $output .= "INSERT INTO content (content_name, content_name_ar, content_type, content_url, title, category, min_age, max_age, icon, content_category) VALUES\n";
            $output .= "('{$name}', '{$titleEscaped}', 'لعبة', '{$url}', '{$titleEscaped}', 'تعليمي', {$age}, {$age}, '{$catInfo['emoji']}', '{$category}');\n\n";
        }
        
        // إدراج فيديوهين من YouTube
        for ($i = 0; $i < 2; $i++) {
            $counter++;
            $videoTitles = [
                'عربي' => ['فيديو تعليم الحروف العربية للعمر ' . $age, 'فيديو القصص التعليمية للعمر ' . $age],
                'علوم' => ['فيديو تعليم عن الحيوانات للعمر ' . $age, 'فيديو تعليم عن النباتات للعمر ' . $age],
                'رياضيات' => ['فيديو تعلم العد والأرقام للعمر ' . $age, 'فيديو تعلم الجمع والطرح للعمر ' . $age]
            ];
            
            $title = $videoTitles[$category][$i];
            $name = "video_" . ($category === 'عربي' ? 'arabi' : ($category === 'علوم' ? 'uloom' : 'riyadhiyat')) . "_{$age}_" . ($i+1);
            $url = $youtubeVideos[$category][$i]; // رابط YouTube
            
            $titleEscaped = addslashes($title);
            $output .= "INSERT INTO content (content_name, content_name_ar, content_type, content_url, title, category, min_age, max_age, icon, content_category) VALUES\n";
            $output .= "('{$name}', '{$titleEscaped}', 'فيديو', '{$url}', '{$titleEscaped}', 'تعليمي', {$age}, {$age}, '📺', '{$category}');\n\n";
        }
    }
    
    $output .= "\n";
}

$output .= "-- ============================================\n";
$output .= "-- إجمالي المحتوى: {$counter} محتوى\n";
$output .= "-- ============================================\n";

// حفظ الملف
$filePath = __DIR__ . '/insert_educational_content_2games_2videos.sql';
file_put_contents($filePath, $output);

echo "✅ تم إنشاء الملف بنجاح!\n";
echo "📄 الملف: {$filePath}\n";
echo "📊 عدد المحتويات: {$counter}\n";
echo "\n";
echo "⚠️ ملاحظة: روابط YouTube حالياً نموذجية. يرجى استبدالها بروابط حقيقية.\n";

