// Web版本的主要逻辑 - 替代Electron的main.js功能

// 调整获胜者算法 (Adjusted Winner Algorithm)
function calculateFairAllocation(data) {
    try {
        const { totalRent, roomBids } = data;
        const people = Object.keys(roomBids[Object.keys(roomBids)[0]] || {});
        const rooms = Object.keys(roomBids);
        
        console.log('开始计算分配:', { totalRent, people, rooms, roomBids });
        
        // 验证输入数据
        if (!people.length || !rooms.length || !totalRent || totalRent <= 0) {
            throw new Error('输入数据不完整');
        }
        
        // 验证房间数据
        for (const room of rooms) {
            if (!roomBids[room]) {
                throw new Error(`房间${room}缺少出价数据`);
            }
        }
        
        // 验证人员数据
        for (const person of people) {
            for (const room of rooms) {
                if (roomBids[room][person] === undefined || roomBids[room][person] < 0) {
                    throw new Error(`${person}对房间${room}的出价无效`);
                }
            }
        }
        
        console.log('数据验证通过');
        
        // 算法实现
        const result = {
            allocation: {},
            finalRents: {},
            fairShare: Math.round(totalRent / people.length),
            totalBids: {},
            allocationDetails: [],
            rentExplanations: [],
            fairnessMetrics: {},
            algorithmInfo: {
                name: '调整获胜者算法 (Adjusted Winner Algorithm)',
                principle: '基于比例公平性和Shapley值的公平分配机制',
                stages: [
                    '1. 初始分配：根据出价比例分配房间',
                    '2. 房租计算：考虑多房间折扣的动态定价',
                    '3. 最终调整：确保整体公平性和预算平衡'
                ]
            }
        };
        
        // 计算每人总出价
        people.forEach(person => {
            result.totalBids[person] = rooms.reduce((sum, room) => sum + (roomBids[room][person] || 0), 0);
        });
        
        console.log('总出价计算完成:', result.totalBids);
        
        // 第一阶段：初始分配
        const availableRooms = [...rooms];
        const allocatedPeople = new Set();
        
        // 按房间进行分配（优先分配竞争最激烈的房间）
        while (availableRooms.length > 0 && allocatedPeople.size < people.length) {
            let bestRoom = null;
            let bestPerson = null;
            let bestRatio = 0;
            let bestBid = 0;
            
            // 为每个可用房间找到最佳竞标者
            for (const room of availableRooms) {
                for (const person of people) {
                    if (allocatedPeople.has(person)) continue;
                    
                    const bid = roomBids[room][person] || 0;
                    const totalBid = result.totalBids[person];
                    const ratio = totalBid > 0 ? bid / totalBid : 0;
                    
                    if (ratio > bestRatio || (ratio === bestRatio && bid > bestBid)) {
                        bestRoom = room;
                        bestPerson = person;
                        bestRatio = ratio;
                        bestBid = bid;
                    }
                }
            }
            
            if (bestRoom && bestPerson) {
                result.allocation[bestRoom] = bestPerson;
                allocatedPeople.add(bestPerson);
                availableRooms.splice(availableRooms.indexOf(bestRoom), 1);
                
                result.allocationDetails.push({
                    room: bestRoom,
                    person: bestPerson,
                    bid: bestBid,
                    ratio: bestRatio,
                    reason: `${bestPerson}对房间${bestRoom}的出价比例最高 (${(bestRatio * 100).toFixed(1)}%)`
                });
                
                console.log(`分配房间${bestRoom}给${bestPerson}, 出价: ${bestBid}, 比例: ${(bestRatio * 100).toFixed(1)}%`);
            } else {
                break;
            }
        }
        
        // 处理剩余房间（如果房间多于人员）
        if (availableRooms.length > 0) {
            const unallocatedPeople = people.filter(p => !allocatedPeople.has(p));
            
            // 为未分配的人员分配剩余房间
            for (let i = 0; i < Math.min(availableRooms.length, unallocatedPeople.length); i++) {
                const room = availableRooms[i];
                const person = unallocatedPeople[i];
                const bid = roomBids[room][person] || 0;
                
                result.allocation[room] = person;
                allocatedPeople.add(person);
                
                result.allocationDetails.push({
                    room: room,
                    person: person,
                    bid: bid,
                    reason: `剩余房间分配`
                });
            }
            
            // 将多余房间分配给已有房间的人（多房间折扣）
            const remainingRooms = availableRooms.slice(unallocatedPeople.length);
            const allocatedPeopleArray = Array.from(allocatedPeople);
            
            for (let i = 0; i < remainingRooms.length; i++) {
                const room = remainingRooms[i];
                const person = allocatedPeopleArray[i % allocatedPeopleArray.length];
                const bid = roomBids[room][person] || 0;
                
                result.allocation[room] = person;
                
                result.allocationDetails.push({
                    room: room,
                    person: person,
                    bid: bid,
                    load: Object.values(result.allocation).filter(p => p === person).length,
                    reason: `多房间分配 (${person}已有${Object.values(result.allocation).filter(p => p === person).length - 1}个房间)`
                });
            }
        }
        
        console.log('房间分配完成:', result.allocation);
        
        // 第二阶段：计算房租
        const personRoomCount = {};
        people.forEach(person => {
            personRoomCount[person] = Object.values(result.allocation).filter(p => p === person).length;
        });
        
        console.log('每人房间数:', personRoomCount);
        
        // 计算基础房租（基于出价）
        let totalAllocatedBids = 0;
        Object.entries(result.allocation).forEach(([room, person]) => {
            totalAllocatedBids += roomBids[room][person] || 0;
        });
        
        console.log('总分配出价:', totalAllocatedBids);
        
        // 按比例分配房租
        Object.entries(result.allocation).forEach(([room, person]) => {
            const bid = roomBids[room][person] || 0;
            let baseRent = totalAllocatedBids > 0 ? (bid / totalAllocatedBids) * totalRent : totalRent / rooms.length;
            
            // 多房间折扣
            const roomCount = personRoomCount[person];
            let discount = '';
            if (roomCount > 1) {
                baseRent *= 0.9; // 10%折扣
                discount = '多房间折扣 (-10%)';
            } else {
                discount = '无折扣';
            }
            
            result.finalRents[room] = Math.round(baseRent);
            
            result.rentExplanations.push({
                room: room,
                person: person,
                originalBid: bid,
                baseRent: Math.round(baseRent / (roomCount > 1 ? 0.9 : 1)),
                finalRent: Math.round(baseRent),
                discount: discount
            });
        });
        
        console.log('房租计算完成:', result.finalRents);
        
        // 第三阶段：计算公平性指标
        people.forEach(person => {
            const allocatedRooms = Object.entries(result.allocation)
                .filter(([room, assignedPerson]) => assignedPerson === person)
                .map(([room]) => room);
            
            let totalValue = 0;
            let totalPaid = 0;
            
            allocatedRooms.forEach(room => {
                totalValue += roomBids[room][person] || 0;
                totalPaid += result.finalRents[room] || 0;
            });
            
            const satisfaction = totalValue > 0 ? Math.min(100, Math.round((totalValue - totalPaid) / totalValue * 100)) : 0;
            
            result.fairnessMetrics[person] = {
                satisfaction: Math.max(0, satisfaction),
                totalValue: totalValue,
                totalPaid: totalPaid,
                valueGap: totalValue - totalPaid
            };
        });
        
        // 计算整体公平性
        const satisfactionScores = Object.values(result.fairnessMetrics).map(m => m.satisfaction);
        const avgSatisfaction = satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length;
        const minSatisfaction = Math.min(...satisfactionScores);
        const fairnessIndex = Math.round((avgSatisfaction + minSatisfaction) / 2);
        
        result.fairnessMetrics.overall = {
            averageSatisfaction: Math.round(avgSatisfaction),
            minimumSatisfaction: minSatisfaction,
            fairnessIndex: fairnessIndex
        };
        
        console.log('公平性计算完成:', result.fairnessMetrics);
        
        // 验证总房租
        const calculatedTotal = Object.values(result.finalRents).reduce((sum, rent) => sum + rent, 0);
        console.log(`计算总房租: ${calculatedTotal}, 目标总房租: ${totalRent}`);
        
        // 如果有差异，调整最大房间的房租
        if (calculatedTotal !== totalRent) {
            const difference = totalRent - calculatedTotal;
            const maxRentRoom = Object.keys(result.finalRents).reduce((a, b) => 
                result.finalRents[a] > result.finalRents[b] ? a : b
            );
            result.finalRents[maxRentRoom] += difference;
            console.log(`调整房间${maxRentRoom}的房租，差额: ${difference}`);
        }
        
        return {
            success: true,
            result: result
        };
        
    } catch (error) {
        console.error('计算错误:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 模拟IPC通信
window.electronAPI = {
    calculateAllocation: calculateFairAllocation
};

// 替换renderer.js中的ipcRenderer调用
window.ipcRenderer = {
    invoke: async (channel, data) => {
        if (channel === 'calculate-allocation') {
            return calculateFairAllocation(data);
        }
        throw new Error(`Unknown channel: ${channel}`);
    }
};

console.log('Web版本初始化完成');
