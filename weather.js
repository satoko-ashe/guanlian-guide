// ==================== 天气功能模块 ====================
// 独立文件，方便后续维护和引用
// 使用说明：在 HTML 中通过 <script src="weather.js"></script> 引入

const WEATHER_CONFIG = {
    IS_MOCK: true,                    // true: 使用模拟数据（测试用），false: 调用真实API
    API_KEY: '062e1163678f447fbdb508519f206378',  // 和风天气API密钥
    DEFAULT_CITY: '广州',
    DEFAULT_CITY_ID: '101280101'
};

// 城市ID映射表（常用城市）
const CITY_ID_MAP = {
    '北京': '101010100', '上海': '101020100', '广州': '101280101', '深圳': '101280601',
    '杭州': '101210101', '南京': '101190101', '武汉': '101200101', '成都': '101270101',
    '重庆': '101040100', '西安': '101110101', '长沙': '101250101', '厦门': '101230201',
    '青岛': '101120201', '大连': '101070201', '苏州': '101190401', '天津': '101030100'
};

// 天气图标映射
const WEATHER_ICON_MAP = {
    '100': '☀️', '101': '🌤️', '102': '⛅', '103': '☁️', '104': '☁️',
    '150': '🌙', '151': '☁️', '152': '☁️', '153': '☁️',
    '300': '🌦️', '301': '🌦️', '302': '⛈️', '303': '⛈️', '304': '🌨️',
    '305': '🌧️', '306': '🌧️', '307': '🌧️', '308': '🌧️', '309': '🌧️',
    '310': '🌧️', '311': '🌧️', '312': '🌧️', '313': '🌧️',
    '400': '❄️', '401': '❄️', '402': '❄️', '403': '❄️',
    '404': '🌨️', '405': '🌨️', '406': '🌨️', '407': '🌨️',
    '500': '🌫️', '501': '🌫️', '502': '🌫️', '503': '🌫️', '504': '🌫️',
    '507': '🌫️', '508': '🌫️', '900': '🌡️', '901': '🥶', '999': '❓'
};

// 天气配置（存储在localStorage）
let weatherConfig = JSON.parse(localStorage.getItem('weatherConfig')) || {
    cityId: WEATHER_CONFIG.DEFAULT_CITY_ID,
    cityName: WEATHER_CONFIG.DEFAULT_CITY,
    autoLocation: true,
    lastUpdate: null
};

/**
 * 更新天气（主入口）
 * IS_MOCK = true 时使用模拟数据
 * IS_MOCK = false 时调用真实API
 */
async function updateWeather() {
    if (WEATHER_CONFIG.IS_MOCK) {
        // 测试模式：使用模拟数据
        const mockData = getMockWeatherData();
        updateWeatherUI(mockData);
        console.log('【天气】使用模拟数据', mockData);
        return;
    }

    // 正式模式：调用真实API
    try {
        if (weatherConfig.autoLocation && navigator.geolocation) {
            await getLocationAndUpdateWeather();
        } else {
            await updateWeatherByCityId(weatherConfig.cityId, weatherConfig.cityName);
        }
    } catch (error) {
        console.error('获取天气数据失败，使用模拟数据:', error);
        const mockData = getMockWeatherData();
        updateWeatherUI(mockData);
    }
}

/**
 * 生成模拟天气数据（基于当前月份和时间）
 */
function getMockWeatherData() {
    const month = new Date().getMonth() + 1;
    const hour = new Date().getHours();

    // 根据季节设置基础温度和图标
    let icon = '☀️';
    let baseTemp = 28;
    let description = '晴朗';

    if (month >= 3 && month <= 5) { // 春季
        icon = '🌦️';
        baseTemp = 22;
        description = '春季多雨';
    } else if (month >= 6 && month <= 8) { // 夏季
        icon = '☀️';
        baseTemp = 32;
        description = '炎热';
    } else if (month >= 9 && month <= 11) { // 秋季
        icon = '⛅';
        baseTemp = 26;
        description = '凉爽';
    } else { // 冬季
        icon = '☁️';
        baseTemp = 18;
        description = '寒冷';
    }

    // 根据时间微调温度
    if (hour >= 12 && hour < 15) {
        baseTemp += 2; // 中午最热
    } else if (hour >= 0 && hour < 6) {
        baseTemp -= 3; // 凌晨最冷
    }

    return {
        city: weatherConfig.cityName,
        temperature: baseTemp,
        description: description,
        icon: icon,
        humidity: 65,
        feelsLike: baseTemp + 2,
        windSpeed: 3,
        windDir: '东南风',
        windScale: '1级',
        pressure: 1013,
        visibility: 10,
        updateTime: new Date().toLocaleTimeString()
    };
}

/**
 * 通过定位获取城市并更新天气（正式API）
 */
async function getLocationAndUpdateWeather() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('浏览器不支持地理定位'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const cityInfo = await getCityByLocation(latitude, longitude);
                    if (cityInfo && cityInfo.id) {
                        weatherConfig.cityId = cityInfo.id;
                        weatherConfig.cityName = cityInfo.name;
                        weatherConfig.autoLocation = true;
                        saveWeatherConfig();
                        await updateWeatherByCityId(cityInfo.id, cityInfo.name);
                        resolve();
                    } else {
                        await updateWeatherByCityId(WEATHER_CONFIG.DEFAULT_CITY_ID, WEATHER_CONFIG.DEFAULT_CITY);
                        resolve();
                    }
                } catch (error) {
                    await updateWeatherByCityId(WEATHER_CONFIG.DEFAULT_CITY_ID, WEATHER_CONFIG.DEFAULT_CITY);
                    resolve();
                }
            },
            (error) => {
                updateWeatherByCityId(weatherConfig.cityId, weatherConfig.cityName)
                    .then(resolve)
                    .catch(reject);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
        );
    });
}

/**
 * 通过经纬度获取城市信息（正式API）
 */
async function getCityByLocation(latitude, longitude) {
    try {
        const response = await fetch(
            `https://geoapi.qweather.com/v2/city/lookup?location=${longitude},${latitude}&key=${WEATHER_CONFIG.API_KEY}`
        );
        if (!response.ok) throw new Error('城市查询失败');
        const data = await response.json();
        if (data.code === '200' && data.location && data.location.length > 0) {
            const location = data.location[0];
            return { id: location.id, name: location.name };
        }
        return null;
    } catch (error) {
        console.error('获取城市信息失败:', error);
        return null;
    }
}

/**
 * 通过城市ID更新天气（正式API）
 */
async function updateWeatherByCityId(cityId, cityName) {
    try {
        const response = await fetch(
            `https://devapi.qweather.com/v7/weather/now?location=${cityId}&key=${WEATHER_CONFIG.API_KEY}&lang=zh`
        );
        if (!response.ok) throw new Error('天气API请求失败');
        const data = await response.json();

        if (data.code === '200') {
            const weatherData = {
                city: cityName,
                temperature: Math.round(data.now.temp),
                description: data.now.text,
                icon: getWeatherIcon(data.now.icon),
                humidity: data.now.humidity,
                feelsLike: Math.round(data.now.feelsLike || data.now.temp),
                windSpeed: data.now.windSpeed,
                windDir: data.now.windDir,
                windScale: data.now.windScale,
                pressure: data.now.pressure,
                visibility: data.now.vis,
                updateTime: new Date().toLocaleTimeString()
            };
            weatherConfig.lastUpdate = new Date().toISOString();
            saveWeatherConfig();
            updateWeatherUI(weatherData);
            return weatherData;
        } else {
            throw new Error('API返回错误');
        }
    } catch (error) {
        throw error;
    }
}

/**
 * 获取天气图标
 */
function getWeatherIcon(iconCode) {
    return WEATHER_ICON_MAP[iconCode] || '☀️';
}

/**
 * 保存天气配置
 */
function saveWeatherConfig() {
    localStorage.setItem('weatherConfig', JSON.stringify(weatherConfig));
}

/**
 * 更新天气UI
 */
function updateWeatherUI(weatherData) {
    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');

    if (weatherIcon && temperature) {
        weatherIcon.textContent = weatherData.icon;
        temperature.textContent = `${weatherData.city} ${weatherData.temperature}°C`;
        temperature.title = 
            `${weatherData.description}\n` +
            `体感温度: ${weatherData.feelsLike}°C\n` +
            `湿度: ${weatherData.humidity}%\n` +
            `风速: ${weatherData.windSpeed} km/h\n` +
            `风向: ${weatherData.windDir}\n` +
            `气压: ${weatherData.pressure} hPa\n` +
            `能见度: ${weatherData.visibility} km\n` +
            `更新时间: ${weatherData.updateTime}`;
    }
}

/**
 * 初始化天气（页面加载时调用）
 */
function initWeather() {
    const savedConfig = localStorage.getItem('weatherConfig');
    if (savedConfig) {
        weatherConfig = JSON.parse(savedConfig);
    }

    // 立即更新一次
    updateWeather();

    // 每小时更新一次
    setInterval(updateWeather, 3600000);
}

// 天气信息点击切换城市（预留接口）
function showCitySwitchModal() {
    // 可扩展为城市选择弹窗
    alert('城市切换功能开发中，当前城市：' + weatherConfig.cityName);
}