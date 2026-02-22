// ==================== 全局变量声明 ====================
// 从 localStorage 加载数据
let gdData = JSON.parse(localStorage.getItem('gdData')) || 
    (typeof BOOKMARK_DATA !== 'undefined' && BOOKMARK_DATA.gdData ? BOOKMARK_DATA.gdData : {
    entertainment: [],
    tools: [],
    cloud: [],
    essential: [],
    office: [],
    exam: []
});

let columnTitles = JSON.parse(localStorage.getItem('columnTitles')) || 
    (typeof BOOKMARK_DATA !== 'undefined' && BOOKMARK_DATA.columnTitles ? BOOKMARK_DATA.columnTitles : {
    entertainment: '娱乐网站',
    tools: '便捷工具',
    cloud: '我的网盘',
    essential: '必备网站',
    office: '办公常用',
    exam: '考试专用'
});

let favoritesData = JSON.parse(localStorage.getItem('favoritesData')) || 
    (typeof BOOKMARK_DATA !== 'undefined' && BOOKMARK_DATA.favoritesData ? BOOKMARK_DATA.favoritesData : []);

let emailData = JSON.parse(localStorage.getItem('emailData')) || 
    (typeof BOOKMARK_DATA !== 'undefined' && BOOKMARK_DATA.emailData ? BOOKMARK_DATA.emailData : []);

let bookshelfData = JSON.parse(localStorage.getItem('bookshelfData')) || 
    (typeof BOOKMARK_DATA !== 'undefined' && BOOKMARK_DATA.bookshelfData ? BOOKMARK_DATA.bookshelfData : []);

// ==================== CouchDB 配置 ====================
const COUCHDB_URL = 'http://satoko:1793364876@localhost:5984'; // 请替换为您的实际地址
const HOTNEWS_DB = 'hotnews';
const HOTNEWS_DOC_ID = 'current_news';

// 管理员账号（用于导入验证）
const ADMIN_ACCOUNT = '管理员';
const ADMIN_PASSWORD = '2026';

// ==================== 历史记录功能 ====================
document.querySelectorAll('.history-dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const type = this.getAttribute('data-type');
        
        if (type === 'local') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (typeof importAllData === 'function') {
                            importAllData(data);
                        }
                        alert('历史记录导入成功！');
                    } catch (error) {
                        alert('文件解析失败，请检查文件格式。');
                    }
                };
                reader.readAsText(file);
            });
            
            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
            
        } else if (type === 'online') {
            const url = this.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank');
            }
        }
    });
});

// ==================== 常用工具栏功能 ====================
const gdHeader = document.getElementById('gd-header');
const gdContent = document.getElementById('gd-content');

if (gdHeader) {
    gdHeader.addEventListener('click', function() {
        gdHeader.classList.toggle('expanded');
        gdContent.classList.toggle('expanded');
    });
}

// 保存数据函数
function saveGdData() {
    localStorage.setItem('gdData', JSON.stringify(gdData));
    localStorage.setItem('columnTitles', JSON.stringify(columnTitles));
}

function saveFavoritesData() {
    localStorage.setItem('favoritesData', JSON.stringify(favoritesData));
}

function saveEmailData() {
    localStorage.setItem('emailData', JSON.stringify(emailData));
}

function saveBookshelfData() {
    localStorage.setItem('bookshelfData', JSON.stringify(bookshelfData));
}

// 更新区块标题
function updateColumnTitles() {
    for (const column in columnTitles) {
        const columnElement = document.getElementById(`${column}-column`);
        if (columnElement) {
            const titleElement = columnElement.querySelector('h3');
            if (titleElement) {
                const spanElement = titleElement.querySelector('.edit-title-btn');
                titleElement.innerHTML = columnTitles[column];
                if (spanElement) {
                    titleElement.appendChild(spanElement);
                }
            }
        }
    }
}

// 渲染常用工具栏
function renderGdColumns() {
    const columns = ['entertainment', 'tools', 'cloud', 'essential', 'office', 'exam'];
    
    columns.forEach(column => {
        const list = document.getElementById(`${column}-list`);
        if (!list) return;
        
        list.innerHTML = '';
        
        if (!gdData[column]) {
            gdData[column] = [];
        }
        
        gdData[column].forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'gd-item';
            itemElement.dataset.index = index;
            
            const linkElement = document.createElement('a');
            linkElement.href = item.url || '#';
            linkElement.textContent = item.name || '未命名';
            linkElement.target = '_blank';
            
            const actionsElement = document.createElement('div');
            actionsElement.className = 'item-actions';
            
            const noteBtn = document.createElement('button');
            noteBtn.className = 'action-btn note-btn';
            noteBtn.innerHTML = '<i class="fas fa-sticky-note"></i>';
            noteBtn.title = '查看备注';
            noteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                showNotePasswordModal(item, column, index);
            });
            actionsElement.appendChild(noteBtn);
            
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit-item-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = '编辑';
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                showEditPasswordModal(column, index);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = '删除';
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                showDeletePasswordModal(column, index);
            });
            
            actionsElement.appendChild(editBtn);
            actionsElement.appendChild(deleteBtn);
            
            itemElement.appendChild(linkElement);
            itemElement.appendChild(actionsElement);
            
            list.appendChild(itemElement);
        });
    });
}

// 绑定添加项按钮事件
document.querySelectorAll('.add-item-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const column = this.getAttribute('data-column');
        showAddForm(column);
    });
});

// 显示添加表单
function showAddForm(column) {
    document.querySelectorAll('.add-item-form').forEach(form => {
        form.style.display = 'none';
    });
    
    const form = document.getElementById(`${column}-form`);
    if (!form) return;
    
    form.style.display = 'block';
    
    form.querySelector('.item-name').value = '';
    form.querySelector('.item-url').value = '';
    const noteInput = form.querySelector('.item-note');
    if (noteInput) noteInput.value = '';
    
    const saveBtn = form.querySelector('.save-btn');
    saveBtn.onclick = function(e) {
        e.preventDefault();
        addItem(column);
    };
    
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 添加新项
function addItem(column) {
    const form = document.getElementById(`${column}-form`);
    if (!form) return;
    
    const name = form.querySelector('.item-name').value.trim();
    const url = form.querySelector('.item-url').value.trim();
    
    if (!name || !url) {
        alert('请填写完整的名称和链接！');
        return;
    }
    
    const newItem = {
        name: name,
        url: url
    };
    
    const noteInput = form.querySelector('.item-note');
    if (noteInput) {
        newItem.note = noteInput.value.trim();
    }
    
    if (!gdData[column]) {
        gdData[column] = [];
    }
    
    gdData[column].push(newItem);
    saveGdData();
    renderGdColumns();
    form.style.display = 'none';
    alert('添加成功！');
}

// ==================== 密码验证功能 ====================
const passwordModal = document.getElementById('password-modal');
const closePasswordModal = document.getElementById('close-password-modal');
const cancelPasswordBtn = document.getElementById('cancel-password-btn');
const verifyPasswordBtn = document.getElementById('verify-password-btn');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');

const noteModal = document.getElementById('note-modal');
const closeNoteModal = document.getElementById('close-note-modal');
const closeNoteBtn = document.getElementById('close-note-btn');
const noteModalTitle = document.getElementById('note-modal-title');
const noteInfo = document.getElementById('note-info');

const columnNameModal = document.getElementById('column-name-modal');
const closeColumnNameModal = document.getElementById('close-column-name-modal');
const cancelColumnNameBtn = document.getElementById('cancel-column-name-btn');
const saveColumnNameBtn = document.getElementById('save-column-name-btn');
const columnNameInput = document.getElementById('column-name-input');
const columnNameError = document.getElementById('column-name-error');

let pendingItem = null;
let pendingColumn = null;
let pendingIndex = null;
let pendingAction = null;
let editColumn = null;

function getCurrentPassword() {
    return '2025';
}

function showPasswordModal(action, column, index, item) {
    pendingAction = action;
    pendingColumn = column;
    pendingIndex = index;
    pendingItem = item;
    
    if (passwordModal) {
        passwordModal.classList.add('show');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
        if (passwordError) {
            passwordError.style.display = 'none';
        }
    }
}

function closePasswordModalFunc() {
    if (passwordModal) {
        passwordModal.classList.remove('show');
    }
    pendingItem = null;
    pendingColumn = null;
    pendingIndex = null;
    pendingAction = null;
    editColumn = null;
}

if (closePasswordModal) {
    closePasswordModal.addEventListener('click', closePasswordModalFunc);
}
if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener('click', closePasswordModalFunc);
}

if (passwordModal) {
    passwordModal.addEventListener('click', function(e) {
        if (e.target === passwordModal) {
            closePasswordModalFunc();
        }
    });
}

if (verifyPasswordBtn) {
    verifyPasswordBtn.addEventListener('click', function() {
        const password = passwordInput ? passwordInput.value.trim() : '';
        const currentPassword = getCurrentPassword();
        
        if (password === currentPassword) {
            executePendingAction();
            closePasswordModalFunc();
        } else {
            if (passwordError) {
                passwordError.style.display = 'block';
            }
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
    });
}

if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && verifyPasswordBtn) {
            verifyPasswordBtn.click();
        }
    });
}

function executePendingAction() {
    switch (pendingAction) {
        case 'note':
            showNoteInfo(pendingItem);
            break;
        case 'edit':
            showEditForm(pendingColumn, pendingIndex);
            break;
        case 'delete':
            deleteItem(pendingColumn, pendingIndex);
            break;
        case 'editColumnName':
            showColumnNameForm(editColumn);
            break;
    }
}

function showNotePasswordModal(item, column, index) {
    showPasswordModal('note', column, index, item);
}

function showEditPasswordModal(column, index) {
    const item = gdData[column] && gdData[column][index] ? gdData[column][index] : null;
    if (item) {
        showPasswordModal('edit', column, index, item);
    }
}

function showDeletePasswordModal(column, index) {
    const item = gdData[column] && gdData[column][index] ? gdData[column][index] : null;
    if (item) {
        showPasswordModal('delete', column, index, item);
    }
}

function showEditColumnNamePasswordModal(column) {
    editColumn = column;
    showPasswordModal('editColumnName', null, null, null);
}

function showNoteInfo(item) {
    if (!item || !noteModalTitle || !noteInfo || !noteModal) return;
    
    noteModalTitle.textContent = item.name || '备注信息';
    
    let html = `<p><strong>链接：</strong><a href="${item.url || '#'}" target="_blank">${item.url || '#'}</a></p>`;
    
    if (item.note && item.note.trim() !== '') {
        const noteWithBreaks = item.note.replace(/\n/g, '<br>');
        html += `<p><strong>备注：</strong><br>${noteWithBreaks}</p>`;
    } else {
        html += `<p>暂无备注信息。</p>`;
    }
    
    noteInfo.innerHTML = html;
    noteModal.classList.add('show');
}

if (closeNoteModal) {
    closeNoteModal.addEventListener('click', function() {
        if (noteModal) noteModal.classList.remove('show');
    });
}

if (closeNoteBtn) {
    closeNoteBtn.addEventListener('click', function() {
        if (noteModal) noteModal.classList.remove('show');
    });
}

if (noteModal) {
    noteModal.addEventListener('click', function(e) {
        if (e.target === noteModal) {
            noteModal.classList.remove('show');
        }
    });
}

function showEditForm(column, index) {
    if (!gdData[column] || !gdData[column][index]) return;
    
    const item = gdData[column][index];
    const form = document.getElementById(`${column}-form`);
    if (!form) return;
    
    form.style.display = 'block';
    form.querySelector('.item-name').value = item.name || '';
    form.querySelector('.item-url').value = item.url || '';
    const noteInput = form.querySelector('.item-note');
    if (noteInput) noteInput.value = item.note || '';
    
    const saveBtn = form.querySelector('.save-btn');
    saveBtn.onclick = function(e) {
        e.preventDefault();
        updateItem(column, index);
    };
    
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateItem(column, index) {
    const form = document.getElementById(`${column}-form`);
    if (!form) return;
    
    const name = form.querySelector('.item-name').value.trim();
    const url = form.querySelector('.item-url').value.trim();
    
    if (!name || !url) {
        alert('请填写完整的名称和链接！');
        return;
    }
    
    if (!gdData[column] || !gdData[column][index]) return;
    
    gdData[column][index].name = name;
    gdData[column][index].url = url;
    
    const noteInput = form.querySelector('.item-note');
    if (noteInput) {
        gdData[column][index].note = noteInput.value.trim();
    }
    
    saveGdData();
    renderGdColumns();
    form.style.display = 'none';
    alert('更新成功！');
}

function deleteItem(column, index) {
    if (!gdData[column] || !gdData[column][index]) return;
    
    if (confirm('确定要删除此项吗？')) {
        gdData[column].splice(index, 1);
        saveGdData();
        renderGdColumns();
        alert('删除成功！');
    }
}

function showColumnNameForm(column) {
    if (!columnNameModal) return;
    
    columnNameModal.classList.add('show');
    if (columnNameInput) {
        columnNameInput.value = columnTitles[column] || '';
        columnNameInput.focus();
    }
    if (columnNameError) {
        columnNameError.style.display = 'none';
    }
    
    if (saveColumnNameBtn) {
        saveColumnNameBtn.onclick = function() {
            saveColumnName(column);
        };
    }
}

function saveColumnName(column) {
    if (!columnNameInput) return;
    
    const newName = columnNameInput.value.trim();
    
    if (!newName) {
        if (columnNameError) {
            columnNameError.style.display = 'block';
        }
        return;
    }
    
    columnTitles[column] = newName;
    saveGdData();
    updateColumnTitles();
    
    if (columnNameModal) {
        columnNameModal.classList.remove('show');
    }
    alert('区块名称修改成功！');
}

if (closeColumnNameModal) {
    closeColumnNameModal.addEventListener('click', function() {
        if (columnNameModal) columnNameModal.classList.remove('show');
    });
}

if (cancelColumnNameBtn) {
    cancelColumnNameBtn.addEventListener('click', function() {
        if (columnNameModal) columnNameModal.classList.remove('show');
    });
}

if (columnNameModal) {
    columnNameModal.addEventListener('click', function(e) {
        if (e.target === columnNameModal) {
            columnNameModal.classList.remove('show');
        }
    });
}

document.querySelectorAll('.edit-title-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const column = this.getAttribute('data-column');
        showEditColumnNamePasswordModal(column);
    });
});

document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const column = this.getAttribute('data-column');
        const form = document.getElementById(`${column}-form`);
        if (form) {
            form.style.display = 'none';
        }
    });
});

// ==================== 热点导入功能 (CouchDB 版) ====================
const hotImportModal = document.getElementById('hot-import-modal');
const closeHotImportModal = document.getElementById('close-hot-import-modal');
const cancelHotImportBtn = document.getElementById('cancel-hot-import-btn');
const saveHotImportBtn = document.getElementById('save-hot-import-btn');
const selectFileBtn = document.getElementById('select-file-btn');
const hotFileUploadArea = document.getElementById('hot-file-upload-area');
const hotFileInput = document.getElementById('hot-file-input');
const hotFolderUploadArea = document.getElementById('hot-folder-upload-area');
const hotFolderInput = document.getElementById('hot-folder-input');
const hotFileList = document.getElementById('hot-file-list');
const previewArea = document.getElementById('preview-area');
const previewContent = document.getElementById('preview-content');

let hotFileData = [];
let hotFiles = [];

function showHotImportModal(type) {
    if (!hotImportModal) return;

    // 检查是否已登录且为管理员
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.账号 !== ADMIN_ACCOUNT) {
        alert('只有管理员可以导入热点新闻');
        // 可以弹出登录框，这里简单提示
        return;
    }
    
    hotImportModal.classList.add('show');
    hotFileData = [];
    hotFiles = [];
    if (hotFileList) hotFileList.innerHTML = '';
    if (previewArea) previewArea.style.display = 'none';
    
    if (type === 'file') {
        if (hotFileUploadArea) hotFileUploadArea.style.display = 'block';
        if (hotFolderUploadArea) hotFolderUploadArea.style.display = 'none';
    } else if (type === 'folder') {
        if (hotFileUploadArea) hotFileUploadArea.style.display = 'none';
        if (hotFolderUploadArea) hotFolderUploadArea.style.display = 'block';
    }
}

if (closeHotImportModal) {
    closeHotImportModal.addEventListener('click', function() {
        if (hotImportModal) hotImportModal.classList.remove('show');
    });
}

if (cancelHotImportBtn) {
    cancelHotImportBtn.addEventListener('click', function() {
        if (hotImportModal) hotImportModal.classList.remove('show');
    });
}

if (hotImportModal) {
    hotImportModal.addEventListener('click', function(e) {
        if (e.target === hotImportModal) {
            hotImportModal.classList.remove('show');
        }
    });
}

if (hotFileUploadArea) {
    hotFileUploadArea.addEventListener('click', function() {
        if (hotFileInput) hotFileInput.click();
    });

    hotFileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#30619e';
        this.style.backgroundColor = '#e6f2ff';
    });

    hotFileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#87CEFA';
        this.style.backgroundColor = '#f0f8ff';
    });

    hotFileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#87CEFA';
        this.style.backgroundColor = '#f0f8ff';
        
        const files = e.dataTransfer.files;
        handleHotFiles(files);
    });
}

if (hotFileInput) {
    hotFileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        handleHotFiles(files);
    });
}

if (hotFolderUploadArea) {
    hotFolderUploadArea.addEventListener('click', function() {
        if (hotFolderInput) hotFolderInput.click();
    });
}

if (hotFolderInput) {
    hotFolderInput.addEventListener('change', function(e) {
        const files = e.target.files;
        handleHotFiles(files);
    });
}

if (selectFileBtn) {
    selectFileBtn.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                handleHotFiles(files);
            }
            document.body.removeChild(fileInput);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
    });
}

function handleHotFiles(files) {
    if (!files || files.length === 0) return;
    
    const txtFiles = Array.from(files).filter(file => file.name.match(/\.(txt)$/i));
    
    if (txtFiles.length === 0) {
        alert('请上传文本文件 (.txt)');
        return;
    }
    
    txtFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    if (hotFileList) hotFileList.innerHTML = '';
    hotFileData = [];
    hotFiles = txtFiles;
    
    let filesProcessed = 0;
    
    txtFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        
        const fileRemove = document.createElement('div');
        fileRemove.className = 'file-remove';
        fileRemove.innerHTML = '<i class="fas fa-times"></i>';
        fileRemove.addEventListener('click', function() {
            fileItem.remove();
            hotFiles.splice(index, 1);
        });
        
        fileItem.appendChild(fileName);
        fileItem.appendChild(fileSize);
        fileItem.appendChild(fileRemove);
        if (hotFileList) hotFileList.appendChild(fileItem);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            processHotFileContent(content, file.name);
            filesProcessed++;
            
            if (filesProcessed === txtFiles.length && hotFileData.length > 0) {
                showPreview();
            }
        };
        reader.readAsText(file);
    });
}

function processHotFileContent(content, fileName) {
    const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (lines.length === 0) {
        return;
    }
    
    hotFileData.push({
        name: fileName,
        lines: lines
    });
}

function showPreview() {
    if (!previewArea || !previewContent) return;
    
    previewArea.style.display = 'block';
    previewContent.innerHTML = '';
    
    const previewFiles = hotFileData.slice(0, Math.min(3, hotFileData.length));
    previewFiles.forEach((fileData, fileIndex) => {
        const fileTitle = document.createElement('div');
        fileTitle.className = 'preview-item';
        fileTitle.style.fontWeight = 'bold';
        fileTitle.textContent = `${fileIndex + 1}. ${fileData.name}`;
        previewContent.appendChild(fileTitle);
        
        const previewLines = fileData.lines.slice(0, Math.min(3, fileData.lines.length));
        previewLines.forEach((line, lineIndex) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.textContent = `  ${lineIndex + 1}. ${line}`;
            previewContent.appendChild(previewItem);
        });
        
        if (fileData.lines.length > 3) {
            const moreItem = document.createElement('div');
            moreItem.className = 'preview-item';
            moreItem.textContent = `  ... 还有 ${fileData.lines.length - 3} 行`;
            previewContent.appendChild(moreItem);
        }
    });
    
    if (hotFileData.length > 3) {
        const moreFiles = document.createElement('div');
        moreFiles.className = 'preview-item';
        moreFiles.textContent = `... 还有 ${hotFileData.length - 3} 个文件`;
        previewContent.appendChild(moreFiles);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

if (saveHotImportBtn) {
    saveHotImportBtn.addEventListener('click', async function() {
        if (hotFileData.length === 0) {
            alert('请先上传有效的文本文件！');
            return;
        }

        // 将所有文件内容合并为一个新闻数组
        let allNews = [];
        hotFileData.forEach(fileData => {
            fileData.lines.forEach(line => {
                allNews.push({ text: line, url: '#' }); // 默认链接为 #，可根据需要调整
            });
        });

        try {
            const db = new PouchDB(HOTNEWS_DB);
            // 尝试同步远程
            if (COUCHDB_URL) {
                const remoteDB = new PouchDB(`${COUCHDB_URL}/${HOTNEWS_DB}`);
                await db.sync(remoteDB);
            }

            let doc;
            try {
                doc = await db.get(HOTNEWS_DOC_ID);
                doc.news = allNews;
                doc.updatedAt = new Date().toISOString();
            } catch (e) {
                doc = {
                    _id: HOTNEWS_DOC_ID,
                    news: allNews,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            await db.put(doc);

            // 同步到远程
            if (COUCHDB_URL) {
                const remoteDB = new PouchDB(`${COUCHDB_URL}/${HOTNEWS_DB}`);
                await db.sync(remoteDB);
            }

            alert(`成功导入 ${hotFileData.length} 个文本文件！`);
            if (hotImportModal) hotImportModal.classList.remove('show');

            // 刷新主页轮播（如果当前页面是主页）
            if (typeof initHotNewsTicker === 'function') {
                initHotNewsTicker();
            }
        } catch (error) {
            console.error('保存到 CouchDB 失败', error);
            alert('保存失败，请检查网络或权限');
        }
    });
}

// ==================== 文本管理功能 ====================
let selectedTextIndex = 0;

// ==================== 我的书架功能 ====================
const bookshelfContainer = document.getElementById('bookshelf-container');
const bookshelfBtn = document.getElementById('bookshelf-btn');
const bookshelfDropdown = document.getElementById('bookshelf-dropdown-menu');
const bookshelfList = document.getElementById('bookshelf-list');
const bookshelfCount = document.getElementById('bookshelf-count');
const addBookBtn = document.getElementById('add-book-btn');
const addBookModal = document.getElementById('add-book-modal');
const closeAddBookModal = document.getElementById('close-add-book-modal');
const cancelBookBtn = document.getElementById('cancel-book-btn');
const saveBookBtn = document.getElementById('save-book-btn');
const bookTitleInput = document.getElementById('book-title-input');
const bookUrlInput = document.getElementById('book-url-input');
const bookNoteInput = document.getElementById('book-note-input');
const bookError = document.getElementById('book-error');

function initBookshelf() {
    renderBookshelf();
    updateBookshelfCount();
    
    if (bookshelfBtn && bookshelfDropdown) {
        bookshelfBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (bookshelfDropdown.style.display === 'block') {
                bookshelfDropdown.style.display = 'none';
            } else {
                bookshelfDropdown.style.display = 'block';
            }
        });
    }
    
    if (bookshelfContainer) {
        document.addEventListener('click', function(e) {
            if (!bookshelfContainer.contains(e.target)) {
                if (bookshelfDropdown) {
                    bookshelfDropdown.style.display = 'none';
                }
            }
        });
    }
    
    if (addBookBtn) {
        addBookBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showAddBookModal();
        });
    }
    
    if (closeAddBookModal) {
        closeAddBookModal.addEventListener('click', function() {
            if (addBookModal) addBookModal.classList.remove('show');
        });
    }
    
    if (cancelBookBtn) {
        cancelBookBtn.addEventListener('click', function() {
            if (addBookModal) addBookModal.classList.remove('show');
        });
    }
    
    if (addBookModal) {
        addBookModal.addEventListener('click', function(e) {
            if (e.target === addBookModal) {
                addBookModal.classList.remove('show');
            }
        });
    }
    
    if (saveBookBtn) {
        saveBookBtn.addEventListener('click', function() {
            const title = bookTitleInput ? bookTitleInput.value.trim() : '';
            const url = bookUrlInput ? bookUrlInput.value.trim() : '';
            const note = bookNoteInput ? bookNoteInput.value.trim() : '';
            
            if (!title || !url) {
                if (bookError) bookError.style.display = 'block';
                return;
            }
            
            if (bookError) bookError.style.display = 'none';
            
            bookshelfData.push({
                title: title,
                url: url,
                note: note
            });
            
            saveBookshelfData();
            renderBookshelf();
            updateBookshelfCount();
            if (addBookModal) addBookModal.classList.remove('show');
            
            if (bookTitleInput) bookTitleInput.value = '';
            if (bookUrlInput) bookUrlInput.value = '';
            if (bookNoteInput) bookNoteInput.value = '';
            
            alert('书籍添加成功！');
        });
    }
}

function renderBookshelf() {
    if (!bookshelfList) return;
    
    bookshelfList.innerHTML = '';
    
    bookshelfData.forEach((book, index) => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.dataset.index = index;
        
        const linkElement = document.createElement('a');
        linkElement.href = book.url || '#';
        linkElement.textContent = book.title || '未命名';
        linkElement.target = '_blank';
        
        const actionsElement = document.createElement('div');
        actionsElement.className = 'book-actions';
        
        const noteBtn = document.createElement('button');
        noteBtn.className = 'action-btn view-btn';
        noteBtn.innerHTML = '<i class="fas fa-eye"></i>';
        noteBtn.title = '查看详情';
        noteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            showBookDetails(book);
        });
        actionsElement.appendChild(noteBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = '删除';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            deleteBook(index);
        });
        actionsElement.appendChild(deleteBtn);
        
        bookItem.appendChild(linkElement);
        bookItem.appendChild(actionsElement);
        
        bookshelfList.appendChild(bookItem);
    });
}

function updateBookshelfCount() {
    if (bookshelfCount) {
        bookshelfCount.textContent = bookshelfData.length;
    }
}

function showBookDetails(book) {
    if (!noteModalTitle || !noteInfo || !noteModal) return;
    
    noteModalTitle.textContent = book.title || '书籍详情';
    
    let html = `<p><strong>链接：</strong><a href="${book.url || '#'}" target="_blank">${book.url || '#'}</a></p>`;
    
    if (book.note && book.note.trim() !== '') {
        const noteWithBreaks = book.note.replace(/\n/g, '<br>');
        html += `<p><strong>备注：</strong><br>${noteWithBreaks}</p>`;
    } else {
        html += `<p>暂无备注信息。</p>`;
    }
    
    noteInfo.innerHTML = html;
    noteModal.classList.add('show');
}

function deleteBook(index) {
    if (index >= 0 && index < bookshelfData.length) {
        if (confirm('确定要删除这本书吗？')) {
            bookshelfData.splice(index, 1);
            saveBookshelfData();
            renderBookshelf();
            updateBookshelfCount();
            alert('删除成功！');
        }
    }
}

function showAddBookModal() {
    if (!addBookModal) return;
    
    addBookModal.classList.add('show');
    if (bookTitleInput) bookTitleInput.value = '';
    if (bookUrlInput) bookUrlInput.value = '';
    if (bookNoteInput) bookNoteInput.value = '';
    if (bookError) bookError.style.display = 'none';
    if (bookTitleInput) bookTitleInput.focus();
}

// ==================== 我的邮箱功能 ====================
function initEmail() {
    renderEmailDropdown();
    
    const emailDropdown = document.querySelector('.email-dropdown');
    const emailDropdownMenu = document.querySelector('.email-dropdown-menu');
    
    if (emailDropdown && emailDropdownMenu) {
        emailDropdown.addEventListener('mouseenter', function() {
            emailDropdownMenu.style.display = 'block';
        });
        
        emailDropdown.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!emailDropdownMenu.matches(':hover')) {
                    emailDropdownMenu.style.display = 'none';
                }
            }, 100);
        });
        
        emailDropdownMenu.addEventListener('mouseleave', function() {
            emailDropdownMenu.style.display = 'none';
        });
    }
    
    const addEmailBtn = document.getElementById('add-email-btn');
    if (addEmailBtn) {
        addEmailBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showAddEmailModal();
        });
    }
}

function renderEmailDropdown() {
    const emailDropdownMenu = document.querySelector('.email-dropdown-menu');
    if (!emailDropdownMenu) return;
    
    const existingItems = emailDropdownMenu.querySelectorAll('.email-dropdown-item:not(#add-email-btn)');
    existingItems.forEach(item => item.remove());
    
    emailData.forEach((email, index) => {
        const emailItem = document.createElement('div');
        emailItem.className = 'email-dropdown-item';
        emailItem.dataset.index = index;
        emailItem.dataset.url = email.url;
        
        emailItem.innerHTML = `
            <i class="fas fa-envelope"></i> ${email.name || '未命名'}
            <span class="email-actions">
                <button class="email-view-btn" data-index="${index}" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="email-delete-btn" data-index="${index}" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        `;
        
        const addEmailBtn = document.getElementById('add-email-btn');
        if (addEmailBtn) {
            emailDropdownMenu.insertBefore(emailItem, addEmailBtn);
        } else {
            emailDropdownMenu.appendChild(emailItem);
        }
        
        emailItem.addEventListener('click', function(e) {
            if (!e.target.closest('.email-actions')) {
                window.open(email.url, '_blank');
            }
        });
        
        const viewBtn = emailItem.querySelector('.email-view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showEmailDetails(email, index);
            });
        }
        
        const deleteBtn = emailItem.querySelector('.email-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteEmail(index);
            });
        }
    });
}

function showEmailDetails(email, index) {
    if (!noteModalTitle || !noteInfo || !noteModal) return;
    
    noteModalTitle.textContent = email.name || '邮箱详情';
    
    let html = `<p><strong>链接：</strong><a href="${email.url || '#'}" target="_blank">${email.url || '#'}</a></p>`;
    
    if (email.note && email.note.trim() !== '') {
        const noteWithBreaks = email.note.replace(/\n/g, '<br>');
        html += `<p><strong>备注：</strong><br>${noteWithBreaks}</p>`;
    } else {
        html += `<p>暂无备注信息。</p>`;
    }
    
    html += `<div style="text-align: center; margin-top: 20px;">
        <button class="manage-btn" id="edit-email-from-modal" style="width: 150px;" data-index="${index}">
            <i class="fas fa-edit"></i> 编辑
        </button>
    </div>`;
    
    noteInfo.innerHTML = html;
    noteModal.classList.add('show');
    
    const editBtn = document.getElementById('edit-email-from-modal');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const editIndex = this.getAttribute('data-index');
            if (noteModal) noteModal.classList.remove('show');
            editEmail(parseInt(editIndex));
        });
    }
}

function editEmail(index) {
    if (index < 0 || index >= emailData.length) return;
    
    const email = emailData[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = 'edit-email-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" id="close-edit-email-modal">&times;</button>
            <h2 class="modal-title">编辑邮箱</h2>
            <div class="modal-text">
                请编辑邮箱信息：
            </div>
            <input type="text" class="password-input" id="edit-email-name-input" placeholder="邮箱名称" value="${email.name || ''}">
            <input type="text" class="password-input" id="edit-email-url-input" placeholder="邮箱链接" value="${email.url || ''}">
            <input type="text" class="password-input" id="edit-email-note-input" placeholder="备注（可选）" value="${email.note || ''}">
            <div style="text-align: center; margin-top: 20px;">
                <button class="manage-btn" id="save-edit-email-btn" style="width: 150px;">
                    <i class="fas fa-check"></i> 保存
                </button>
                <button class="recycle-btn" id="cancel-edit-email-btn" style="width: 150px; margin-left: 10px;">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
            <div id="edit-email-error" style="color: #e60012; margin-top: 10px; text-align: center; display: none;">
                邮箱名称和链接不能为空！
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('close-edit-email-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    const cancelBtn = document.getElementById('cancel-edit-email-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    const saveBtn = document.getElementById('save-edit-email-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('edit-email-name-input');
            const urlInput = document.getElementById('edit-email-url-input');
            const noteInput = document.getElementById('edit-email-note-input');
            const errorDiv = document.getElementById('edit-email-error');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const url = urlInput ? urlInput.value.trim() : '';
            const note = noteInput ? noteInput.value.trim() : '';
            
            if (!name || !url) {
                if (errorDiv) errorDiv.style.display = 'block';
                return;
            }
            
            emailData[index] = {
                id: email.id,
                name: name,
                url: url,
                note: note
            };
            
            saveEmailData();
            renderEmailDropdown();
            modal.remove();
            alert('邮箱修改成功！');
        });
    }
}

function deleteEmail(index) {
    if (index >= 0 && index < emailData.length) {
        if (confirm('确定要删除这个邮箱吗？')) {
            emailData.splice(index, 1);
            saveEmailData();
            renderEmailDropdown();
            alert('删除成功！');
        }
    }
}

function showAddEmailModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = 'add-email-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" id="close-add-email-modal">&times;</button>
            <h2 class="modal-title">添加自定义邮箱</h2>
            <div class="modal-text">
                请输入邮箱信息：
            </div>
            <input type="text" class="password-input" id="email-name-input" placeholder="邮箱名称">
            <input type="text" class="password-input" id="email-url-input" placeholder="邮箱链接">
            <input type="text" class="password-input" id="email-note-input" placeholder="备注（可选）">
            <div style="text-align: center; margin-top: 20px;">
                <button class="manage-btn" id="save-email-btn" style="width: 150px;">
                    <i class="fas fa-check"></i> 保存
                </button>
                <button class="recycle-btn" id="cancel-email-btn" style="width: 150px; margin-left: 10px;">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
            <div id="email-error" style="color: #e60012; margin-top: 10px; text-align: center; display: none;">
                邮箱名称和链接不能为空！
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('close-add-email-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    const cancelBtn = document.getElementById('cancel-email-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    const saveBtn = document.getElementById('save-email-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('email-name-input');
            const urlInput = document.getElementById('email-url-input');
            const noteInput = document.getElementById('email-note-input');
            const errorDiv = document.getElementById('email-error');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const url = urlInput ? urlInput.value.trim() : '';
            const note = noteInput ? noteInput.value.trim() : '';
            
            if (!name || !url) {
                if (errorDiv) errorDiv.style.display = 'block';
                return;
            }
            
            const newId = emailData.length > 0 ? 
                Math.max(...emailData.map(item => item.id)) + 1 : 1;
            
            emailData.push({
                id: newId,
                name: name,
                url: url,
                note: note
            });
            
            saveEmailData();
            renderEmailDropdown();
            modal.remove();
            alert('邮箱添加成功！');
        });
    }
}

// ==================== 收藏功能 ====================
function initFavorites() {
    renderFavoritesDropdown();
    
    const favoritesDropdown = document.querySelector('.favorites-dropdown');
    const favoritesDropdownMenu = document.querySelector('.favorites-dropdown-menu');
    
    if (favoritesDropdown && favoritesDropdownMenu) {
        favoritesDropdown.addEventListener('mouseenter', function() {
            favoritesDropdownMenu.style.display = 'block';
        });
        
        favoritesDropdown.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!favoritesDropdownMenu.matches(':hover')) {
                    favoritesDropdownMenu.style.display = 'none';
                }
            }, 100);
        });
        
        favoritesDropdownMenu.addEventListener('mouseleave', function() {
            favoritesDropdownMenu.style.display = 'none';
        });
    }
}

function renderFavoritesDropdown() {
    const favoritesDropdownMenu = document.querySelector('.favorites-dropdown-menu');
    if (!favoritesDropdownMenu) return;
    
    favoritesDropdownMenu.innerHTML = '';
    
    favoritesData.forEach((favorite, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorites-dropdown-item';
        favoriteItem.dataset.index = index;
        favoriteItem.dataset.url = favorite.url;
        
        favoriteItem.innerHTML = `
            <i class="fas fa-star"></i> ${favorite.name || '未命名'}
            <span class="favorite-actions">
                <button class="favorite-view-btn" data-index="${index}" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="favorite-delete-btn" data-index="${index}" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        `;
        
        favoritesDropdownMenu.appendChild(favoriteItem);
        
        favoriteItem.addEventListener('click', function(e) {
            if (!e.target.closest('.favorite-actions')) {
                window.open(favorite.url, '_blank');
            }
        });
        
        const viewBtn = favoriteItem.querySelector('.favorite-view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showFavoriteDetails(favorite, index);
            });
        }
        
        const deleteBtn = favoriteItem.querySelector('.favorite-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteFavorite(index);
            });
        }
    });
    
    const addFavoriteBtn = document.createElement('div');
    addFavoriteBtn.className = 'favorites-dropdown-item';
    addFavoriteBtn.id = 'add-favorite-btn';
    addFavoriteBtn.innerHTML = `
        <i class="fas fa-plus"></i> 
    `;
    
    favoritesDropdownMenu.appendChild(addFavoriteBtn);
    
    addFavoriteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showAddFavoriteModal();
    });
}

function showFavoriteDetails(favorite, index) {
    if (!noteModalTitle || !noteInfo || !noteModal) return;
    
    noteModalTitle.textContent = favorite.name || '收藏详情';
    
    let html = `<p><strong>链接：</strong><a href="${favorite.url || '#'}" target="_blank">${favorite.url || '#'}</a></p>`;
    
    if (favorite.note && favorite.note.trim() !== '') {
        const noteWithBreaks = favorite.note.replace(/\n/g, '<br>');
        html += `<p><strong>备注：</strong><br>${noteWithBreaks}</p>`;
    } else {
        html += `<p>暂无备注信息。</p>`;
    }
    
    html += `<div style="text-align: center; margin-top: 20px;">
        <button class="manage-btn" id="edit-favorite-from-modal" style="width: 150px;" data-index="${index}">
            <i class="fas fa-edit"></i> 编辑
        </button>
    </div>`;
    
    noteInfo.innerHTML = html;
    noteModal.classList.add('show');
    
    const editBtn = document.getElementById('edit-favorite-from-modal');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const editIndex = this.getAttribute('data-index');
            if (noteModal) noteModal.classList.remove('show');
            editFavorite(parseInt(editIndex));
        });
    }
}

function editFavorite(index) {
    if (index < 0 || index >= favoritesData.length) return;
    
    const favorite = favoritesData[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = 'edit-favorite-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" id="close-edit-favorite-modal">&times;</button>
            <h2 class="modal-title">编辑收藏</h2>
            <div class="modal-text">
                请编辑收藏信息：
            </div>
            <input type="text" class="password-input" id="edit-favorite-name-input" placeholder="收藏名称" value="${favorite.name || ''}">
            <input type="text" class="password-input" id="edit-favorite-url-input" placeholder="收藏链接" value="${favorite.url || ''}">
            <input type="text" class="password-input" id="edit-favorite-note-input" placeholder="备注（可选）" value="${favorite.note || ''}">
            <div style="text-align: center; margin-top: 20px;">
                <button class="manage-btn" id="save-edit-favorite-btn" style="width: 150px;">
                    <i class="fas fa-check"></i> 保存
                </button>
                <button class="recycle-btn" id="cancel-edit-favorite-btn" style="width: 150px; margin-left: 10px;">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
            <div id="edit-favorite-error" style="color: #e60012; margin-top: 10px; text-align: center; display: none;">
                收藏名称和链接不能为空！
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('close-edit-favorite-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    const cancelBtn = document.getElementById('cancel-edit-favorite-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    const saveBtn = document.getElementById('save-edit-favorite-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('edit-favorite-name-input');
            const urlInput = document.getElementById('edit-favorite-url-input');
            const noteInput = document.getElementById('edit-favorite-note-input');
            const errorDiv = document.getElementById('edit-favorite-error');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const url = urlInput ? urlInput.value.trim() : '';
            const note = noteInput ? noteInput.value.trim() : '';
            
            if (!name || !url) {
                if (errorDiv) errorDiv.style.display = 'block';
                return;
            }
            
            favoritesData[index] = {
                id: favorite.id,
                name: name,
                url: url,
                note: note
            };
            
            saveFavoritesData();
            renderFavoritesDropdown();
            modal.remove();
            alert('收藏修改成功！');
        });
    }
}

function deleteFavorite(index) {
    if (index >= 0 && index < favoritesData.length) {
        if (confirm('确定要删除这个收藏吗？')) {
            favoritesData.splice(index, 1);
            saveFavoritesData();
            renderFavoritesDropdown();
            alert('删除成功！');
        }
    }
}

function showAddFavoriteModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = 'add-favorite-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" id="close-add-favorite-modal">&times;</button>
            <h2 class="modal-title">添加收藏</h2>
            <div class="modal-text">
                请输入收藏信息：
            </div>
            <input type="text" class="password-input" id="favorite-name-input" placeholder="收藏名称">
            <input type="text" class="password-input" id="favorite-url-input" placeholder="收藏链接">
            <input type="text" class="password-input" id="favorite-note-input" placeholder="备注（可选）">
            <div style="text-align: center; margin-top: 20px;">
                <button class="manage-btn" id="save-favorite-btn" style="width: 150px;">
                    <i class="fas fa-check"></i> 保存
                </button>
                <button class="recycle-btn" id="cancel-favorite-btn" style="width: 150px; margin-left: 10px;">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
            <div id="favorite-error" style="color: #e60012; margin-top: 10px; text-align: center; display: none;">
                收藏名称和链接不能为空！
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('close-add-favorite-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    const cancelBtn = document.getElementById('cancel-favorite-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    const saveBtn = document.getElementById('save-favorite-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('favorite-name-input');
            const urlInput = document.getElementById('favorite-url-input');
            const noteInput = document.getElementById('favorite-note-input');
            const errorDiv = document.getElementById('favorite-error');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const url = urlInput ? urlInput.value.trim() : '';
            const note = noteInput ? noteInput.value.trim() : '';
            
            if (!name || !url) {
                if (errorDiv) errorDiv.style.display = 'block';
                return;
            }
            
            const newId = favoritesData.length > 0 ? 
                Math.max(...favoritesData.map(item => item.id)) + 1 : 1;
            
            favoritesData.push({
                id: newId,
                name: name,
                url: url,
                note: note
            });
            
            saveFavoritesData();
            renderFavoritesDropdown();
            modal.remove();
            alert('收藏添加成功！');
        });
    }
}

// ==================== 初始化所有功能 ====================
function initializeNewFeatures() {
    updateColumnTitles();
    renderGdColumns();
    initBookshelf();
    initEmail();
    initFavorites();
    
    if (typeof updateSpeedButton === 'function') {
        updateSpeedButton();
    }
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeNewFeatures();
});