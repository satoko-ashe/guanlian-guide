// ==================== 统一标签数据管理 ====================
// 包含：常用工具栏、辞海、收藏、历史记录、记事本、邮箱、书架
// 所有数据都是固定的，可被所有页面共享

const BOOKMARK_DATA = {
    // 1. 常用工具栏数据
    gdData: {
        entertainment: [
            { name: '毒舌电影', url: 'https://www.duse0.com:51111/', note: '' },
            { name: 'B站', url: 'https://www.bilibili.com/', note: '' },
            { name: '爱奇艺', url: 'https://www.iqiyi.com/', note: '' },
            { name: '腾讯视频', url: 'https://v.qq.com/', note: '' },
            { name: '优酷', url: 'https://www.youku.com/', note: '' },
            { name: '抖音', url: 'https://www.douyin.com/', note: '' },
            { name: '知乎', url: 'https://www.zhihu.com/', note: '' },
            { name: '新浪微博', url: 'https://weibo.com/', note: '' }
        ],
        tools: [
            { name: '易我人声分离', url: 'https://www.aifuse.cn/', note: '' },
            { name: 'B站视频解析下载', url: 'https://snapany.com/zh/bilibili', note: '' },
            { name: '酷家乐室内设计', url: 'https://www.kujiale.cn/signin?redir=%2F%2Fwww.kujiale.cn%2Fpcenter%3Ffrom%3Dhome_login_redirect', note: '' },
            { name: '问卷星', url: 'https://www.wjx.cn/login.aspx?returnurl=%2fwjx%2factivitystat%2fviewstatsummary.aspx%3factivity%3d272491760', note: '' },
            { name: '在线PS', url: 'https://www.uupoop.com/', note: '' },
            { name: 'PDF转换器', url: 'https://smallpdf.com/cn', note: '' },
            { name: 'TXT按章节分割器', url: 'https://www.shuidi365.cn/tools/txtChapterSplit/', note: '' },
            { name: '免费MP3-midi转换器', url: 'https://audio-convert.com/mp3-converter', note: '' }
        ],
        cloud: [
            { name: '百度云盘', url: 'https://pan.baidu.com/', note: '账号: user123\n密码: pass123' },
            { name: '夸克网盘', url: 'https://pan.quark.cn/', note: '账号: user456\n密码: pass456' },
            { name: '迅雷', url: 'https://www.xunlei.com/', note: '账号: user789\n密码: pass789' },
            { name: '蓝奏云', url: 'https://www.lanzou.com/', note: '账号: user001\n密码: pass001' },
            { name: '123云盘', url: 'https://www.123pan.com/', note: '账号: user002\n密码: pass002' },
            { name: '阿里云盘', url: 'https://www.aliyundrive.com/', note: '账号: user003\n密码: pass003' },
            { name: 'bestfile免费存储盘', url: 'https://bestfile.io/en', note: '' }
        ],
        essential: [
            { name: 'github学习项目', url: 'https://github.com/TapXWorld/ChinaTextbook', note: '' },
            { name: 'GitHub', url: 'https://github.com/', note: '' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com/', note: '' },
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/', note: '' },
            { name: 'W3Schools', url: 'https://www.w3schools.com/', note: '' },
            { name: '菜鸟教程', url: 'https://www.runoob.com/', note: '' }
        ],
        office: [
            { name: '欢拓云直播', url: 'https://console2.talk-fun.com/#/login?pid=11308', note: '' },
            { name: '云朵课堂', url: 'https://manages.yunduoketang.com/login', note: '' },
            { name: '云朵CRM', url: 'https://i.yunduoketang.com/login/index', note: '' },
            { name: '石墨文档', url: 'https://shimo.im/', note: '' },
            { name: '改图宝修证件', url: 'https://www.gaitubao.com/', note: '' },
            { name: '在线免费修图', url: 'https://www.photopea.com/', note: '' }
        ],
        exam: [
            { name: '广东省教育考试院', url: 'https://eea.gd.gov.cn/', note: '' },
            { name: '教育部-日语能力测试报考', url: 'https://jlpt.neea.edu.cn/index.do', note: '' },
            { name: '考试酷-免费在线考试云系统', url: 'https://www.examcoo.com/', note: '' },
            { name: '国家中小学智慧教育平台', url: 'https://basic.smartedu.cn/', note: '' },
            { name: '教师之家-下载教案课件', url: 'https://www.renjiaoshe.com/', note: '' }
        ]
    },

    // 2. 区块名称
    columnTitles: {
        entertainment: '娱乐网站',
        tools: '便捷工具',
        cloud: '我的网盘',
        essential: '必备网站',
        office: '办公常用',
        exam: '考试专用'
    },

    // 3. 辞海数据（所有词典链接）
    dictionaryData: {
        english: 'https://corp.dict.cn/',
        japanese: 'https://dict.asia/',
        cantonese: 'https://shyyp.net/',
        chaozhou: 'http://www.laimn.cn/',
        hakka: 'https://www.syndict.com/index.htm',
        chinese: [
            'https://www.cidianwang.com/cd/',
            'https://www.zdic.net/',
            'https://zh.voicedic.com/'
        ],
        myDiy: [
            'https://satoko-ashe.github.io/chaozhouzidian.github.io/',
            'https://satoko-ashe.github.io/tree/',
            'https://satoko-ashe.github.io/chaozhou-audio-library/',
            'https://satoko-ashe.github.io/translator/',
            'https://satoko-ashe.github.io/suyuan/'
        ],
        foreign: [
            'https://fanyi.youdao.com/',
            'https://dict.hjenglish.com/',
            'https://www.iciba.com/',
            'https://www.collinsdictionary.com/zh/dictionary/chinese-english/',
            'https://www.frdic.com/',
            'https://dict.asia/jc/',
            'https://www.thai-language.com/',
            'https://zgdict.com/',
            'http://kr.qsbdc.com/krword2/wl.php?level=13',
            'https://www.dict.com/'
        ],
        other: [
            'http://xh.5156edu.com/',
            'https://so.gushiwen.cn/'
        ]
    },

    // 4. 收藏数据
    favoritesData: [
        {
            id: 1,
            name: '和Leo学泰语',
            url: 'https://space.bilibili.com/69226281/upload/video',
            note: 'B站泰语学习UP主'
        },
        {
            id: 2,
            name: '延世韩语教程',
            url: 'https://www.bilibili.com/video/BV1N24y1V7en/?spm_id_from=333.1007.tianma.1-2-2.click&vd_source=ffb832c40aa6a31f4a357fdf3142abb1',
            note: '延世韩语全套教程'
        }
    ],

    // 5. 历史记录数据
    historyData: {
        localDatabase: {
            name: '本地数据库',
            path: 'D:\\data数据库-历史记录',
            isLocal: true
        },
        onlineDatabase: {
            name: '在线数据库',
            url: 'https://pan.baidu.com/disk/main#/index?category=all',
            note: '百度网盘 - 默认在线数据库'
        }
    },

    // 6. 记事本数据
    notepadData: [
        { name: '备忘录', url: '#' },
        { name: 'WPS网页版', url: 'https://www.kdocs.cn/latest' },
        { name: 'WPS便签', url: 'https://note.wps.cn/' }
    ],

    // 7. 邮箱数据
    emailData: [
        {
            id: 1,
            name: 'QQ邮箱',
            url: 'https://mail.qq.com/cgi-bin/loginpage?t=loginpage&c=1',
            note: ''
        },
        {
            id: 2,
            name: '网易163邮箱',
            url: 'https://smart.mail.163.com/login.htm',
            note: ''
        }
    ],

    // 8. 书架数据
    bookshelfData: [
        { title: 'txt小说网', url: 'https://txtxiaoshuo.com/', note: '' },
        { title: '笔趣阁', url: 'http://zhtjx.com/', note: '' },
        { title: '新书包网', url: 'https://www.xbookbao.net/', note: '' },
        { title: '推荐书本更新中下载密码：2025', url: 'https://wwbpm.lanzoue.com/b00l2hbi1c', note: '下载密码：2025' },
        { title: '魔道祖师下载密码：2025', url: 'https://wwbpm.lanzoue.com/b00l2hafsf', note: '下载密码：2025' },
        { title: '考研单词下载密码：2025', url: 'https://wwbpm.lanzoue.com/b00l2hafre', note: '下载密码：2025' },
        { title: 'Z-library', url: 'https://zh.z2001.ru/', note: '' },
        { title: '麻省理工开放课程', url: 'https://ocw.mit.edu/', note: '' }
    ],

    // 9. 热点新闻数据（移除了默认值，将从 CouchDB 获取）
    // defaultHotNews 不再需要，因为从数据库读取
};

// ==================== 初始化函数 ====================
// 将所有数据写入 localStorage（如果不存在）
function initBookmarkData() {
    // 常用工具栏
    if (!localStorage.getItem('gdData')) {
        localStorage.setItem('gdData', JSON.stringify(BOOKMARK_DATA.gdData));
    }
    if (!localStorage.getItem('columnTitles')) {
        localStorage.setItem('columnTitles', JSON.stringify(BOOKMARK_DATA.columnTitles));
    }
    
    // 收藏
    if (!localStorage.getItem('favoritesData')) {
        localStorage.setItem('favoritesData', JSON.stringify(BOOKMARK_DATA.favoritesData));
    }
    
    // 邮箱
    if (!localStorage.getItem('emailData')) {
        localStorage.setItem('emailData', JSON.stringify(BOOKMARK_DATA.emailData));
    }
    
    // 书架
    if (!localStorage.getItem('bookshelfData')) {
        localStorage.setItem('bookshelfData', JSON.stringify(BOOKMARK_DATA.bookshelfData));
    }
    
    // 热点新闻（只保存用户导入的，不覆盖默认）
    // 注意：现在热点新闻存储在 CouchDB，本地不再存储 importedTexts
    // 但为了兼容旧代码，可保留一个空数组
    if (!localStorage.getItem('importedTexts')) {
        localStorage.setItem('importedTexts', JSON.stringify([]));
    }
}

// 页面加载时自动初始化
initBookmarkData();