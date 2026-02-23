// ==================== 轮播器控制功能 ====================
const tickerLabel = document.getElementById('ticker-label');
const speedBtn = document.getElementById('speed-btn');
const importBtn = document.getElementById('import-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
let tickerAnimationId = null;
let currentTickerWidth = 0;

// CouchDB 配置
const COUCHDB_URL = 'http://satoko:1793364876@192.168.5.4:5984'; // 请替换为您的实际地址
const HOTNEWS_DB = 'hotnews';
const HOTNEWS_DOC_ID = 'current_news'; // 固定文档ID存储新闻数组

// 从 localStorage 加载播放器状态
function loadPlayerState() {
    const savedState = localStorage.getItem('playerState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            playerState = {
                ...playerState,
                ...parsed
            };
        } catch (e) {
            console.error('加载播放器状态失败:', e);
        }
    }
    return playerState;
}

// 保存播放器状态
function savePlayerState() {
    localStorage.setItem('playerState', JSON.stringify({
        isPlaying: playerState.isPlaying,
        currentSpeed: playerState.currentSpeed,
        speedIndex: playerState.speedIndex,
        currentTextIndex: playerState.currentTextIndex
    }));
}

// 初始化播放器状态
loadPlayerState();

tickerLabel.addEventListener('click', function() {
    window.open('https://satoko-ashe.github.io/tp.github.io/', '_blank');
});

speedBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    playerState.speedIndex = (playerState.speedIndex + 1) % playerState.speedCycle.length;
    playerState.currentSpeed = playerState.speedCycle[playerState.speedIndex];
    savePlayerState();
    updateSpeedButton();
    if (playerState.isPlaying) {
        restartTickerAnimation();
    }
});

function updateSpeedButton() {
    const speed = playerState.currentSpeed;
    const speedIcon = speedBtn.querySelector('i');
    switch(speed) {
        case 0.5:
            speedIcon.className = 'fas fa-tachometer-alt-slow';
            speedBtn.title = '速度: 0.5x (慢)';
            break;
        case 1.0:
            speedIcon.className = 'fas fa-tachometer-alt';
            speedBtn.title = '速度: 1.0x (正常)';
            break;
        case 1.5:
            speedIcon.className = 'fas fa-tachometer-alt-fast';
            speedBtn.title = '速度: 1.5x (快)';
            break;
        case 2.0:
            speedIcon.className = 'fas fa-tachometer-alt-fastest';
            speedBtn.title = '速度: 2.0x (最快)';
            break;
        default:
            speedIcon.className = 'fas fa-tachometer-alt';
            speedBtn.title = '速度: 1.0x (正常)';
    }
}

importBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    // 调用热点导入弹窗（需要管理员登录）
    if (typeof showHotImportModal === 'function') {
        showHotImportModal('file');
    } else {
        alert('热点导入功能未加载');
    }
});

playPauseBtn.addEventListener('click', function() {
    playerState.isPlaying = !playerState.isPlaying;
    savePlayerState();
    if (playerState.isPlaying) {
        this.innerHTML = '<i class="fas fa-pause"></i>';
        this.title = '暂停';
        startTickerAnimation();
    } else {
        this.innerHTML = '<i class="fas fa-play"></i>';
        this.title = '播放';
        if (tickerAnimationId) {
            cancelAnimationFrame(tickerAnimationId);
            tickerAnimationId = null;
        }
    }
});

// ==================== 辞海功能 ====================
document.querySelectorAll('.language-shortcut-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const url = this.getAttribute('data-url');
        if (url) {
            window.open(url, '_blank');
        }
    });
});
document.querySelectorAll('.language-submenu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const url = this.getAttribute('data-url');
        if (url) {
            window.open(url, '_blank');
        }
    });
});
document.querySelectorAll('.has-submenu').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

// ==================== 热点新闻轮播功能 ====================
async function initHotNewsTicker() {
    const tickerList = document.getElementById('ticker-list');
    if (!tickerList) return;

    // 从 CouchDB 获取热点新闻
    let newsItems = [];
    try {
        const db = new PouchDB(HOTNEWS_DB);
        // 尝试同步远程，但本地优先
        if (COUCHDB_URL) {
            const remoteDB = new PouchDB(`${COUCHDB_URL}/${HOTNEWS_DB}`);
            db.sync(remoteDB, { live: true, retry: true }).on('error', console.warn);
        }
        const doc = await db.get(HOTNEWS_DOC_ID).catch(() => null);
        if (doc && doc.news && Array.isArray(doc.news)) {
            newsItems = doc.news;
        } else {
            // 使用默认数据
            newsItems = [
                { text: '《零基础学英语》荣获年度最佳语言学习课程奖', url: '#' },
                { text: '知云管理平台与多家语言机构达成战略合作', url: '#' },
                { text: '新晋语言老师"月下独酌"课程《日语入门教程》点击破千万', url: '#' },
                { text: '网站推出多语言学习功能，支持英语、日语等七种语言', url: '#' },
                { text: '年度语言课程评选活动正式开始，投票有机会赢取大奖', url: '#' },
                { text: '《韩语发音指南》改编视频课程即将上线，主讲阵容公布', url: '#' },
                { text: '网站新增"辞海查询"功能，助力学习者理解生僻词汇', url: '#' },
                { text: '知云管理平台App正式上线，支持离线学习', url: '#' }
            ];
        }
    } catch (e) {
        console.error('读取热点新闻失败，使用默认', e);
        newsItems = [
            { text: '《零基础学英语》荣获年度最佳语言学习课程奖', url: '#' },
            { text: '知云管理平台与多家语言机构达成战略合作', url: '#' },
            { text: '新晋语言老师"月下独酌"课程《日语入门教程》点击破千万', url: '#' },
            { text: '网站推出多语言学习功能，支持英语、日语等七种语言', url: '#' },
            { text: '年度语言课程评选活动正式开始，投票有机会赢取大奖', url: '#' },
            { text: '《韩语发音指南》改编视频课程即将上线，主讲阵容公布', url: '#' },
            { text: '网站新增"辞海查询"功能，助力学习者理解生僻词汇', url: '#' },
            { text: '知云管理平台App正式上线，支持离线学习', url: '#' }
        ];
    }

    tickerList.innerHTML = '';
    newsItems.forEach((news, index) => {
        const newsItem = document.createElement('div');
        newsItem.className = 'ticker-item';
        const newsLink = document.createElement('a');
        if (typeof news === 'object') {
            newsLink.href = news.url;
            newsLink.textContent = news.text;
        } else {
            newsLink.href = '#';
            newsLink.textContent = news;
        }
        newsItem.appendChild(newsLink);
        tickerList.appendChild(newsItem);
    });
    playerState.currentPosition = document.querySelector('.ticker-content')?.offsetWidth || 1200;
    startTickerAnimation();
}

function startTickerAnimation() {
    const tickerList = document.getElementById('ticker-list');
    if (!tickerList) return;
    
    const tickerItems = tickerList.querySelectorAll('.ticker-item');
    if (tickerItems.length === 0) return;
    
    let totalWidth = 0;
    tickerItems.forEach(item => {
        totalWidth += item.offsetWidth + 40;
    });
    currentTickerWidth = totalWidth;
    
    const tickerContent = document.querySelector('.ticker-content');
    if (!tickerContent) return;
    
    const containerWidth = tickerContent.offsetWidth;
    if (playerState.currentPosition > containerWidth) {
        playerState.currentPosition = containerWidth;
    }
    if (playerState.currentPosition < -totalWidth) {
        playerState.currentPosition = containerWidth;
    }
    
    const baseSpeed = 0.8;
    function animate() {
        playerState.currentPosition -= baseSpeed * playerState.currentSpeed;
        if (playerState.currentPosition < -totalWidth) {
            playerState.currentPosition = containerWidth;
        }
        tickerList.style.transform = `translateX(${playerState.currentPosition}px)`;
        if (playerState.isPlaying) {
            tickerAnimationId = requestAnimationFrame(animate);
        }
    }
    
    if (playerState.isPlaying) {
        tickerAnimationId = requestAnimationFrame(animate);
    }
}

function restartTickerAnimation() {
    if (tickerAnimationId) {
        cancelAnimationFrame(tickerAnimationId);
        tickerAnimationId = null;
    }
    if (playerState.isPlaying) {
        startTickerAnimation();
    }
}

// 不再需要 updateTickerWithText，因为从数据库读取

// ==================== 时间和天气功能 ====================
function updateCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = now.getDay();
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${year}年${month}月${date}日 ${days[day]} ${hour}:${minute}:${second}`;
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
        currentTimeElement.textContent = timeString;
    }
}

// ==================== 弹窗功能 ====================
const aboutLinks = document.querySelectorAll('.footer-about');
const aboutModal = document.getElementById('about-modal');
const closeModal = document.getElementById('close-modal');

if (aboutLinks.length && aboutModal && closeModal) {
    aboutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            aboutModal.classList.add('show');
        });
    });
    closeModal.addEventListener('click', function() {
        aboutModal.classList.remove('show');
    });
    aboutModal.addEventListener('click', function(e) {
        if (e.target === aboutModal) {
            aboutModal.classList.remove('show');
        }
    });
}

const recycleBtn = document.getElementById('recycle-btn');
if (recycleBtn) {
    recycleBtn.addEventListener('click', function() {
        alert('回收站功能开发中，敬请期待！');
    });
}

// ==================== 页面布局调整 ====================
function adjustCenterBoxesHeight() {
    const leftSidebar = document.querySelector('.left-sidebar');
    const centerTopNav = document.querySelector('.center-top-nav');
    const centerBoxes = document.querySelector('.center-boxes');
    if (leftSidebar && centerTopNav && centerBoxes) {
        const leftHeight = leftSidebar.offsetHeight;
        const navHeight = centerTopNav.offsetHeight;
        const targetHeight = leftHeight - navHeight - 20;
        if (targetHeight > 250) {
            centerBoxes.style.minHeight = targetHeight + 'px';
            const centerBoxesHeight = centerBoxes.offsetHeight;
            if (centerBoxesHeight > targetHeight) {
                centerBoxes.style.padding = '10px 0';
            }
        }
    }
}

function adjustNavForMobile() {
    const windowWidth = window.innerWidth;
    const centerTopNav = document.querySelector('.center-top-nav');
    if (centerTopNav) {
        if (windowWidth <= 992) {
            centerTopNav.style.overflow = 'auto';
        } else {
            centerTopNav.style.overflow = 'hidden';
        }
    }
}

const footerSectionTitles = document.querySelectorAll('.footer-section-title');
footerSectionTitles.forEach(title => {
    title.addEventListener('click', function() {
        this.classList.toggle('expanded');
        const content = this.nextElementSibling;
        if (content) {
            content.classList.toggle('expanded');
        }
    });
});

// ==================== 左侧/右侧面板链接跳转 ====================
document.querySelectorAll('.left-sidebar .panel-item, .right-sidebar .panel-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.getAttribute('data-url');
        if (url) {
            window.open(url, '_blank');
        }
    });
});

// ==================== 工作台和资料库链接跳转 ====================
const workbenchBtn = document.getElementById('workbench-btn');
const databaseBtn = document.getElementById('database-btn');

if (workbenchBtn) {
    workbenchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://satoko-ashe.github.io/management-system/', '_blank');
    });
}

if (databaseBtn) {
    databaseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://satoko-ashe.github.io/management-system/', '_blank');
    });
}

// ==================== 任务栏功能 ====================
let db;
let currentUser = null;
let currentStatus = 'unread';
let currentUrgency = null;
let tasks = [];
let allTasks = [];
let selectedTaskId = null;

async function initTaskSystem() {
    // 模拟用户登录
    currentUser = { username: 'admin', name: '管理员' };
    
    try {
        db = new PouchDB('guanlian');
        await db.createIndex({ index: { fields: ['receiver', 'status'] } });
    } catch (e) {
        console.error('数据库初始化失败:', e);
    }

    await loadAllTasks();
    renderTaskList();

    const tabs = document.querySelectorAll('.task-panel-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelector('.task-panel-tabs .tab.active')?.classList.remove('active');
            this.classList.add('active');
            const target = this.getAttribute('data-tab');
            if (target === 'list') {
                document.getElementById('task-list-view')?.classList.add('active');
                document.getElementById('task-detail-view')?.classList.remove('active');
            } else {
                document.getElementById('task-list-view')?.classList.remove('active');
                document.getElementById('task-detail-view')?.classList.add('active');
                if (selectedTaskId) {
                    showTaskDetailById(selectedTaskId);
                }
            }
        });
    });

    const statusTabs = document.querySelectorAll('.task-status-tabs .status-tab');
    statusTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelector('.task-status-tabs .status-tab.active')?.classList.remove('active');
            this.classList.add('active');
            currentStatus = this.getAttribute('data-status');
            loadAllTasks().then(() => {
                renderTaskList();
            });
        });
    });

    const filterBtns = document.querySelectorAll('.urgency-filter .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const urgency = this.getAttribute('data-urgency');
            if (currentUrgency === urgency) {
                currentUrgency = null;
                this.classList.remove('active');
            } else {
                filterBtns.forEach(b => b.classList.remove('active'));
                currentUrgency = urgency;
                this.classList.add('active');
            }
            renderTaskList();
        });
    });

    const searchBtn = document.querySelector('.search .btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchTasks);
    }
    
    const searchInput = document.querySelector('.search .text');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchTasks();
        });
    }
}

async function loadAllTasks() {
    if (!currentUser) return;
    try {
        const result = await db.find({
            selector: {
                receiver: currentUser.username || currentUser.name,
                status: currentStatus
            },
            sort: [{ createdAt: 'desc' }]
        });
        allTasks = result.docs;
    } catch (e) {
        console.error('加载任务失败:', e);
        allTasks = [];
    }
}

function renderTaskList() {
    let filteredTasks = allTasks;
    if (currentUrgency) {
        filteredTasks = allTasks.filter(t => t.urgency === currentUrgency);
    }
    tasks = filteredTasks;

    const listEl = document.getElementById('task-list');
    if (!listEl) return;
    
    if (!tasks.length) {
        listEl.innerHTML = '<p style="text-align:center; color:#999;">暂无任务</p>';
        return;
    }

    listEl.innerHTML = tasks.map(task => {
        const summary = task.content?.length > 30 ? task.content.substring(0,30) + '…' : task.content;
        return `
            <div class="task-item" data-id="${task._id}" data-status="${task.status}">
                <div class="task-header">
                    <span class="task-title" onclick="window.selectTask('${task._id}')">${task.title || '无标题'}</span>
                    <span class="task-urgency ${task.urgency || '轻量'}">${task.urgency || '轻量'}</span>
                </div>
                <div class="task-summary">${summary || ''}</div>
                <div class="task-meta">
                    <span>${task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}</span>
                    <input type="checkbox" ${task.status === 'completed' ? 'checked disabled' : ''} onchange="window.markTaskCompleted('${task._id}', this.checked)">
                </div>
            </div>
        `;
    }).join('');
}

window.selectTask = async function(taskId) {
    selectedTaskId = taskId;
    const activeTab = document.querySelector('.task-panel-tabs .tab.active');
    if (activeTab) {
        activeTab.classList.remove('active');
    }
    const detailTab = document.querySelector('.task-panel-tabs .tab[data-tab="detail"]');
    if (detailTab) {
        detailTab.classList.add('active');
    }
    
    const listView = document.getElementById('task-list-view');
    const detailView = document.getElementById('task-detail-view');
    if (listView) listView.classList.remove('active');
    if (detailView) detailView.classList.add('active');
    
    await showTaskDetailById(taskId);
};

async function showTaskDetailById(taskId) {
    const task = allTasks.find(t => t._id === taskId) || tasks.find(t => t._id === taskId);
    if (!task) return;

    if (task.status === 'unread') {
        task.status = 'read';
        task.readAt = Date.now();
        try {
            await db.put(task);
            if (currentStatus === 'unread') {
                await loadAllTasks();
                renderTaskList();
            } else {
                const index = allTasks.findIndex(t => t._id === taskId);
                if (index !== -1) allTasks[index] = task;
            }
        } catch (e) {
            console.error('更新任务状态失败:', e);
        }
    }

    const detailContent = document.getElementById('task-detail-content');
    if (detailContent) {
        detailContent.innerHTML = `
            <h4>${task.title || '无标题'}</h4>
            <p>${task.content || '无内容'}</p>
            <p>类型：${task.type || '未知'} | 紧急程度：${task.urgency || '轻量'}</p>
            <p>发送人：${task.sender || '系统'} | 接收人：${task.receiver || '未知'}</p>
            <p>发送时间：${task.createdAt ? new Date(task.createdAt).toLocaleString() : '未知'}</p>
            ${task.readAt ? `<p>阅读时间：${new Date(task.readAt).toLocaleString()}</p>` : ''}
            ${task.completedAt ? `<p>完成时间：${new Date(task.completedAt).toLocaleString()}</p>` : ''}
        `;
    }
}

window.markTaskCompleted = async function(taskId, checked) {
    if (!checked) return;
    const task = allTasks.find(t => t._id === taskId);
    if (!task) return;
    task.status = 'completed';
    task.completedAt = Date.now();
    try {
        await db.put(task);
        await loadAllTasks();
        renderTaskList();
        if (selectedTaskId === taskId) {
            const detailContent = document.getElementById('task-detail-content');
            if (detailContent) {
                detailContent.innerHTML = '<p>任务已完成</p>';
            }
            selectedTaskId = null;
        }
    } catch (e) {
        console.error('完成任务失败:', e);
    }
};

function searchTasks() {
    const searchInput = document.querySelector('.search .text');
    if (!searchInput) return;
    
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) {
        renderTaskList();
        return;
    }
    const filtered = allTasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(keyword)) || 
        (t.content && t.content.toLowerCase().includes(keyword))
    );
    const listEl = document.getElementById('task-list');
    if (!listEl) return;
    
    if (!filtered.length) {
        listEl.innerHTML = '<p style="text-align:center; color:#999;">未找到匹配任务</p>';
        return;
    }
    listEl.innerHTML = filtered.map(task => {
        const summary = task.content?.length > 30 ? task.content.substring(0,30) + '…' : task.content;
        return `
            <div class="task-item" data-id="${task._id}">
                <div class="task-header">
                    <span class="task-title" onclick="window.selectTask('${task._id}')">${task.title || '无标题'}</span>
                    <span class="task-urgency ${task.urgency || '轻量'}">${task.urgency || '轻量'}</span>
                </div>
                <div class="task-summary">${summary || ''}</div>
                <div class="task-meta">
                    <span>${task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}</span>
                    <input type="checkbox" ${task.status === 'completed' ? 'checked disabled' : ''} onchange="window.markTaskCompleted('${task._id}', this.checked)">
                </div>
            </div>
        `;
    }).join('');
}

async function addSampleTasks() {
    if (!currentUser || !db) return;
    const sampleTasks = [
        {
            _id: 'task_' + Date.now() + '_1',
            title: '新生开班提醒',
            content: '本周六上午9点新班开班，请准备教室和教材。',
            sender: '系统',
            receiver: currentUser.username || currentUser.name,
            type: '开班',
            urgency: '紧急',
            status: 'unread',
            createdAt: Date.now() - 3600000
        },
        {
            _id: 'task_' + Date.now() + '_2',
            title: '售后回访任务',
            content: '联系学员张三，了解学习情况。',
            sender: '李老师',
            receiver: currentUser.username || currentUser.name,
            type: '回访',
            urgency: '中等',
            status: 'read',
            readAt: Date.now() - 1800000,
            createdAt: Date.now() - 7200000
        },
        {
            _id: 'task_' + Date.now() + '_3',
            title: '寄送教材',
            content: '将管理类联考教材寄给学员王五。',
            sender: '教务',
            receiver: currentUser.username || currentUser.name,
            type: '寄件',
            urgency: '轻量',
            status: 'completed',
            completedAt: Date.now() - 86400000,
            createdAt: Date.now() - 172800000
        }
    ];
    for (let t of sampleTasks) {
        try {
            await db.put(t);
        } catch (e) {
            console.log('示例任务可能已存在');
        }
    }
    await loadAllTasks();
    renderTaskList();
}

// ==================== 初始化所有功能 ====================
window.addEventListener('load', function() {
    // 初始化天气
    if (typeof initWeather === 'function') {
        initWeather();
    } else {
        console.warn('天气模块未加载');
    }
    
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    const weatherInfo = document.getElementById('weather-info');
    if (weatherInfo) {
        weatherInfo.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof showCitySwitchModal === 'function') {
                showCitySwitchModal();
            }
        });
    }

    initHotNewsTicker(); // 修改后从 CouchDB 读取
    adjustNavForMobile();
    adjustCenterBoxesHeight();

    updateSpeedButton();

    // 延迟初始化任务系统，避免阻塞页面渲染
    setTimeout(() => {
        initTaskSystem().then(() => {
            if (allTasks.length === 0) addSampleTasks();
        });
    }, 500);
});

window.addEventListener('resize', function() {
    adjustNavForMobile();
    adjustCenterBoxesHeight();
    setTimeout(initHotNewsTicker, 100);
});