// 兼容Web和Electron版本
const ipcRenderer = window.ipcRenderer || (typeof require !== 'undefined' ? require('electron').ipcRenderer : null);

// 全局变量
let roomCounter = 3; // 房间计数器，从D开始
let personCounter = 3; // 人员计数器，从人员4开始
let currentRooms = ['A', 'B', 'C']; // 当前房间列表
let currentPeople = []; // 当前人员列表

// DOM元素
const totalRentInput = document.getElementById('totalRent');
const peopleContainer = document.getElementById('peopleContainer');
const addPersonBtn = document.getElementById('addPersonBtn');
const roomsContainer = document.getElementById('roomsContainer');
const addRoomBtn = document.getElementById('addRoomBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resultsSection = document.getElementById('resultsSection');
const allocationResult = document.getElementById('allocationResult');
const rentsResult = document.getElementById('rentsResult');
const summaryResult = document.getElementById('summaryResult');

// 设置默认值
totalRentInput.value = '300';

// 初始化应用
function initializeApp() {
    // 初始化人员列表
    initializePeople();
    
    // 初始化房间
    initializeRooms();
    
    // 设置默认出价
    setDefaultBids();
    
    // 绑定事件
    bindEvents();
    
    // 更新删除按钮显示状态
    updateRemoveButtons();
}

// 初始化人员
function initializePeople() {
    currentPeople = [
        window.i18n ? window.i18n.t('default_person_1') : '人员1',
        window.i18n ? window.i18n.t('default_person_2') : '人员2',
        window.i18n ? window.i18n.t('default_person_3') : '人员3'
    ];
    updatePeopleDisplay();
}

// 初始化房间
function initializeRooms() {
    currentRooms = ['A', 'B', 'C'];
    updateRoomsDisplay();
}

// 更新人员显示
function updatePeopleDisplay() {
    // 清空容器
    peopleContainer.innerHTML = '';
    
    // 为每个人员创建输入框
    currentPeople.forEach((person, index) => {
        const personDiv = document.createElement('div');
        personDiv.className = 'person-input';
        personDiv.innerHTML = `
            <input type="text" class="person-name" placeholder="${window.i18n ? window.i18n.t('person_input_placeholder') : '例如: 人员'}${index + 1}" value="${person}">
            <button type="button" class="remove-person-btn" onclick="removePerson(this)" ${currentPeople.length <= 1 ? 'style="display: none;"' : ''}>×</button>
        `;
        peopleContainer.appendChild(personDiv);
    });
    
    // 更新房间的出价输入框
    updateRoomBids();
}

// 更新房间显示
function updateRoomsDisplay() {
    // 清空容器
    roomsContainer.innerHTML = '';
    
    // 为每个房间创建卡片
    currentRooms.forEach((room, index) => {
        const roomDiv = document.createElement('div');
        roomDiv.className = 'room-card';
        roomDiv.setAttribute('data-room-id', room);
        roomDiv.innerHTML = `
            <div class="room-header">
                <h3>${window.i18n ? window.i18n.t('default_room_prefix') : '房间'}${room}</h3>
                <button type="button" class="remove-room-btn" onclick="removeRoom(this)" ${currentRooms.length <= 1 ? 'style="display: none;"' : ''}>×</button>
            </div>
            <div class="bid-inputs" id="room${room}-bids">
                <!-- 动态生成出价输入框 -->
            </div>
        `;
        roomsContainer.appendChild(roomDiv);
    });
    
    // 更新出价输入框
    updateRoomBids();
}

// 更新房间出价输入框
function updateRoomBids() {
    currentRooms.forEach(room => {
        const bidsContainer = document.getElementById(`room${room}-bids`);
        if (bidsContainer) {
            bidsContainer.innerHTML = '';
            
            currentPeople.forEach(person => {
                const bidDiv = document.createElement('div');
                bidDiv.className = 'bid-input';
                bidDiv.innerHTML = `
                    <label for="room${room}-${person}">${person}${window.i18n.t('bid_label')}</label>
                    <input type="number" id="room${room}-${person}" placeholder="0" min="0" step="10">
                `;
                bidsContainer.appendChild(bidDiv);
            });
        }
    });
}

// 设置默认出价
function setDefaultBids() {
    // 等待DOM更新完成
    setTimeout(() => {
        currentRooms.forEach(room => {
            currentPeople.forEach((person, personIndex) => {
                const input = document.getElementById(`room${room}-${person}`);
                if (input) {
                    // 设置一些示例出价
                    const defaultBids = {
                        'A': [120, 100, 80],
                        'B': [100, 120, 90],
                        'C': [80, 80, 130]
                    };
                    
                    if (defaultBids[room] && defaultBids[room][personIndex]) {
                        input.value = defaultBids[room][personIndex];
                    } else {
                        input.value = Math.floor(Math.random() * 100) + 50; // 随机出价
                    }
                }
            });
        });
    }, 100);
}

// 绑定事件
function bindEvents() {
    addPersonBtn.addEventListener('click', addPerson);
    addRoomBtn.addEventListener('click', addRoom);
    calculateBtn.addEventListener('click', calculateAllocation);
    
    // 输入验证
    addInputValidation();
}

// 添加人员
function addPerson() {
    personCounter++;
    const personPrefix = window.i18n ? window.i18n.t('new_person_prefix') : '人员';
    const newPerson = `${personPrefix}${personCounter}`;
    currentPeople.push(newPerson);
    
    updatePeopleDisplay();
    updateRemoveButtons();
}

// 删除人员
function removePerson(button) {
    const personInput = button.parentElement;
    const personName = personInput.querySelector('.person-name').value;
    const index = currentPeople.indexOf(personName);
    
    if (index > -1) {
        currentPeople.splice(index, 1);
        updatePeopleDisplay();
        updateRemoveButtons();
    }
}

// 添加房间
function addRoom() {
    roomCounter++;
    const newRoom = String.fromCharCode(64 + roomCounter); // A=65, B=66, C=67, D=68...
    currentRooms.push(newRoom);
    
    updateRoomsDisplay();
    updateRemoveButtons();
}

// 删除房间
function removeRoom(button) {
    const roomCard = button.closest('.room-card');
    const roomId = roomCard.getAttribute('data-room-id');
    const index = currentRooms.indexOf(roomId);
    
    if (index > -1) {
        currentRooms.splice(index, 1);
        updateRoomsDisplay();
        updateRemoveButtons();
    }
}

// 更新删除按钮显示状态
function updateRemoveButtons() {
    // 更新人员删除按钮
    const personRemoveBtns = document.querySelectorAll('.remove-person-btn');
    personRemoveBtns.forEach((btn, index) => {
        btn.style.display = currentPeople.length <= 1 ? 'none' : 'flex';
    });
    
    // 更新房间删除按钮
    const roomRemoveBtns = document.querySelectorAll('.remove-room-btn');
    roomRemoveBtns.forEach((btn, index) => {
        btn.style.display = currentRooms.length <= 1 ? 'none' : 'flex';
    });
}

// 计算分配
async function calculateAllocation() {
    if (!validateInputs()) {
        alert(window.i18n.t('fill_required_info'));
        return;
    }
    
    calculateBtn.disabled = true;
    calculateBtn.textContent = window.i18n.t('calculating');
    
    try {
        const data = collectInputData();
        const result = await ipcRenderer.invoke('calculate-allocation', data);
        
        if (result.success) {
            displayResults(result.result);
            createChart(result.result);
        } else {
            alert(window.i18n.t('calculation_failed') + result.error);
        }
    } catch (error) {
        alert(window.i18n.t('error_occurred') + error.message);
    } finally {
        calculateBtn.disabled = false;
        calculateBtn.textContent = window.i18n.t('calculate');
    }
}

// 验证输入
function validateInputs() {
    if (!totalRentInput.value || totalRentInput.value <= 0) return false;
    if (currentPeople.length === 0) return false;
    if (currentRooms.length === 0) return false;
    
    // 检查每个房间至少有一个出价
    for (const room of currentRooms) {
        let hasBid = false;
        for (const person of currentPeople) {
            const input = document.getElementById(`room${room}-${person}`);
            if (input && input.value && parseFloat(input.value) > 0) {
                hasBid = true;
                break;
            }
        }
        if (!hasBid) return false;
    }
    
    return true;
}

// 收集输入数据
function collectInputData() {
    const totalRent = parseFloat(totalRentInput.value);
    
    // 收集人员姓名
    const people = [];
    document.querySelectorAll('.person-name').forEach(input => {
        if (input.value.trim()) {
            people.push(input.value.trim());
        }
    });
    
    // 收集房间出价
    const roomBids = {};
    currentRooms.forEach(room => {
        roomBids[room] = {};
        currentPeople.forEach(person => {
            const input = document.getElementById(`room${room}-${person}`);
            if (input) {
                roomBids[room][person] = parseFloat(input.value) || 0;
            }
        });
    });
    
    return { totalRent, roomBids };
}

// 显示结果
function displayResults(result) {
    // 保存结果供语言切换时使用
    window.lastCalculationResult = result;
    
    // 显示算法信息
    displayAlgorithmInfo(result.algorithmInfo);
    
    // 显示房间分配结果
    allocationResult.innerHTML = '';
    Object.entries(result.allocation).forEach(([room, person]) => {
        const item = document.createElement('div');
        item.className = 'allocation-item';
        item.innerHTML = `
            <span class="room">${window.i18n.t('room')}${room}</span>
            <span class="person">${person}</span>
        `;
        allocationResult.appendChild(item);
    });
    
    // 显示最终房租结果
    rentsResult.innerHTML = '';
    Object.entries(result.finalRents).forEach(([room, rent]) => {
        const item = document.createElement('div');
        item.className = 'rent-item';
        item.innerHTML = `
            <span class="room">${window.i18n.t('room')}${room}</span>
            <span class="amount">${window.i18n.t('currency_symbol')}${rent}</span>
        `;
        rentsResult.appendChild(item);
    });
    
    // 显示分配摘要
    summaryResult.innerHTML = '';
    const summaryItems = [
        { label: window.i18n.t('total_rent_label'), value: `${window.i18n.t('currency_symbol')}${totalRentInput.value}` },
        { label: window.i18n.t('fair_share'), value: `${window.i18n.t('currency_symbol')}${result.fairShare}` }
    ];
    
    // 添加每个人的总出价
    currentPeople.forEach(person => {
        if (result.totalBids[person]) {
            summaryItems.push({
                label: `${person}${window.i18n.t('total_bid')}`,
                value: `${window.i18n.t('currency_symbol')}${result.totalBids[person]}`
            });
        }
    });
    
    summaryItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
            <span class="label">${item.label}</span>
            <span class="value">${item.value}</span>
        `;
        summaryResult.appendChild(div);
    });
    
    // 显示公平性分析
    displayFairnessAnalysis(result.fairnessMetrics);
    
    // 显示分配过程解释
    displayAllocationExplanation(result.allocationDetails);
    
    // 显示房租计算解释
    displayRentExplanation(result.rentExplanations);
    
    resultsSection.style.display = 'block';
    
    // 显示PDF导出按钮
    const exportSection = document.getElementById('exportSection');
    if (exportSection) {
        exportSection.style.display = 'block';
    }
    
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// 显示算法信息
function displayAlgorithmInfo(algorithmInfo) {
    const algorithmDetails = document.getElementById('algorithmDetails');
    algorithmDetails.innerHTML = `
        <div class="algorithm-details">
            <div class="algorithm-item">
                <strong>${window.i18n.t('algorithm_name')}</strong>
                ${algorithmInfo.name}
            </div>
            <div class="algorithm-item">
                <strong>${window.i18n.t('core_principle')}</strong>
                ${algorithmInfo.principle}
            </div>
        </div>
        <div class="algorithm-stages">
            <strong>${window.i18n.t('allocation_steps')}</strong>
            <ul>
                ${algorithmInfo.stages.map(stage => `<li>${stage}</li>`).join('')}
            </ul>
        </div>
    `;
}

// 显示公平性分析
function displayFairnessAnalysis(fairnessMetrics) {
    const fairnessResult = document.getElementById('fairnessResult');
    let html = '';
    
    // 显示每个人的满意度
    currentPeople.forEach(person => {
        if (fairnessMetrics[person]) {
            const metric = fairnessMetrics[person];
            html += `
                <div class="fairness-metric">
                    <div>
                        <div class="label">${person}${window.i18n.t('satisfaction')}</div>
                        <div class="satisfaction-bar">
                            <div class="satisfaction-fill" style="width: ${metric.satisfaction}%"></div>
                        </div>
                    </div>
                    <div class="value">${metric.satisfaction}${window.i18n.t('percentage')}</div>
                </div>
            `;
        }
    });
    
    // 显示整体公平性
    if (fairnessMetrics.overall) {
        html += `
            <div class="overall-fairness">
                <div class="score">${fairnessMetrics.overall.fairnessIndex}</div>
                <div class="label">${window.i18n.t('overall_fairness')}</div>
            </div>
        `;
    }
    
    fairnessResult.innerHTML = html;
}

// 显示分配过程解释
function displayAllocationExplanation(allocationDetails) {
    const allocationExplanation = document.getElementById('allocationExplanation');
    let html = '';
    
    allocationDetails.forEach((detail, index) => {
        html += `
            <div class="explanation-item">
                <div class="step">${window.i18n.t('step')} ${index + 1}: ${window.i18n.t('room')}${detail.room} → ${detail.person}</div>
                <div class="detail">
                    ${detail.reason}<br>
                    ${window.i18n.t('bid_label')} ${window.i18n.t('currency_symbol')}${detail.bid}
                    ${detail.ratio ? `，${window.i18n.t('bid_label').replace(':', '')} ${window.i18n.t('percentage').replace('%', '')}: ${(detail.ratio * 100).toFixed(1)}${window.i18n.t('percentage')}` : ''}
                    ${detail.load ? `，${window.i18n.currentLang === 'zh' ? '当前房间数' : 'Current rooms'}: ${detail.load}` : ''}
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = `<div class="explanation-item"><div class="detail">${window.i18n.t('no_allocation_details')}</div></div>`;
    }
    
    allocationExplanation.innerHTML = html;
}

// 显示房租计算解释
function displayRentExplanation(rentExplanations) {
    const rentExplanation = document.getElementById('rentExplanation');
    let html = '';
    
    rentExplanations.forEach((explanation, index) => {
        html += `
            <div class="explanation-item">
                <div class="step">${window.i18n.t('room')}${explanation.room} - ${explanation.person}</div>
                <div class="detail">
                    ${window.i18n.t('original_bid')}: ${window.i18n.t('currency_symbol')}${explanation.originalBid}<br>
                    ${window.i18n.t('adjusted_rent')}: ${window.i18n.t('currency_symbol')}${explanation.baseRent}<br>
                    ${window.i18n.t('final_rent_amount')}: ${window.i18n.t('currency_symbol')}${explanation.finalRent}<br>
                    ${window.i18n.t('discount_info')}: ${explanation.discount}
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = `<div class="explanation-item"><div class="detail">${window.i18n.t('no_rent_details')}</div></div>`;
    }
    
    rentExplanation.innerHTML = html;
}

// 创建图表
function createChart(result) {
    const ctx = document.getElementById('allocationChart').getContext('2d');
    
    // 销毁现有图表
    if (window.allocationChart && typeof window.allocationChart.destroy === 'function') {
        window.allocationChart.destroy();
    }
    
    const labels = Object.keys(result.allocation).map(room => `${window.i18n.t('room')}${room}`);
    const rents = Object.values(result.finalRents);
    const people = Object.values(result.allocation);
    
    // 计算最大值以设置合适的Y轴范围
    const maxRent = Math.max(...rents);
    const yAxisMax = Math.ceil(maxRent * 1.2 / 50) * 50; // 向上取整到最近的50
    
    // 动态颜色生成
    const generateColors = (count) => {
        const baseColors = [
            { bg: 'rgba(102, 126, 234, 0.8)', border: 'rgba(102, 126, 234, 1)' },
            { bg: 'rgba(0, 184, 148, 0.8)', border: 'rgba(0, 184, 148, 1)' },
            { bg: 'rgba(253, 203, 110, 0.8)', border: 'rgba(253, 203, 110, 1)' },
            { bg: 'rgba(156, 39, 176, 0.8)', border: 'rgba(156, 39, 176, 1)' },
            { bg: 'rgba(233, 30, 99, 0.8)', border: 'rgba(233, 30, 99, 1)' },
            { bg: 'rgba(255, 87, 34, 0.8)', border: 'rgba(255, 87, 34, 1)' },
            { bg: 'rgba(96, 125, 139, 0.8)', border: 'rgba(96, 125, 139, 1)' },
            { bg: 'rgba(139, 195, 74, 0.8)', border: 'rgba(139, 195, 74, 1)' }
        ];
        
        const colors = { bg: [], border: [] };
        for (let i = 0; i < count; i++) {
            const colorIndex = i % baseColors.length;
            colors.bg.push(baseColors[colorIndex].bg);
            colors.border.push(baseColors[colorIndex].border);
        }
        return colors;
    };
    
    const colors = generateColors(rents.length);
    
    window.allocationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: window.i18n.currentLang === 'zh' ? '房租分配' : 'Rent Allocation',
                data: rents,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: 3,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                title: {
                    display: true,
                    text: window.i18n.currentLang === 'zh' ? '房间房租分配图表' : 'Room Rent Allocation Chart',
                    font: { 
                        size: 18,
                        weight: 'bold'
                    },
                    color: '#2c3e50',
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    cornerRadius: 10,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${window.i18n.t('currency_symbol')}${value}`;
                        },
                        afterLabel: function(context) {
                            const roomIndex = context.dataIndex;
                            const person = people[roomIndex];
                            return window.i18n.currentLang === 'zh' ? 
                                `分配给: ${person}` : 
                                `Assigned to: ${person}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yAxisMax,
                    title: { 
                        display: true, 
                        text: window.i18n.t('currency_week'),
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#2c3e50',
                        callback: function(value) {
                            return window.i18n.t('currency_symbol') + value;
                        }
                    }
                },
                x: {
                    title: { 
                        display: true, 
                        text: window.i18n.currentLang === 'zh' ? '房间' : 'Rooms',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#2c3e50'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// 添加输入验证
function addInputValidation() {
    document.addEventListener('input', function(e) {
        if (e.target.type === 'number' && e.target.value < 0) {
            e.target.value = 0;
        }
    });
}

// 全局函数（供HTML和i18n调用）
window.removePerson = removePerson;
window.removeRoom = removeRoom;
window.updatePeopleDisplay = updatePeopleDisplay;
window.updateRoomsDisplay = updateRoomsDisplay;

// PDF导出功能
async function exportToPDF() {
    const exportBtn = document.getElementById('exportPdfBtn');
    const originalText = exportBtn.querySelector('span:last-child').textContent;
    
    try {
        exportBtn.disabled = true;
        exportBtn.querySelector('span:last-child').textContent = window.i18n.t('pdf_generating');
        
        // 获取结果区域元素
        const resultsSection = document.getElementById('resultsSection');
        
        // 创建一个临时的打印样式容器
        const printContainer = document.createElement('div');
        printContainer.style.cssText = `
            background: white;
            padding: 40px;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            box-sizing: border-box;
        `;
        
        // 创建PDF内容
        const pdfContent = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
                <h1 style="color: #2c3e50; font-size: 28px; margin: 0;">${window.i18n.t('pdf_title')}</h1>
                <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
                    ${new Date().toLocaleString(window.i18n.currentLang === 'zh' ? 'zh-CN' : 'en-US')}
                </p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">${window.i18n.t('summary')}</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                    ${document.getElementById('summaryResult').innerHTML}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">${window.i18n.t('room_allocation')}</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #27ae60;">
                    ${document.getElementById('allocationResult').innerHTML}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">${window.i18n.t('final_rent')}</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #e74c3c;">
                    ${document.getElementById('rentsResult').innerHTML}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">${window.i18n.t('fairness_analysis')}</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #f39c12;">
                    ${document.getElementById('fairnessResult').innerHTML}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">${window.i18n.t('algorithm')}</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #9b59b6;">
                    ${document.getElementById('algorithmDetails').innerHTML}
                </div>
            </div>
            
            <div style="page-break-before: always; margin-bottom: 30px;">
                <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">${window.i18n.t('allocation_explanation')}</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #34495e;">
                    ${document.getElementById('allocationExplanation').innerHTML}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">${window.i18n.t('rent_explanation')}</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #16a085;">
                    ${document.getElementById('rentExplanation').innerHTML}
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                <p>${window.i18n.currentLang === 'zh' ? '本报告由房间房租分配系统自动生成' : 'This report was automatically generated by Room Rent Allocation System'}</p>
            </div>
        `;
        
        printContainer.innerHTML = pdfContent;
        document.body.appendChild(printContainer);
        
        // 使用html2canvas捕获内容
        const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: printContainer.offsetWidth,
            height: printContainer.offsetHeight
        });
        
        // 创建PDF
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        // 添加第一页
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // 如果内容超过一页，添加更多页面
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // 下载PDF
        const filename = `${window.i18n.currentLang === 'zh' ? '房间分配报告' : 'Room_Allocation_Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
        
        // 移除临时容器
        document.body.removeChild(printContainer);
        
        // 显示成功消息
        alert(window.i18n.t('pdf_success'));
        
    } catch (error) {
        console.error('PDF export error:', error);
        alert(window.i18n.t('pdf_error') + error.message);
    } finally {
        exportBtn.disabled = false;
        exportBtn.querySelector('span:last-child').textContent = originalText;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化国际化
    window.i18n.init();
    
    // 初始化应用
    initializeApp();
    
    // 绑定PDF导出事件
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToPDF);
    }
});
