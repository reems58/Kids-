// صفحة عرض المحتوى التعليمي
let currentChildId = null;
let currentContent = null;
let currentCategory = null;
let currentType = 'لعبة'; // لعبة أو فيديو

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async function() {
    // الحصول على معرف الطفل من URL أو sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    currentChildId = urlParams.get('child_id') || sessionStorage.getItem('current_child_id');
    
    // حفظ child_id في sessionStorage إذا كان موجوداً في URL
    if (urlParams.get('child_id')) {
        sessionStorage.setItem('current_child_id', urlParams.get('child_id'));
        currentChildId = urlParams.get('child_id');
    }
    
    if (!currentChildId) {
        alert('يرجى اختيار طفل أولاً');
        window.location.href = 'parent_dashboard.html';
        return;
    }
    
    // إعداد event listeners للأزرار (event delegation)
    setupVideoButtons();
    
    await loadContent();
    await loadBadges();
});

// جلب المحتوى التعليمي
async function loadContent() {
    try {
        const response = await fetch(`../api/get_child_content.php?child_id=${currentChildId}`);
        const result = await response.json();
        
        if (!result.success) {
            showError(result.message || 'فشل تحميل المحتوى');
            return;
        }
        
        currentContent = result;
        
        // عرض معلومات الطفل
        document.getElementById('childNameDisplay').textContent = result.child.child_name;
        document.getElementById('ageDisplay').textContent = `${result.child.age} سنوات`;
        
        // عرض الإحصائيات
        document.getElementById('gamesCount').textContent = result.games_count || 0;
        document.getElementById('videosCount').textContent = result.videos_count || 0;
        document.getElementById('totalCount').textContent = result.count || 0;
        
        // عرض رسالة تحذيرية إذا لزم الأمر
        if (result.child.age_warning) {
            document.getElementById('warningText').textContent = result.child.age_warning;
            document.getElementById('warningMessage').style.display = 'flex';
        }
        
        // عرض المحتوى
        displayContent(result.grouped_content);
        
    } catch (error) {
        console.error('خطأ في تحميل المحتوى:', error);
        showError('حدث خطأ أثناء تحميل المحتوى');
    }
}

// عرض المحتوى
function displayContent(groupedContent) {
    const container = document.getElementById('contentSections');
    
    if (!groupedContent || Object.keys(groupedContent).length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    
    // عرض كل فئة
    const categories = {
        'عربي': { icon: '📚', color: '#667eea' },
        'علوم': { icon: '🔬', color: '#f093fb' },
        'رياضيات': { icon: '🔢', color: '#4facfe' }
    };
    
    Object.keys(categories).forEach(category => {
        const categoryData = groupedContent[category];
        if (!categoryData) return;
        
        const games = categoryData['لعبة'] || [];
        const videos = categoryData['فيديو'] || [];
        
        if (games.length === 0 && videos.length === 0) return;
        
        const categorySection = createCategorySection(category, categories[category], games, videos);
        container.appendChild(categorySection);
    });
    
    // إضافة event listeners للأزرار الجديدة
    setupVideoButtons();
}

// إنشاء قسم فئة
function createCategorySection(category, categoryInfo, games, videos) {
    const section = document.createElement('div');
    section.className = 'content-category';
    section.id = `category-${category}`;
    
    const categoryId = category.toLowerCase();
    const activeTab = games.length > 0 ? 'لعبة' : 'فيديو';
    
    section.innerHTML = `
        <div class="category-header">
            <span class="category-icon">${categoryInfo.icon}</span>
            <h2 class="category-title">${category}</h2>
        </div>
        <div class="category-tabs">
            ${games.length > 0 ? `
                <button class="category-tab ${activeTab === 'لعبة' ? 'active' : ''}" 
                        onclick="switchContentType('${category}', 'لعبة')">
                    🎮 الألعاب (${games.length})
                </button>
            ` : ''}
            ${videos.length > 0 ? `
                <button class="category-tab ${activeTab === 'فيديو' ? 'active' : ''}" 
                        onclick="switchContentType('${category}', 'فيديو')">
                    📺 الفيديوهات (${videos.length})
                </button>
            ` : ''}
        </div>
        <div class="content-grid" id="content-grid-${category}">
            ${renderContentItems(activeTab === 'لعبة' ? games : videos)}
        </div>
    `;
    
    return section;
}

// تبديل نوع المحتوى (لعبة/فيديو)
function switchContentType(categoryId, type) {
    // categoryId هو اسم الفئة بالعربية (عربي، علوم، رياضيات)
    const category = categoryId;
    const content = currentContent.grouped_content[category];
    
    if (!content) return;
    
    const items = type === 'لعبة' ? content['لعبة'] : content['فيديو'];
    const grid = document.getElementById(`content-grid-${category}`);
    
    if (grid) {
        grid.innerHTML = renderContentItems(items);
        // إضافة event listeners للأزرار الجديدة
        setupVideoButtons();
    }
    
    // تحديث التبويبات النشطة
    const categorySection = document.getElementById(`category-${category}`);
    if (categorySection) {
        const tabs = categorySection.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            if (tab.textContent.includes(type === 'لعبة' ? 'الألعاب' : 'الفيديوهات')) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
}

// عرض عناصر المحتوى
function renderContentItems(items) {
    if (!items || items.length === 0) {
        return '<div class="empty-state"><p>لا يوجد محتوى في هذه الفئة</p></div>';
    }
    
    return items.map(item => {
        const videoUrl = item.content_url ? item.content_url.replace(/"/g, '&quot;') : '';
        return `
        <div class="content-item">
            <span class="content-item-icon">${item.icon || '📚'}</span>
            <h3 class="content-item-title">${item.content_name_ar || item.title || item.content_name}</h3>
            <span class="content-item-type">${item.content_type === 'لعبة' ? '🎮 لعبة' : '📺 فيديو'}</span>
            ${item.content_url && !item.content_url.includes('example.com') && !item.content_url.includes('VIDEO_ID_') ? `
                ${item.content_type === 'فيديو' && (item.content_url.includes('youtube.com') || item.content_url.includes('youtu.be')) ? `
                    <button class="content-item-link youtube-link watch-video-btn" data-video-url="${videoUrl}" onclick="openFullscreenVideo('${videoUrl.replace(/'/g, "\\'")}')" style="border: none; cursor: pointer; width: 100%;">
                        📺 شاهد الفيديو
                    </button>
                ` : `
                    <a href="${item.content_url}${item.content_url.includes('?') ? '&' : '?'}child_id=${currentChildId}${item.duration_minutes ? '&duration=' + encodeURIComponent(item.duration_minutes) : ''}${item.task_id ? '&task_id=' + encodeURIComponent(item.task_id) : ''}" target="_blank" class="content-item-link">
                        ${item.content_type === 'لعبة' ? '🎮 ابدأ اللعبة' : '📺 شاهد الفيديو'}
                    </a>
                `}
            ` : item.content_url && (item.content_url.includes('example.com') || item.content_url.includes('VIDEO_ID_')) ? `
                <div class="content-link-placeholder" style="padding: 12px; background: #fff3cd; border-radius: 8px; text-align: center; color: #856404; font-size: 0.9rem;">
                    ⚠️ الرابط غير متوفر حالياً<br>
                    <small>يرجى تحديث الرابط في قاعدة البيانات</small>
                </div>
            ` : ''}
        </div>
    `;
    }).join('');
}

// الحصول على اسم الفئة
function getCategoryName(categoryId) {
    const map = {
        'عربي': 'عربي',
        'uloom': 'علوم',
        'riyadhiyat': 'رياضيات'
    };
    return map[categoryId] || categoryId;
}

// عرض رسالة خطأ
function showError(message) {
    const container = document.getElementById('contentSections');
    container.innerHTML = `
        <div class="error-message" style="background: #fee; border: 2px solid #fcc; padding: 20px; border-radius: 10px; text-align: center;">
            <h3>⚠️ خطأ</h3>
            <p>${message}</p>
        </div>
    `;
}

// إعداد event listeners لأزرار الفيديو
function setupVideoButtons() {
    // استخدام event delegation للتعامل مع الأزرار
    const container = document.getElementById('contentSections');
    if (!container) {
        console.warn('contentSections container not found');
        return;
    }
    
    console.log('Setting up video button listeners');
    
    // إزالة listener القديم إذا كان موجوداً
    container.removeEventListener('click', handleVideoClick);
    
    // إضافة listener جديد
    container.addEventListener('click', handleVideoClick);
}

// معالج النقر على زر الفيديو
function handleVideoClick(event) {
    const button = event.target.closest('.watch-video-btn');
    if (button) {
        event.preventDefault();
        event.stopPropagation();
        const videoUrl = button.getAttribute('data-video-url');
        console.log('Video button clicked, URL:', videoUrl);
        if (videoUrl) {
            openFullscreenVideo(videoUrl);
        } else {
            console.error('No video URL found in button');
        }
    }
}

// تحويل رابط YouTube إلى رابط embed
function convertToEmbedUrl(url) {
    // إذا كان الرابط بالفعل embed، ارجعه كما هو
    if (url.includes('youtube.com/embed/')) {
        return url + (url.includes('?') ? '&' : '?') + 'autoplay=1&rel=0&modestbranding=1';
    }
    
    // استخراج معرف الفيديو من رابط YouTube
    let videoId = '';
    
    // رابط بصيغة watch?v=...
    if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
    }
    // رابط بصيغة youtu.be/...
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&playsinline=1`;
    }
    
    return url;
}

// فتح الفيديو في وضع ملء الشاشة
function openFullscreenVideo(videoUrl) {
    console.log('openFullscreenVideo called with URL:', videoUrl);
    
    const modal = document.getElementById('fullscreenVideoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (!modal) {
        console.error('Modal not found!');
        return;
    }
    
    if (!videoPlayer) {
        console.error('Video player not found!');
        return;
    }
    
    // تحويل الرابط إلى رابط embed
    const embedUrl = convertToEmbedUrl(videoUrl);
    console.log('Embed URL:', embedUrl);
    
    videoPlayer.src = embedUrl;
    
    // عرض الـ modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
    
    console.log('Video modal opened');
}

// إغلاق الفيديو
function closeFullscreenVideo() {
    const modal = document.getElementById('fullscreenVideoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (!modal || !videoPlayer) return;
    
    // إخفاء الـ modal
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // إعادة تفعيل التمرير
    
    // إيقاف الفيديو عن طريق إزالة المصدر
    videoPlayer.src = '';
    
    // أو يمكن استخدام pause إذا كان متاحاً
    try {
        videoPlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    } catch (e) {
        console.log('Could not pause video');
    }
}

// إغلاق عند الضغط على Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFullscreenVideo();
    }
});

// إغلاق عند الضغط خارج الفيديو
document.addEventListener('click', function(event) {
    const modal = document.getElementById('fullscreenVideoModal');
    const videoModalContent = document.querySelector('.video-modal-content');
    
    if (modal && event.target === modal) {
        closeFullscreenVideo();
    }
});

// جعل الدالة متاحة بشكل عام
window.openFullscreenVideo = openFullscreenVideo;
window.closeFullscreenVideo = closeFullscreenVideo;

// الرجوع للصفحة السابقة
function goBack() {
    window.location.href = 'parent_dashboard.html';
}

// تحميل الشارات
async function loadBadges() {
    try {
        console.log('🔄 تحميل الشارات للطفل:', currentChildId);
        
        if (!currentChildId) {
            console.warn('⚠️ لا يوجد child_id لتحميل الشارات');
            const container = document.getElementById('badgesGrid');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">يرجى اختيار طفل أولاً</p>';
            }
            return;
        }
        
        const response = await fetch(`../api/get_child_badges.php?child_id=${currentChildId}`);
        console.log('📡 استجابة API الشارات:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 نتيجة الشارات:', result);
        
        if (result.success) {
            console.log('✅ عدد الشارات:', result.badges?.length || 0);
            displayBadges(result.badges || []);
        } else {
            console.error('❌ خطأ في تحميل الشارات:', result.message);
            displayBadges([]);
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل الشارات:', error);
        const container = document.getElementById('badgesGrid');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; color: #e74c3c; grid-column: 1/-1; padding: 20px;">
                    <p>⚠️ خطأ في تحميل الشارات</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
                </div>
            `;
        }
    }
}

// عرض الشارات
function displayBadges(badges) {
    console.log('🎨 عرض الشارات:', badges);
    const container = document.getElementById('badgesGrid');
    if (!container) {
        console.error('❌ عنصر badgesGrid غير موجود!');
        return;
    }
    
    if (!badges || badges.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); grid-column: 1/-1; padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🏆</div>
                <p style="font-size: 1.1rem; color: var(--text-secondary);">
                    لا توجد شارات بعد
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 10px;">
                    أكمل المهام لتحصل على شارات جديدة!
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = badges.map((badge, index) => {
        const colorCode = badge.color_code || '#f59e0b';
        const badgeId = `badge-${index}`;
        return `
            <div class="badge-card" id="${badgeId}" style="
                background: linear-gradient(135deg, ${colorCode} 0%, ${adjustBadgeColor(colorCode)} 100%);
                border-radius: 16px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onclick="toggleBadgeDescription('${badgeId}', ${index})">
                <div style="font-size: 3rem; margin-bottom: 10px;">${badge.badge_icon || '🏆'}</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 8px;">
                    ${badge.badge_name_ar || badge.badge_name}
                </div>
                <div style="font-size: 0.95rem; color: rgba(255,255,255,0.95); font-weight: 600;">
                    ⭐ ${badge.stars_earned || 0} نجوم
                </div>
                <div class="badge-description" id="badge-desc-${index}" style="
                    display: none;
                    margin-top: 15px;
                    padding: 15px;
                    background: rgba(255,255,255,0.95);
                    border-radius: 10px;
                    color: #333;
                    font-size: 0.9rem;
                    line-height: 1.6;
                    text-align: right;
                    animation: fadeIn 0.3s ease;
                ">
                    ${badge.description || 'لا يوجد وصف متاح'}
                </div>
            </div>
        `;
    }).join('');
    
    // حفظ بيانات الشارات للوصول إليها لاحقاً
    window.badgesData = badges;
}

// دالة لتعديل لون الشارة (للتدرج)
function adjustBadgeColor(color) {
    // تحويل بسيط للون لجعله أغمق قليلاً
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const darkerR = Math.max(0, r - 30);
        const darkerG = Math.max(0, g - 30);
        const darkerB = Math.max(0, b - 30);
        return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    }
    return color;
}

// دالة لإظهار/إخفاء وصف الشارة
function toggleBadgeDescription(badgeId, index) {
    const description = document.getElementById(`badge-desc-${index}`);
    if (!description) return;
    
    // إخفاء جميع الأوصاف الأخرى
    const allDescriptions = document.querySelectorAll('.badge-description');
    allDescriptions.forEach(desc => {
        if (desc.id !== `badge-desc-${index}`) {
            desc.style.display = 'none';
        }
    });
    
    // إظهار/إخفاء الوصف المحدد
    if (description.style.display === 'none' || !description.style.display) {
        description.style.display = 'block';
    } else {
        description.style.display = 'none';
    }
}

// جعل الدالة متاحة بشكل عام
window.toggleBadgeDescription = toggleBadgeDescription;

