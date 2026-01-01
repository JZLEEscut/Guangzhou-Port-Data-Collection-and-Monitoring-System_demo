// ==================== 全局变量 ====================
let charts = {}; // 存储所有图表实例
let threejsScene = null; // Three.js场景
let animationEnabled = true; // 动画开关
let updateInterval = null; // 更新定时器

// ==================== 初始化函数 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('广州港数据采集监控系统初始化...');
    
    // 初始化导航
    initNavigation();
    
    // 初始化实时监控模块
    initRealtimeModule();
    
    // 初始化数字孪生模块
    initDigitalTwinModule();
    
    // 初始化碳排放模块
    initCarbonModule();
    
    // 初始化应急指挥模块
    initEmergencyModule();
    
    // 启动实时数据更新
    startDataUpdate();
    
    console.log('系统初始化完成');
});

// ==================== 导航系统 ====================
/**
 * 初始化导航功能
 * 处理模块切换和活动状态管理
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const moduleId = this.dataset.module;
            switchModule(moduleId);
            
            // 更新导航活动状态
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * 切换显示的模块
 * @param {string} moduleId - 模块ID
 */
function switchModule(moduleId) {
    const modules = document.querySelectorAll('.module');
    modules.forEach(module => module.classList.remove('active'));
    
    const targetModule = document.getElementById(`${moduleId}-module`);
    if (targetModule) {
        targetModule.classList.add('active');
        
        // 如果切换到数字孪生模块，重新渲染3D场景
        if (moduleId === 'digital-twin' && threejsScene) {
            threejsScene.renderer.render(threejsScene.scene, threejsScene.camera);
        }
    }
}

// ==================== 数据模拟器 ====================
/**
 * 生成随机船舶数据
 * @returns {Array} 船舶数据数组
 */
function generateShipsData() {
    const shipTypes = ['集装箱船', '散货船', '油轮', '杂货船'];
    const berths = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
    const statuses = ['装货中', '卸货中', '待泊'];
    const ships = [];
    
    const shipCount = Math.floor(Math.random() * 3) + 6; // 6-8艘船
    
    for (let i = 0; i < shipCount; i++) {
        const arrivalTime = new Date();
        arrivalTime.setHours(arrivalTime.getHours() - Math.floor(Math.random() * 48));
        
        const departureTime = new Date();
        departureTime.setHours(departureTime.getHours() + Math.floor(Math.random() * 24) + 2);
        
        ships.push({
            name: `轮船${String.fromCharCode(65 + i)}号`,
            type: shipTypes[Math.floor(Math.random() * shipTypes.length)],
            berth: berths[i % berths.length],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            arrival: arrivalTime.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
            departure: departureTime.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
    }
    
    return ships;
}

/**
 * 生成模拟的实时数据
 * @returns {Object} 包含各种实时数据的对象
 */
function generateRealtimeData() {
    return {
        shipsCount: Math.floor(Math.random() * 3) + 6,
        throughput: Math.floor(Math.random() * 2000) + 18000,
        equipmentOnline: Math.floor(Math.random() * 5) + 93,
        efficiency: Math.floor(Math.random() * 10) + 28
    };
}

/**
 * 生成碳排放数据
 * @returns {Object} 碳排放相关数据
 */
function generateCarbonData() {
    const total = Math.floor(Math.random() * 500) + 7500;
    const target = 8500;
    
    return {
        total: total,
        remaining: Math.max(0, target - total),
        progress: Math.min(100, (total / target) * 100),
        reduction: Math.floor(Math.random() * 100) + 1200,
        neutral: Math.floor(Math.random() * 5) + 42
    };
}

/**
 * 生成应急告警数据
 * @returns {Array} 告警数据数组
 */
function generateAlertData() {
    const alerts = [
        { level: 'low', icon: 'ℹ️', title: '设备维护提醒', desc: 'A区3号吊机需要进行定期检修', time: '5分钟前' },
        { level: 'medium', icon: '⚠️', title: '天气预警', desc: '未来6小时可能有强风，建议加强防护', time: '15分钟前' },
        { level: 'low', icon: 'ℹ️', title: '人员调度', desc: 'B区装卸人员需要增援', time: '32分钟前' }
    ];
    
    // 随机返回2-3个告警
    const count = Math.floor(Math.random() * 2) + 2;
    return alerts.slice(0, count);
}

// ==================== 实时监控模块 ====================
/**
 * 初始化实时监控模块
 * 创建图表和表格
 */
function initRealtimeModule() {
    // 更新KPI数据
    updateRealtimeKPI();
    
    // 创建吞吐量趋势图表
    createThroughputChart();
    
    // 创建设备状态图表
    createEquipmentChart();
    
    // 更新船舶表格
    updateShipsTable();
    
    // 绑定过滤按钮事件
    const filterBtns = document.querySelectorAll('#realtime-module .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // 这里可以根据时间范围重新加载数据
            console.log('时间范围切换:', this.dataset.range);
        });
    });
}

/**
 * 更新实时监控KPI数据
 */
function updateRealtimeKPI() {
    const data = generateRealtimeData();
    
    // 使用动画更新数字
    animateValue('ships-count', parseInt(document.getElementById('ships-count').textContent) || 0, data.shipsCount, 500);
    animateValue('throughput-value', parseInt(document.getElementById('throughput-value').textContent) || 0, data.throughput, 500);
    animateValue('equipment-online', parseInt(document.getElementById('equipment-online').textContent) || 0, data.equipmentOnline, 500);
    animateValue('efficiency-value', parseInt(document.getElementById('efficiency-value').textContent) || 0, data.efficiency, 500);
}

/**
 * 数字动画函数
 * @param {string} id - 元素ID
 * @param {number} start - 起始值
 * @param {number} end - 结束值
 * @param {number} duration - 动画时长(毫秒)
 */
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

/**
 * 创建吞吐量趋势图表
 */
function createThroughputChart() {
    const ctx = document.getElementById('throughput-chart');
    if (!ctx) return;
    
    // 生成最近24小时的数据
    const labels = [];
    const data = [];
    for (let i = 23; i >= 0; i--) {
        labels.push(`${i}:00`);
        data.push(Math.floor(Math.random() * 500) + 700);
    }
    
    charts.throughput = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '吞吐量 (TEU)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(26, 31, 58, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        maxTicksLimit: 12
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        callback: function(value) {
                            return value + ' TEU';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 创建设备运行状态图表
 */
function createEquipmentChart() {
    const ctx = document.getElementById('equipment-chart');
    if (!ctx) return;
    
    charts.equipment = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['吊机', '牵引车', '堆高机', '龙门吊', '岸桥', '场桥'],
            datasets: [{
                label: '运行中',
                data: [18, 25, 12, 8, 6, 10],
                backgroundColor: 'rgba(67, 233, 123, 0.8)',
                borderRadius: 8
            }, {
                label: '空闲',
                data: [4, 8, 3, 2, 2, 4],
                backgroundColor: 'rgba(79, 172, 254, 0.8)',
                borderRadius: 8
            }, {
                label: '维修',
                data: [2, 2, 1, 0, 0, 1],
                backgroundColor: 'rgba(250, 202, 87, 0.8)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#a0aec0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#718096'
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096'
                    }
                }
            }
        }
    });
}

/**
 * 更新船舶动态表格
 */
function updateShipsTable() {
    const tbody = document.getElementById('ships-table-body');
    if (!tbody) return;
    
    const ships = generateShipsData();
    tbody.innerHTML = '';
    
    ships.forEach(ship => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${ship.name}</td>
            <td>${ship.type}</td>
            <td>${ship.berth}</td>
            <td><span class="status-badge ${ship.status === '装货中' ? 'loading' : ship.status === '卸货中' ? 'unloading' : 'waiting'}">${ship.status}</span></td>
            <td>${ship.arrival}</td>
            <td>${ship.departure}</td>
        `;
    });
}

// ==================== 数字孪生模块 ====================
/**
 * 初始化数字孪生3D可视化模块
 * 使用Three.js创建港口3D场景
 */
function initDigitalTwinModule() {
    const container = document.getElementById('twin-canvas');
    if (!container) return;
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 50, 200);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(30, 25, 30);
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // 添加光源（增强亮度以提高可见性）
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    
    // 创建地面
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1f3a,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // 创建码头
    createDock(scene);
    
    // 创建起重机
    createCranes(scene);
    
    // 创建集装箱
    createContainers(scene);
    
    // 创建网格辅助线
    const gridHelper = new THREE.GridHelper(100, 50, 0x667eea, 0x252b48);
    scene.add(gridHelper);
    
    // 保存场景信息
    threejsScene = { scene, camera, renderer, container };
    
    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        
        if (animationEnabled) {
            // 旋转相机
            camera.position.x = Math.cos(Date.now() * 0.0001) * 40;
            camera.position.z = Math.sin(Date.now() * 0.0001) * 40;
            camera.lookAt(0, 0, 0);
        }
        
        renderer.render(scene, camera);
    }
    animate();
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        if (container.clientWidth > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
    
    // 绑定控制按钮
    document.getElementById('reset-camera').addEventListener('click', () => {
        camera.position.set(30, 25, 30);
        camera.lookAt(0, 0, 0);
    });
    
    document.getElementById('toggle-animation').addEventListener('click', function() {
        animationEnabled = !animationEnabled;
        this.textContent = animationEnabled ? '动画开/关' : '动画已关';
    });
    
    // 更新设备列表
    updateEquipmentList();
}

/**
 * 创建码头结构
 * @param {THREE.Scene} scene - Three.js场景
 */
function createDock(scene) {
    const dockGeometry = new THREE.BoxGeometry(60, 1, 20);
    const dockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x252b48,
        roughness: 0.7
    });
    const dock = new THREE.Mesh(dockGeometry, dockMaterial);
    dock.position.set(0, 0.5, -15);
    dock.castShadow = true;
    dock.receiveShadow = true;
    scene.add(dock);
}

/**
 * 创建起重机模型
 * @param {THREE.Scene} scene - Three.js场景
 */
function createCranes(scene) {
    const positions = [
        [-20, 0, -15],
        [-10, 0, -15],
        [0, 0, -15],
        [10, 0, -15],
        [20, 0, -15]
    ];
    
    positions.forEach(pos => {
        // 起重机底座
        const baseGeometry = new THREE.BoxGeometry(3, 1, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x667eea });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(pos[0], 0.5, pos[2]);
        base.castShadow = true;
        scene.add(base);
        
        // 起重机立柱
        const poleGeometry = new THREE.BoxGeometry(0.8, 15, 0.8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x764ba2 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(pos[0], 8, pos[2]);
        pole.castShadow = true;
        scene.add(pole);
        
        // 起重机横梁
        const beamGeometry = new THREE.BoxGeometry(12, 0.6, 0.6);
        const beamMaterial = new THREE.MeshStandardMaterial({ color: 0xf093fb });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(pos[0], 15, pos[2]);
        beam.castShadow = true;
        scene.add(beam);
    });
}

/**
 * 创建集装箱模型
 * @param {THREE.Scene} scene - Three.js场景
 */
function createContainers(scene) {
    const colors = [0x43e97b, 0xf5576c, 0x4facfe, 0xfeca57, 0x667eea];
    
    // 创建多个集装箱堆
    for (let x = -25; x <= 25; x += 8) {
        for (let z = 5; z <= 15; z += 8) {
            const height = Math.floor(Math.random() * 3) + 1;
            
            for (let y = 0; y < height; y++) {
                const containerGeometry = new THREE.BoxGeometry(6, 2.5, 2.5);
                const containerMaterial = new THREE.MeshStandardMaterial({ 
                    color: colors[Math.floor(Math.random() * colors.length)],
                    roughness: 0.6,
                    metalness: 0.3
                });
                const container = new THREE.Mesh(containerGeometry, containerMaterial);
                container.position.set(x, 1.25 + y * 2.5, z);
                container.castShadow = true;
                container.receiveShadow = true;
                scene.add(container);
            }
        }
    }
}

/**
 * 更新设备列表
 */
function updateEquipmentList() {
    const list = document.getElementById('equipment-list');
    if (!list) return;
    
    const equipments = [
        { name: '1号龙门吊', status: 'online' },
        { name: '2号龙门吊', status: 'online' },
        { name: '3号龙门吊', status: 'online' },
        { name: '1号岸桥', status: 'online' },
        { name: '2号岸桥', status: 'online' },
        { name: '3号岸桥', status: 'offline' },
        { name: '1号场桥', status: 'online' },
        { name: '2号场桥', status: 'online' }
    ];
    
    list.innerHTML = equipments.map(eq => `
        <div class="equipment-item">
            <span>${eq.name}</span>
            <span class="equipment-status ${eq.status}"></span>
        </div>
    `).join('');
}

// ==================== 碳排放模块 ====================
/**
 * 初始化碳排放管理模块
 */
function initCarbonModule() {
    // 更新碳排放数据
    updateCarbonData();
    
    // 创建排放源分布图表
    createCarbonSourceChart();
    
    // 创建历史趋势图表
    createCarbonTrendChart();
    
    // 绑定周期切换按钮
    const periodBtns = document.querySelectorAll('#carbon-module .filter-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            console.log('统计周期切换:', this.dataset.period);
        });
    });
}

/**
 * 更新碳排放数据
 */
function updateCarbonData() {
    const data = generateCarbonData();
    
    animateValue('total-carbon', parseInt(document.getElementById('total-carbon').textContent) || 0, data.total, 500);
    animateValue('carbon-remaining', parseInt(document.getElementById('carbon-remaining').textContent) || 0, data.remaining, 500);
    animateValue('carbon-reduction', parseInt(document.getElementById('carbon-reduction').textContent) || 0, data.reduction, 500);
    animateValue('carbon-neutral', parseInt(document.getElementById('carbon-neutral').textContent) || 0, data.neutral, 500);
    
    // 更新进度条
    document.getElementById('carbon-progress').style.width = data.progress + '%';
}

/**
 * 创建碳排放源分布图表
 */
function createCarbonSourceChart() {
    const ctx = document.getElementById('carbon-source-chart');
    if (!ctx) return;
    
    charts.carbonSource = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['装卸设备', '运输车辆', '照明用电', '办公设施', '其他'],
            datasets: [{
                data: [35, 28, 18, 12, 7],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(250, 202, 87, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0aec0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 创建碳排放历史趋势图表
 */
function createCarbonTrendChart() {
    const ctx = document.getElementById('carbon-trend-chart');
    if (!ctx) return;
    
    const labels = [];
    const data = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit' }));
        data.push(Math.floor(Math.random() * 1000) + 7000);
    }
    
    charts.carbonTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '碳排放量 (吨CO₂)',
                data: data,
                borderColor: '#43e97b',
                backgroundColor: 'rgba(67, 233, 123, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#43e97b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        callback: function(value) {
                            return value + ' 吨';
                        }
                    }
                }
            }
        }
    });
}

// ==================== 应急指挥模块 ====================
/**
 * 初始化应急指挥模块
 */
function initEmergencyModule() {
    // 更新告警列表
    updateAlertList();
    
    // 绑定预案按钮事件
    const planBtns = document.querySelectorAll('.plan-btn');
    planBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const planName = this.parentElement.querySelector('h4').textContent;
            alert(`查看预案: ${planName}\n（这是演示功能）`);
        });
    });
}

/**
 * 更新应急告警列表
 */
function updateAlertList() {
    const list = document.getElementById('alert-list');
    if (!list) return;
    
    const alerts = generateAlertData();
    
    list.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.level}">
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.desc}</p>
            </div>
            <div class="alert-time">${alert.time}</div>
        </div>
    `).join('');
}

/**
 * 创建应急能力评估雷达图
 */
function createEmergencyRadarChart() {
    const ctx = document.getElementById('emergency-radar-chart');
    if (!ctx) return;
    
    charts.emergencyRadar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['人员响应', '设备准备', '物资储备', '通讯保障', '协调能力', '恢复能力'],
            datasets: [{
                label: '当前能力',
                data: [92, 88, 85, 95, 90, 87],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#667eea'
            }, {
                label: '目标能力',
                data: [95, 95, 90, 98, 95, 90],
                borderColor: '#43e97b',
                backgroundColor: 'rgba(67, 233, 123, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: '#43e97b',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#43e97b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0aec0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: '#a0aec0',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        color: '#718096',
                        backdropColor: 'transparent'
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

// ==================== 实时数据更新系统 ====================
/**
 * 启动实时数据更新
 * 每3秒更新一次所有数据
 */
function startDataUpdate() {
    // 清除现有定时器
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // 设置新的定时器，每3秒更新一次
    updateInterval = setInterval(() => {
        console.log('更新实时数据...');
        
        // 更新实时监控数据
        updateRealtimeKPI();
        updateShipsTable();
        
        // 更新吞吐量图表
        if (charts.throughput) {
            const newValue = Math.floor(Math.random() * 500) + 700;
            charts.throughput.data.datasets[0].data.shift();
            charts.throughput.data.datasets[0].data.push(newValue);
            charts.throughput.update('none'); // 不使用动画更新
        }
        
        // 更新碳排放数据
        updateCarbonData();
        
        // 更新告警列表
        updateAlertList();
        
    }, 3000); // 3秒更新间隔
    
    console.log('实时数据更新已启动，每3秒更新一次');
}

// ==================== 工具函数 ====================
/**
 * 格式化数字，添加千分位分隔符
 * @param {number} num - 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 获取当前时间字符串
 * @returns {string} 格式化的时间字符串
 */
function getCurrentTime() {
    return new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

console.log('广州港数据采集监控系统脚本加载完成');
