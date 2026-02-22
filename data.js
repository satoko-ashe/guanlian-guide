// ==================== 非标签类数据 ====================
// 播放器状态（需要运行时维护）
let playerState = {
    isPlaying: true,
    currentSpeed: 1.0,
    speedCycle: [1.0, 1.5, 2.0, 0.5],
    speedIndex: 0,
    currentTextIndex: 0,
    currentPosition: 0
    // importedTexts 已移除，将从 CouchDB 获取
};

// ==================== 导出/导入函数 ====================
function exportAllData() {
    const allData = {
        gdData: JSON.parse(localStorage.getItem('gdData')),
        columnTitles: JSON.parse(localStorage.getItem('columnTitles')),
        favoritesData: JSON.parse(localStorage.getItem('favoritesData')),
        emailData: JSON.parse(localStorage.getItem('emailData')),
        // importedTexts 不再导出，但保留字段为空
        importedTexts: [],
        bookshelfData: JSON.parse(localStorage.getItem('bookshelfData')),
        exportTime: new Date().toISOString(),
        version: '1.0.0'
    };
    return allData;
}

function importAllData(importedData) {
    if (!importedData) return false;
    try {
        // 导入逻辑保持不变...
        return true;
    } catch (error) {
        console.error('导入数据时出错:', error);
        return false;
    }
}