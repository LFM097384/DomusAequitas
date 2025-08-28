// 国际化管理器
class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'zh';
        this.translations = {
            zh: {
                // 头部
                title: 'DomusAequitas 居所公平',
                subtitle: '公平分配房间和房租，基于个人出价和偏好',
                
                // 基本信息
                basic_info: '基本信息设置',
                total_rent: '总房租 (镑/周):',
                rent_placeholder: '例如: 300',
                people_setting: '人员设置:',
                add_person: '+ 添加人员',
                
                // 房间设置
                room_bidding: '房间出价设置',
                add_room: '+ 添加房间',
                calculate: '计算公平分配',
                
                // 结果
                results: '分配结果',
                algorithm: '分配算法',
                room_allocation: '房间分配',
                final_rent: '最终房租',
                summary: '分配摘要',
                fairness_analysis: '公平性分析',
                allocation_explanation: '分配过程解释',
                rent_explanation: '房租计算解释',
                
                // 算法相关
                algorithm_name: '算法名称',
                core_principle: '核心原理',
                allocation_steps: '分配步骤:',
                total_rent_label: '总房租',
                fair_share: '每人公平份额',
                total_bid: '总出价',
                satisfaction: '满意度',
                overall_fairness: '整体公平性指数 (满分100)',
                
                // 解释相关
                step: '步骤',
                room: '房间',
                original_bid: '原始出价',
                adjusted_rent: '调整后基础房租',
                final_rent_amount: '最终房租',
                discount_info: '折扣情况',
                no_discount: '无折扣',
                multi_room_discount: '多房间折扣',
                
                // 按钮和操作
                calculating: '计算中...',
                person_placeholder: '例如: 人员',
                bid_label: '出价:',
                
                // 提示信息
                fill_required_info: '请填写所有必要信息！',
                calculation_failed: '计算失败: ',
                error_occurred: '发生错误: ',
                
                // 单位
                currency_week: '镑/周',
                currency_symbol: '£',
                percentage: '%',
                
                // PDF导出
                export_pdf: '导出PDF报告',
                pdf_title: 'DomusAequitas 居所公平 - 分配报告',
                pdf_generating: '正在生成PDF...',
                pdf_success: 'PDF导出成功！',
                pdf_error: 'PDF导出失败：',
                
                // 动态内容
                room_name: '房间',
                person_name: '人员',
                assignment_to: '分配给',
                bid_ratio: '出价比例',
                current_rooms: '当前房间数',
                no_allocation_details: '暂无分配详情',
                no_rent_details: '暂无房租计算详情',
                
                // 算法详细说明
                algorithm_adjusted_winner: '调整获胜者算法',
                algorithm_principle: '基于比例公平性和Shapley值的公平分配机制',
                stage_initial_allocation: '1. 初始分配：根据出价比例分配房间',
                stage_rent_calculation: '2. 房租计算：考虑多房间折扣的动态定价',
                stage_final_adjustment: '3. 最终调整：确保整体公平性和预算平衡',
                
                // 折扣信息
                no_discount_applied: '无折扣',
                multi_room_discount_applied: '多房间折扣 (-10%)',
                
                // 输入提示
                person_input_placeholder: '例如: 人员',
                rent_input_example: '例如: 300',
                
                // 默认名称
                default_person_1: '人员1',
                default_person_2: '人员2',
                default_person_3: '人员3',
                default_room_prefix: '房间',
                
                // 表单标签
                person_placeholder_template: '例如: 人员',
                
                // 动态添加
                new_person_prefix: '人员',
                new_room_letter: '房间'
            },
            en: {
                // Header
                title: 'DomusAequitas',
                subtitle: 'Fair allocation of rooms and rent based on personal preferences and bids',
                
                // Basic Info
                basic_info: 'Basic Information Setup',
                total_rent: 'Total Rent (£/week):',
                rent_placeholder: 'e.g., 300',
                people_setting: 'People Setup:',
                add_person: '+ Add Person',
                
                // Room Setup
                room_bidding: 'Room Bidding Setup',
                add_room: '+ Add Room',
                calculate: 'Calculate Fair Allocation',
                
                // Results
                results: 'Allocation Results',
                algorithm: 'Allocation Algorithm',
                room_allocation: 'Room Allocation',
                final_rent: 'Final Rent',
                summary: 'Allocation Summary',
                fairness_analysis: 'Fairness Analysis',
                allocation_explanation: 'Allocation Process Explanation',
                rent_explanation: 'Rent Calculation Explanation',
                
                // Algorithm Related
                algorithm_name: 'Algorithm Name',
                core_principle: 'Core Principle',
                allocation_steps: 'Allocation Steps:',
                total_rent_label: 'Total Rent',
                fair_share: 'Fair Share Per Person',
                total_bid: 'Total Bid',
                satisfaction: 'Satisfaction',
                overall_fairness: 'Overall Fairness Index (Max 100)',
                
                // Explanation Related
                step: 'Step',
                room: 'Room',
                original_bid: 'Original Bid',
                adjusted_rent: 'Adjusted Base Rent',
                final_rent_amount: 'Final Rent',
                discount_info: 'Discount Info',
                no_discount: 'No Discount',
                multi_room_discount: 'Multi-room Discount',
                
                // Buttons and Actions
                calculating: 'Calculating...',
                person_placeholder: 'e.g., Person',
                bid_label: 'Bid:',
                
                // Messages
                fill_required_info: 'Please fill in all required information!',
                calculation_failed: 'Calculation failed: ',
                error_occurred: 'Error occurred: ',
                
                // Units
                currency_week: '£/week',
                currency_symbol: '£',
                percentage: '%',
                
                // PDF Export
                export_pdf: 'Export PDF Report',
                pdf_title: 'DomusAequitas - Allocation Report',
                pdf_generating: 'Generating PDF...',
                pdf_success: 'PDF exported successfully!',
                pdf_error: 'PDF export failed: ',
                
                // Dynamic Content
                room_name: 'Room',
                person_name: 'Person',
                assignment_to: 'Assigned to',
                bid_ratio: 'Bid Ratio',
                current_rooms: 'Current Rooms',
                no_allocation_details: 'No allocation details available',
                no_rent_details: 'No rent calculation details available',
                
                // Algorithm Details
                algorithm_adjusted_winner: 'Adjusted Winner Algorithm',
                algorithm_principle: 'Fair allocation mechanism based on proportional fairness and Shapley values',
                stage_initial_allocation: '1. Initial Allocation: Distribute rooms based on bid ratios',
                stage_rent_calculation: '2. Rent Calculation: Dynamic pricing with multi-room discounts',
                stage_final_adjustment: '3. Final Adjustment: Ensure overall fairness and budget balance',
                
                // Discount Information
                no_discount_applied: 'No Discount',
                multi_room_discount_applied: 'Multi-room Discount (-10%)',
                
                // Input Placeholders
                person_input_placeholder: 'e.g., Person',
                rent_input_example: 'e.g., 300',
                
                // Default Names
                default_person_1: 'Person 1',
                default_person_2: 'Person 2',
                default_person_3: 'Person 3',
                default_room_prefix: 'Room',
                
                // Form Labels
                person_placeholder_template: 'e.g., Person',
                
                // Dynamic Addition
                new_person_prefix: 'Person',
                new_room_letter: 'Room'
            }
        };
    }
    
    // 获取翻译文本
    t(key) {
        return this.translations[this.currentLang][key] || key;
    }
    
    // 切换语言
    switchLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updateUI();
            
            // 更新HTML lang属性
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
            
            // 更新页面标题
            document.title = this.t('title').replace('🏠 ', '');
        }
    }
    
    // 更新UI中的所有文本
    updateUI() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        
        // 更新所有带有 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // 更新语言按钮显示
        const currentLangElement = document.getElementById('currentLang');
        if (currentLangElement) {
            currentLangElement.textContent = this.currentLang === 'zh' ? '中文' : 'English';
        }
        
        // 更新下拉菜单中的活跃状态
        document.querySelectorAll('.lang-option').forEach(option => {
            const lang = option.getAttribute('data-lang');
            option.classList.toggle('active', lang === this.currentLang);
        });
        
        // 更新动态生成的内容
        if (window.updatePeopleDisplay) {
            window.updatePeopleDisplay();
        }
        if (window.updateRoomsDisplay) {
            window.updateRoomsDisplay();
        }
        
        // 如果结果区域已显示，需要重新渲染结果
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection && resultsSection.style.display !== 'none') {
            // 触发重新计算以更新结果显示的语言
            if (window.lastCalculationResult) {
                window.displayResults(window.lastCalculationResult);
            }
        }
    }
    
    // 初始化语言系统
    init() {
        this.updateUI();
        this.setupLanguageSwitcher();
    }
    
    // 设置语言切换器
    setupLanguageSwitcher() {
        const langBtn = document.getElementById('langBtn');
        const langDropdown = document.getElementById('langDropdown');
        
        if (langBtn && langDropdown) {
            // 语言按钮点击事件
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.classList.toggle('show');
                langBtn.classList.toggle('active');
            });
            
            // 语言选项点击事件
            document.querySelectorAll('.lang-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = option.getAttribute('data-lang');
                    this.switchLanguage(lang);
                    langDropdown.classList.remove('show');
                    langBtn.classList.remove('active');
                });
            });
            
            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', () => {
                langDropdown.classList.remove('show');
                langBtn.classList.remove('active');
            });
        }
    }
}

// 创建全局 i18n 实例
window.i18n = new I18nManager();
