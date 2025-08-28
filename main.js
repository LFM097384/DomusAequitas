const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'DomusAequitas 居所公平'
  });

  mainWindow.loadFile('index.html');

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 处理房间分配计算
ipcMain.handle('calculate-allocation', async (event, data) => {
  const { totalRent, roomBids } = data;
  
  try {
    const result = calculateFairAllocation(totalRent, roomBids);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 公平分配算法 - Adjusted Winner Algorithm (调整获胜者算法)
function calculateFairAllocation(totalRent, roomBids) {
  const rooms = Object.keys(roomBids);
  const people = Object.keys(roomBids[rooms[0]]);
  
  // 验证输入数据
  if (rooms.length === 0 || people.length === 0) {
    throw new Error('房间或人员数量不能为空');
  }
  
  // 计算每个人的总出价
  const totalBids = {};
  people.forEach(person => {
    totalBids[person] = rooms.reduce((sum, room) => sum + (roomBids[room][person] || 0), 0);
  });
  
  // 计算每个人的公平份额
  const fairShare = totalRent / people.length;
  
  // 第一阶段：初始分配 - 使用比例分配
  const allocation = {};
  const allocationDetails = [];
  
  if (rooms.length <= people.length) {
    // 房间数 <= 人员数：一对一最优匹配
    const unassignedRooms = [...rooms];
    const unassignedPeople = [...people];
    
    while (unassignedRooms.length > 0 && unassignedPeople.length > 0) {
      let bestRoom = null;
      let bestPerson = null;
      let bestRatio = 0;
      
      // 寻找最高出价比例
      unassignedRooms.forEach(room => {
        unassignedPeople.forEach(person => {
          const bid = roomBids[room][person] || 0;
          const totalPersonBid = totalBids[person];
          const ratio = totalPersonBid > 0 ? bid / totalPersonBid : 0;
          
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestRoom = room;
            bestPerson = person;
          }
        });
      });
      
      if (bestRoom && bestPerson) {
        allocation[bestRoom] = bestPerson;
        allocationDetails.push({
          room: bestRoom,
          person: bestPerson,
          bid: roomBids[bestRoom][bestPerson] || 0,
          ratio: bestRatio,
          reason: `${bestPerson}对房间${bestRoom}的出价比例最高 (${(bestRatio * 100).toFixed(1)}%)`
        });
        
        unassignedRooms.splice(unassignedRooms.indexOf(bestRoom), 1);
        unassignedPeople.splice(unassignedPeople.indexOf(bestPerson), 1);
      } else {
        break;
      }
    }
  } else {
    // 房间数 > 人员数：允许一人多房间
    const personLoads = {};
    people.forEach(person => personLoads[person] = 0);
    
    const sortedRooms = rooms.sort((a, b) => {
      const aTotalValue = people.reduce((sum, p) => sum + (roomBids[a][p] || 0), 0);
      const bTotalValue = people.reduce((sum, p) => sum + (roomBids[b][p] || 0), 0);
      return bTotalValue - aTotalValue;
    });
    
    sortedRooms.forEach(room => {
      let bestPerson = null;
      let bestValue = -Infinity;
      
      people.forEach(person => {
        const bid = roomBids[room][person] || 0;
        const loadPenalty = personLoads[person] * 20; // 负载惩罚
        const value = bid - loadPenalty;
        
        if (value > bestValue) {
          bestValue = value;
          bestPerson = person;
        }
      });
      
      if (bestPerson) {
        allocation[room] = bestPerson;
        personLoads[bestPerson]++;
        allocationDetails.push({
          room: room,
          person: bestPerson,
          bid: roomBids[room][bestPerson] || 0,
          load: personLoads[bestPerson],
          reason: `${bestPerson}对房间${room}出价最高，当前负载：${personLoads[bestPerson]}个房间`
        });
      }
    });
  }
  
  // 第二阶段：公平房租计算 - 基于Shapley值原理
  const finalRents = {};
  const rentExplanations = [];
  
  // 计算每个人实际分配到的房间价值
  const actualValues = {};
  people.forEach(person => actualValues[person] = 0);
  
  Object.entries(allocation).forEach(([room, person]) => {
    actualValues[person] += roomBids[room][person] || 0;
  });
  
  // 计算房租调整因子
  const totalActualValue = Object.values(actualValues).reduce((sum, val) => sum + val, 0);
  const valueRatio = totalActualValue > 0 ? totalRent / totalActualValue : 1;
  
  // 为每个房间计算公平房租
  Object.entries(allocation).forEach(([room, person]) => {
    const originalBid = roomBids[room][person] || 0;
    const personTotalValue = actualValues[person];
    const personRoomCount = Object.values(allocation).filter(p => p === person).length;
    
    // 基础房租 = 出价 * 调整比例
    let baseRent = originalBid * valueRatio;
    
    // 多房间折扣
    if (personRoomCount > 1) {
      const discount = 1 - (personRoomCount - 1) * 0.1; // 每多一个房间10%折扣
      baseRent *= Math.max(discount, 0.7); // 最低7折
    }
    
    finalRents[room] = Math.round(baseRent * 100) / 100;
    
    rentExplanations.push({
      room: room,
      person: person,
      originalBid: originalBid,
      baseRent: Math.round(originalBid * valueRatio * 100) / 100,
      finalRent: finalRents[room],
      discount: personRoomCount > 1 ? `多房间${Math.round((1 - finalRents[room] / (originalBid * valueRatio)) * 100)}%折扣` : '无折扣'
    });
  });
  
  // 第三阶段：最终调整确保总房租准确
  const currentTotal = Object.values(finalRents).reduce((sum, rent) => sum + rent, 0);
  if (Math.abs(currentTotal - totalRent) > 0.01) {
    const adjustmentFactor = totalRent / currentTotal;
    Object.keys(finalRents).forEach(room => {
      finalRents[room] = Math.round(finalRents[room] * adjustmentFactor * 100) / 100;
    });
  }
  
  // 计算公平性指标
  const fairnessMetrics = calculateFairnessMetrics(people, totalBids, actualValues, fairShare);
  
  return {
    allocation,
    finalRents,
    fairShare: Math.round(fairShare * 100) / 100,
    totalBids,
    totalRent,
    allocationDetails,
    rentExplanations,
    fairnessMetrics,
    algorithmInfo: {
      name: "调整获胜者算法 (Adjusted Winner Algorithm)",
      principle: "基于比例公平和Shapley值的组合算法",
      stages: [
        "1. 按出价比例进行初始房间分配",
        "2. 基于Shapley值计算公平房租",
        "3. 多房间折扣和总额调整"
      ]
    }
  };
}

// 计算公平性指标
function calculateFairnessMetrics(people, totalBids, actualValues, fairShare) {
  const metrics = {};
  
  // 计算每个人的满意度 (0-1)
  people.forEach(person => {
    const satisfaction = totalBids[person] > 0 ? 
      Math.min(actualValues[person] / totalBids[person], 1) : 0;
    metrics[person] = {
      satisfaction: Math.round(satisfaction * 100),
      valueGap: Math.round((actualValues[person] - fairShare) * 100) / 100
    };
  });
  
  // 整体公平性指数
  const avgSatisfaction = people.reduce((sum, person) => 
    sum + metrics[person].satisfaction, 0) / people.length;
  
  metrics.overall = {
    fairnessIndex: Math.round(avgSatisfaction),
    algorithm: "调整获胜者算法"
  };
  
  return metrics;
}
