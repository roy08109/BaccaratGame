// 常量定义
const CONFIG = {
    dalu: { rows: 6, cols: 30, type: 'dalu' },
    dayan: { rows: 6, cols: 30, type: 'dayan' },
    xiaolu: { rows: 6, cols: 30, type: 'small' },
    zhanglang: { rows: 6, cols: 30, type: 'cockroach' },
    zhuzailu: { rows: 6, cols: 15, type: 'bead' }
};

const TRANSLATIONS = {
    'zh-CN': {
        settings_title: '游戏设置',
        table_limit: '台红限制',
        commission_mode: '抽水模式',
        comm_classic: '95桌 (庄赢0.95)',
        comm_super6: '6点一半 (免佣)',
        game_options: '玩法选项',
        opt_lucky6: '开启“幸运6” (庄6点赢)',
        odds_lucky6: '赔率: 1:12,20(2張3張)/1:12 (2张) / 1:20 (3张)',
        opt_lucky7: '开启“幸运7” (闲7赢)',
        odds_lucky7: '赔率: 1:6 (2张) / 1:15 (3张)',
        opt_super_lucky7: '开启“超级幸运7” (闲7赢庄6)',
        odds_super_lucky7: '赔率: 1:30 (4张) / 1:40 (5张) / 1:100 (6张)',
        btn_start: '开始游戏',
        btn_continue: '继续游戏',
        buyin_amount: '买码金额',
        add_amount: '增加金额',
        table_limit_display: '台红: 25-150万',
        player_label: '闲 (Player)',
        banker_label: '庄 (Banker)',
        lucky7: '幸运7',
        super_lucky7: '超幸7',
        lucky6: '幸6(2/3)',
        lucky6_2: '幸6(2张)',
        lucky6_3: '幸6(3张)',
        player_pair: '闲对',
        tie: '和',
        banker_pair: '庄对',
        player_main: '闲',
        banker_main: '庄',
        balance_label: '余额:',
        stat_total: '总:',
        stat_banker: '庄:',
        stat_player: '闲:',
        stat_tie: '和:',
        stat_bpair: '庄对:',
        stat_ppair: '闲对:',
        stat_lucky6: '幸6:',
        stat_lucky7: '幸7:',
        btn_clear: '清除',
        btn_rebet: '重下',
        btn_deal: '发牌',
        btn_fly: '飞牌'
    },
    'zh-TW': {
        settings_title: '遊戲設置',
        table_limit: '台紅限制',
        commission_mode: '抽水模式',
        comm_classic: '95桌 (庄贏0.95)',
        comm_super6: '6點一半 (免傭)',
        game_options: '玩法選項',
        opt_lucky6: '開啟“幸運6” (庄6點贏)',
        odds_lucky6: '賠率: 1:12,20(2張3張)/1:12 (2張) / 1:20 (3張)',
        opt_lucky7: '開啟“幸運7” (閑7贏)',
        odds_lucky7: '賠率: 1:6 (2張) / 1:15 (3張)',
        opt_super_lucky7: '開啟“超級幸運7” (閑7贏庄6)',
        odds_super_lucky7: '賠率: 1:30 (4張) / 1:40 (5張) / 1:100 (6張)',
        btn_start: '開始遊戲',
        btn_continue: '繼續遊戲',
        buyin_amount: '買碼金額',
        add_amount: '增加金額',
        table_limit_display: '台紅: 25-150萬',
        player_label: '閑 (Player)',
        banker_label: '庄 (Banker)',
        lucky7: '幸運7',
        super_lucky7: '超幸7',
        lucky6: '幸6(2/3)',
        lucky6_2: '幸6(2張)',
        lucky6_3: '幸6(3張)',
        player_pair: '閑對',
        tie: '和',
        banker_pair: '庄對',
        player_main: '閑',
        banker_main: '庄',
        balance_label: '餘額:',
        stat_total: '總:',
        stat_banker: '庄:',
        stat_player: '閑:',
        stat_tie: '和:',
        stat_bpair: '庄對:',
        stat_ppair: '閑對:',
        stat_lucky6: '幸6:',
        stat_lucky7: '幸7:',
        btn_clear: '清除',
        btn_rebet: '重下',
        btn_deal: '發牌',
        btn_fly: '飛牌'
    }
};

let currentLang = 'zh-CN';

function updateLanguage(lang) {
    currentLang = lang;
    const t = TRANSLATIONS[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Update dynamic text if needed
    if (typeof game !== 'undefined' && game) {
        game.updateDealButtonState();
        game.updateClearButtonState();
        
        // Update Settings Modal dynamic text
        const buyinLabel = document.querySelector('label[data-i18n="buyin_amount"]');
        const btnStart = document.getElementById('btn-start-game');
        
        if (buyinLabel) buyinLabel.textContent = t[game.started ? 'add_amount' : 'buyin_amount'];
        // Use game existence to determine if it's 'continue' or 'start', reusing logic
        if (btnStart) btnStart.textContent = t['btn_continue']; // If game exists, it's continue
    } else {
        const buyinLabel = document.querySelector('label[data-i18n="buyin_amount"]');
        const btnStart = document.getElementById('btn-start-game');
        if (buyinLabel) buyinLabel.textContent = t['buyin_amount'];
        if (btnStart) btnStart.textContent = t['btn_start'];
    }
}

window.__roadDebug = window.__roadDebug ?? false;

// 全局状态：珠仔路索引
let zhuzailuIndex = 0;

// 通用路单类
class RoadMap {
    constructor(id, config) {
        this.container = document.getElementById(id);
        this.rows = config.rows;
        this.cols = config.cols;
        this.type = config.type;
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null)); // 存储单元格占用状态
        
        // 绘制逻辑状态
        this.colorData = {
            lastColor: null, // 上一次颜色
            lastStartCol: -1, // 上一个序列的起始列
            startCol: 0, // 当前序列的起始列
            currRow: 0, // 当前绘制位置
            currCol: 0,
            clickCnt: 0, // 当前序列点击次数
            turned: false, // 是否拐弯
            isStuck: false, // 是否受阻
            numShowCount: 0, // 数字显示计数
            numberMode: false // 是否进入纯数字模式
        };

        // 三路启始标志
        this.enabled = this.type === 'dalu' || this.type === 'bead' ? true : false;
        this.enableNext = false;

        // 大路列模型（仅大路用）
        if (this.type === 'dalu') {
            this.columns = []; // 每列为数组，忽略和
            this.currentColumnIndex = -1;
        }

        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                // 根据类型设置class
                if (this.type === 'dalu') cell.className = 'cell-dalu';
                else if (this.type === 'bead') cell.className = 'cell-zhuzailu cell-dalu'; // 复用 cell-dalu 样式（边框）但可能有特殊
                else cell.className = 'cell-dalu'; // 下三路单元格样式与大路一致

                cell.dataset.row = r;
                cell.dataset.col = c;
                this.container.appendChild(cell);
            }
        }
    }

    isOccupied(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
        return this.grid[r][c] !== null;
    }

    // 添加标记
    // winner: 'banker' | 'player'
    addMarker(winner) {
        // 大路返回落子方向信息，其他路按原逻辑
        if (this.type === 'dalu') {
            return this.addMarkerBigRoad(winner);
        }

        const data = this.colorData;
        
        // 判断是否切换颜色
        if (winner !== data.lastColor) {
            if (data.lastColor !== null) {
                data.lastStartCol = data.startCol;
            } else {
                data.lastStartCol = -1; // 确保第一次是 0
            }
            
            data.startCol = data.lastStartCol + 1;
            
            // 重置状态
            data.currRow = 0;
            data.currCol = data.startCol;
            data.clickCnt = 0;
            data.turned = false;
            data.isStuck = false;
            data.numShowCount = 0;
            data.numberMode = false;
            data.lastColor = winner;
        }

        // 放置逻辑
        data.clickCnt++;

        // 如果已经进入纯数字模式，直接更新数字并返回
        if (data.numberMode) {
            this.renderNumber(data.currCol, data.clickCnt);
            return;
        }

        // 目标位置
        let targetRow = data.currRow;
        let targetCol = data.currCol;
        
        // 规则：clickCnt=1 时，直接在 (currRow, currCol) 放置
        if (data.clickCnt === 1) {
            targetRow = 0; // 必然是0
            targetCol = data.startCol;
        } else {
            // clickCnt > 1
            // 根据 turned 状态决定方向
            if (!data.turned) {
                // 优先向下
                const nextRow = data.currRow + 1;
                const nextCol = data.currCol;
                
                if (this.isOccupied(nextRow, nextCol)) {
                    // 向下受阻 -> 拐弯
                    data.turned = true;
                    // 拐弯后改为向右
                    targetRow = data.currRow;
                    targetCol = data.currCol + 1;
                } else {
                    // 向下畅通
                    targetRow = nextRow;
                    targetCol = nextCol;
                }
            } else {
                // 已经拐弯 -> 向右
                targetRow = data.currRow;
                targetCol = data.currCol + 1;
            }
        }

        if (targetCol >= this.cols) {
            data.isStuck = true; 
        }
        
        // 执行绘制
        if (targetRow < this.rows && targetCol < this.cols && !this.grid[targetRow][targetCol]) {
            this.grid[targetRow][targetCol] = winner;
            this.renderMarker(targetRow, targetCol, winner);
            
            // 更新当前位置
            data.currRow = targetRow;
            data.currCol = targetCol;
        } else {
            // 无法绘制 (被占或越界) -> 视为受阻 (Dead End)
            data.isStuck = true;
            data.numberMode = true; // 进入数字模式
            
            // 规则：只有列的第2个及以后（clickCnt >= 2）受阻才显示数字
            if (data.clickCnt >= 2) {
                this.renderNumber(data.currCol, data.clickCnt);
            }
        }
    }

    addMarkerBigRoad(winner) {
        const data = this.colorData;
        let movedDown = false;
        let movedRight = false;

        // 判断是否切换颜色（新列）
        if (winner !== data.lastColor) {
            if (data.lastColor !== null) {
                data.lastStartCol = data.startCol;
            } else {
                data.lastStartCol = -1;
            }
            data.startCol = data.lastStartCol + 1;
            data.currRow = 0;
            data.currCol = data.startCol;
            data.clickCnt = 0;
            data.turned = false;
            data.isStuck = false;
            data.numShowCount = 0;
            data.numberMode = false;
            data.lastColor = winner;
        }

        data.clickCnt++;

        // 计算目标位置
        let targetRow = data.currRow;
        let targetCol = data.currCol;

        if (data.clickCnt === 1) {
            targetRow = 0;
            targetCol = data.startCol;
            movedRight = true; // 新列的首手视为向右开始
        } else {
            if (!data.turned) {
                const nextRow = data.currRow + 1;
                const nextCol = data.currCol;
                if (this.isOccupied(nextRow, nextCol)) {
                    data.turned = true;
                    targetRow = data.currRow;
                    targetCol = data.currCol + 1;
                    movedRight = true;
                } else {
                    targetRow = nextRow;
                    targetCol = nextCol;
                    movedDown = true;
                }
            } else {
                targetRow = data.currRow;
                targetCol = data.currCol + 1;
                movedRight = true;
            }
        }

        if (targetCol >= this.cols) {
            data.isStuck = true;
        }

        if (targetRow < this.rows && targetCol < this.cols && !this.grid[targetRow][targetCol]) {
            this.grid[targetRow][targetCol] = winner;
            this.renderMarker(targetRow, targetCol, winner);
            // 更新当前位置
            data.currRow = targetRow;
            data.currCol = targetCol;
        } else {
             // 无法绘制 (被占或越界) -> 视为受阻
             data.isStuck = true;
             data.numberMode = true;
             // 规则：只有列的第2个及以后（clickCnt >= 2）受阻才显示数字
             if (data.clickCnt >= 2) {
                 this.renderNumber(data.currCol, data.clickCnt);
             }
        }

        // 更新列模型（忽略和）
        if (winner === 'banker' || winner === 'player') {
            if (movedRight) {
                this.currentColumnIndex++;
                this.columns[this.currentColumnIndex] = [];
            }
            // 保证列索引有效
            if (this.currentColumnIndex < 0) {
                this.currentColumnIndex = 0;
                this.columns[this.currentColumnIndex] = [];
            }
            this.columns[this.currentColumnIndex].push(winner);
        }

        return { movedDown, movedRight, colIndex: targetCol, rowIndex: targetRow };
    }
    
    renderMarker(r, c, winner) {
        // 查找单元格
        const index = r * this.cols + c;
        const cell = this.container.children[index];
        if (!cell) return;
        
        const marker = document.createElement('div');
        marker.className = 'marker';
        
        if (this.type === 'dalu') {
            marker.classList.add(winner === 'banker' ? 'red-circle' : 'blue-circle');
        } else if (this.type === 'dayan') {
            marker.classList.add(winner === 'banker' ? 'dayan-red' : 'dayan-blue');
        } else if (this.type === 'small') {
            marker.classList.add(winner === 'banker' ? 'small-red' : 'small-blue');
        } else if (this.type === 'cockroach') {
            marker.classList.add(winner === 'banker' ? 'cockroach-red' : 'cockroach-blue');
        }
        
        cell.appendChild(marker);
    }
    
    renderNumber(col, num) {
        this.colorData.numShowCount++;
        
        // 找到 Row 0, Col = col 的单元格
        const index = 0 * this.cols + col;
        const cell = this.container.children[index];
        if (!cell) return;
        
        let numTag = cell.querySelector('.num-tag');
        if (!numTag) {
            numTag = document.createElement('div');
            numTag.className = 'num-tag';
            cell.appendChild(numTag);
        }
        
        // 样式
        // 颜色
        numTag.classList.remove('num-banker', 'num-player');
        numTag.classList.add(this.colorData.lastColor === 'banker' ? 'num-banker' : 'num-player');
        
        // 大小
        numTag.classList.remove('num-tag-14', 'num-tag-12', 'small-num');
        if (this.type === 'dalu') {
            numTag.classList.add('num-tag-14');
        } else {
            // 下三路
            if (this.colorData.numShowCount === 1) {
                numTag.classList.add('num-tag-12');
            } else {
                numTag.classList.add('small-num'); // 6px
            }
        }
        
        numTag.textContent = num;
    }

    firstEmptyRow(col) {
        for (let r = 0; r < this.rows; r++) {
            if (!this.grid[r][col]) return r;
        }
        return -1;
    }

    derivedColorDownAt(col, row) {
        // L：左手边同一行是否存在圆圈
        const hasLeft = col - 1 >= 0 && !!this.grid[row][col - 1];
        // U：上方是否存在圆圈
        const hasUp = row - 1 >= 0 && !!this.grid[row - 1][col];
        // FE：是否为该列的第一个空圈（派生列的行0）
        const fe = row === 0;

        // 规则：
        // 1) 有左手边对等圆圈（不同颜色要求在实现中无法判定当前颜色前置，按“有左手边对等圆圈”处理）→ 红
        // 2) 无左、且有上、且是本列第一个空圈 → 蓝
        // 3) 无左、且非本列第一个空圈 → 红
        if (hasLeft) return 'banker'; // 红
        if (!hasLeft && hasUp && fe) return 'player'; // 蓝
        return 'banker'; // 红
    }

    invertColor(color) {
        return color === 'banker' ? 'player' : 'banker';
    }

    computeDerivedColorFromBigRoad(bigRoad, colIndex, rowIndex, isDown, targetCol, targetRow) {
        const offset = this.type === 'dayan' ? 1 : this.type === 'small' ? 2 : 3;
        let color;

        if (isDown) {
            const leftCol = colIndex - offset;
            const hasLeftInBig = leftCol >= 0 && !!bigRoad.grid[rowIndex]?.[leftCol];
            const hasUpInBig = rowIndex - 1 >= 0 && !!bigRoad.grid[rowIndex - 1]?.[colIndex];
            
            const feDerived = leftCol >= 0 && rowIndex - 1 >= 0 && !!bigRoad.grid[rowIndex - 1]?.[leftCol];

            if (hasLeftInBig) {
                color = 'banker'; // 红
            } else if (!hasLeftInBig && hasUpInBig && feDerived) {
                color = 'player'; // 蓝
            } else {
                color = 'banker'; // 红
            }
        } else {
            // 向右（换列）规则：
            // 基于列长度对比 (标准规则)
            // 比较“当前列”（刚刚完成的那一列，colIndex - 1）与“参考列”（current - offset）
            const currentColumnIdx = colIndex - 1;
            const prevColumnIdx = currentColumnIdx - offset;
            
            // 获取列长度（注意：bigRoad.columns 存储的是逻辑长度，忽略和）
            const lenCurr = bigRoad.columns[currentColumnIdx]?.length || 0;
            const lenPrev = bigRoad.columns[prevColumnIdx]?.length || 0;
            
            // 标准规则：
            // 长度相同 (齐头) -> 红
            // 长度不同 (不齐) -> 蓝
            if (lenCurr === lenPrev) {
                color = 'banker'; // 红
            } else {
                color = 'player'; // 蓝
            }
        }
        return color;
    }

    placeDerivedByBigRoadDirection(isDown, bigRoadInfo) {
        // 预判新列的颜色（假设新列首手，row=0）
        const newColIndex = this.colorData.startCol + 1;
        const colorIfNewCol = this.computeDerivedColorFromBigRoad(
            roads.dalu,
            bigRoadInfo.colIndex,
            bigRoadInfo.rowIndex,
            isDown,
            newColIndex,
            0
        );
        const lastColor = this.colorData.lastColor;

        // 决定是否换列：若与上次颜色不同，则开启新列；否则在当前列继续
        let targetCol, row, color;
        
        // 如果是该路单的第一次绘制（lastColor === null），强制归零
        if (lastColor === null) {
             this.colorData.startCol = 0;
             this.colorData.currCol = 0;
             this.colorData.currRow = 0;
             this.colorData.lastStartCol = -1;
        }

        if (lastColor === null || colorIfNewCol !== lastColor) {
            // 切换颜色 -> 新列起始
            this.colorData.lastStartCol = this.colorData.startCol;
            this.colorData.startCol = this.colorData.lastStartCol + 1;
            
            // 修正：如果是第一次绘制（lastColor was null），startCol 应该是 0，而不是 lastStartCol(-1) + 1 = 0.
            // Wait, logic above: if lastColor is null, startCol=0, lastStartCol=-1.
            // Then here: lastStartCol(which is -1) + 1 = 0. Correct.
            // BUT, if startCol was already set to something else by global logic?
            // Yes, we forced it to 0 above.
            
            // 特殊修正：如果是第一次绘制，确保 startCol 为 0 (覆盖上面的 +1 逻辑，虽然结果也是 0)
            if (lastColor === null) {
                this.colorData.startCol = 0;
            }
            
            targetCol = this.colorData.startCol;
            row = 0;
            this.colorData.currCol = targetCol;
            this.colorData.currRow = 0;
            this.colorData.clickCnt = 1;
            this.colorData.turned = false;
            color = colorIfNewCol;
        } else {
            // 同色 -> 优先向下，受阻则向右（拐弯）
            let nextRow = this.colorData.currRow + 1;
            let nextCol = this.colorData.currCol;
            
            if (this.colorData.turned || this.isOccupied(nextRow, nextCol)) {
                this.colorData.turned = true;
                // 拐弯：行不变，列加1
                targetCol = this.colorData.currCol + 1;
                row = this.colorData.currRow;
            } else {
                // 正常向下
                targetCol = nextCol;
                row = nextRow;
            }
            
            if (targetCol >= this.cols) return; // 超出边界

            color = this.computeDerivedColorFromBigRoad(
                roads.dalu,
                bigRoadInfo.colIndex,
                bigRoadInfo.rowIndex,
                isDown,
                targetCol,
                row
            );
            this.colorData.currCol = targetCol;
            this.colorData.currRow = row;
            this.colorData.clickCnt = (this.colorData.clickCnt || 0) + 1;
        }

        // 放置
        this.grid[row][targetCol] = color;
        this.renderMarker(row, targetCol, color);

        // 数字显示：同色横向第一次显示
        if (this.colorData.lastColor === color && this.colorData.turned) {
            this.renderNumber(targetCol, (this.colorData.numShowCount || 0) + 1);
        } else {
            // 新颜色或纵向，不显示数字计数（重置计数）
            this.colorData.numShowCount = 0;
        }

        // 更新状态
        this.colorData.lastColor = color;
        this.colorData.currRow = row;
        this.colorData.currCol = targetCol;
    }
}

// 珠仔路类 (简单)
class BeadRoad {
    constructor(id, config) {
        this.container = document.getElementById(id);
        this.rows = config.rows;
        this.cols = config.cols;
        this.initDOM();
    }
    
    initDOM() {
        this.container.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell-zhuzailu cell-dalu';
                cell.dataset.row = r;
                cell.dataset.col = c;
                this.container.appendChild(cell);
            }
        }
    }
    
    addMarker(winner, text) {
        if (zhuzailuIndex >= 90) return; // Stop
        
        const col = Math.floor(zhuzailuIndex / 6);
        const row = zhuzailuIndex % 6;
        
        const index = row * this.cols + col; 
        const cell = this.container.children[index];
        if (cell) {
            const marker = document.createElement('div');
            marker.className = `bead-marker bead-${winner}`;
            const span = document.createElement('span');
            span.className = 'bead-text';
            span.textContent = text;
            marker.appendChild(span);
            cell.appendChild(marker);
        }
        
        zhuzailuIndex++;
    }
}

// 初始化
const roads = {};
let beadRoad;
let game;

document.addEventListener('DOMContentLoaded', () => {
    roads.dalu = new RoadMap('dalu', CONFIG.dalu);
    roads.dayan = new RoadMap('dayan', CONFIG.dayan);
    roads.xiaolu = new RoadMap('xiaolu', CONFIG.xiaolu);
    roads.zhanglang = new RoadMap('zhanglang', CONFIG.zhanglang);
    
    beadRoad = new BeadRoad('zhuzailu', CONFIG.zhuzailu);
    
    // Initialize Language
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateLanguage(e.target.value);
        });
    });
    // Set initial language
    updateLanguage('zh-CN');
    
    // 初始化时显示弹窗，不直接初始化游戏
    const modal = document.getElementById('settings-modal');
    const btnStart = document.getElementById('btn-start-game');
    
    // 格式化输入金额
    const buyinInput = document.getElementById('setting-buyin');
    buyinInput.addEventListener('input', function(e) {
        // 移除所有非数字字符
        let value = this.value.replace(/\D/g, '');
        if (value) {
            // 添加千位分隔符
            this.value = parseInt(value).toLocaleString('en-US');
        } else {
            this.value = '';
        }
    });

    btnStart.addEventListener('click', () => {
        // 获取设置
        const buyinRaw = document.getElementById('setting-buyin').value.replace(/,/g, '');
        const buyinAmount = parseInt(buyinRaw) || 0;
        const limitStr = document.getElementById('setting-limit').value;
        const [minLimit, maxLimit] = limitStr.split('-').map(Number);
        
        const commissionMode = document.querySelector('input[name="commission"]:checked').value;
        const lucky6 = document.getElementById('setting-lucky6').checked;
        const lucky7 = document.getElementById('setting-lucky7').checked;
        const superLucky7 = document.getElementById('setting-super-lucky7').checked;
        
        if (game) {
            // Update existing game
            if (buyinAmount > 0) {
                game.balance += buyinAmount;
                game.totalBuyin = (game.totalBuyin || 0) + buyinAmount;
                game.updateBalanceUI();
            }
            
            // Update config
            game.config.minLimit = minLimit;
            game.config.maxLimit = maxLimit;
            game.config.commissionMode = commissionMode;
            game.config.sideBets.lucky6 = lucky6;
            game.config.sideBets.lucky7 = lucky7;
            game.config.sideBets.superLucky7 = superLucky7;
            
            // Re-apply settings to UI
            game.initUI(); 
        } else {
            // New Game
            const initialBalance = buyinAmount || 10000;
            const config = {
                balance: initialBalance,
                minLimit,
                maxLimit,
                commissionMode,
                sideBets: {
                    lucky6,
                    lucky7,
                    superLucky7
                }
            };
            game = new BaccaratGame(config);
        }
        
        // Update Table Limit Display
        const limitDisplay = document.getElementById('table-limit-display');
        if (limitDisplay) {
            // Format numbers: 25 -> 25, 1500000 -> 150万
            const formatLimit = (num) => {
                if (num >= 10000) return (num / 10000) + '万';
                return num;
            };
            limitDisplay.textContent = `台红: ${formatLimit(minLimit)}-${formatLimit(maxLimit)}`;
        }

        modal.style.display = 'none';
    });

    // Settings Toggle Button
    const btnSettingsToggle = document.getElementById('btn-settings-toggle');
    if (btnSettingsToggle) {
        btnSettingsToggle.addEventListener('click', () => {
            updateLanguage(currentLang);
            if (game) {
                const buyinInput = document.getElementById('setting-buyin');
                if (buyinInput) buyinInput.value = '0';
            }
            modal.style.display = 'flex';
        });
    }
    
    // 绑定重置按钮
    /*
    document.getElementById('btn-reset').addEventListener('click', () => {
        if(confirm('确定要清除所有路单吗？')) {
            location.reload();
        }
    });
    */
});

// 游戏逻辑类
class BaccaratGame {
    constructor(config) {
        this.config = config || {
            balance: 10000,
            minLimit: 25,
            maxLimit: 1500000,
            commissionMode: 'classic',
            sideBets: { lucky6: false, lucky7: false }
        };
        
        this.balance = this.config.balance;
        this.totalBuyin = this.config.balance; // Track total buy-in for color logic
        
        this.deck = [];
        this.bet = {
            player: 0,
            banker: 0,
            tie: 0,
            playerPair: 0,
            bankerPair: 0,
            // Side Bets
            lucky6: 0,
            lucky6_2: 0,
            lucky6_3: 0,
            lucky7: 0,
            superLucky7: 0
        };
        
        this.currentChip = 25;
        this.isDealing = false;
        this.lastBet = null; // Store last bet for rebet functionality
        
        this.stats = {
            total: 0,
            banker: 0,
            player: 0,
            tie: 0,
            bankerPair: 0,
            playerPair: 0,
            lucky6: 0,
            lucky7: 0
        };

        this.initUI();
        this.initDeck();
        this.bindEvents();
        this.updateBalanceUI();
        this.updateDealButtonState();
        this.updateClearButtonState();
    }
    
    initUI() {
        // Set Theme based on commission mode
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            if (this.config.commissionMode === 'super6') {
                gameArea.classList.add('theme-super6');
            } else {
                gameArea.classList.remove('theme-super6');
            }
        }

        // Update Banker Odds Label
        const bankerOdds = document.getElementById('banker-odds');
        if (this.config.commissionMode === 'super6') {
            bankerOdds.textContent = '1:1 (6点0.5)';
        } else {
            bankerOdds.textContent = '0.95:1';
        }
        
        // Toggle Lucky 7 visibility based on config (optional, currently always shown or controlled by CSS)
        // If we want to hide it if not enabled in settings:
        const btnLucky6 = document.getElementById('bet-lucky6');
        const btnLucky6_2 = document.getElementById('bet-lucky6-2');
        const btnLucky6_3 = document.getElementById('bet-lucky6-3');
        const btnLucky7 = document.getElementById('bet-lucky7');
        const btnSuperLucky7 = document.getElementById('bet-super-lucky7');
        
        if (btnLucky6) {
            btnLucky6.style.display = this.config.sideBets.lucky6 ? 'flex' : 'none';
        }
        if (btnLucky6_2) {
            btnLucky6_2.style.display = this.config.sideBets.lucky6 ? 'flex' : 'none';
        }
        if (btnLucky6_3) {
            btnLucky6_3.style.display = this.config.sideBets.lucky6 ? 'flex' : 'none';
        }
        
        if (btnLucky7) {
            btnLucky7.style.display = this.config.sideBets.lucky7 ? 'flex' : 'none';
        }
        
        if (btnSuperLucky7) {
            btnSuperLucky7.style.display = this.config.sideBets.superLucky7 ? 'flex' : 'none';
        }
        
        this.updateStatsUI();
    }
    
    initDeck() {
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0];
        
        this.deck = [];
        // 8副牌
        for (let i = 0; i < 8; i++) {
            for (let s = 0; s < suits.length; s++) {
                for (let r = 0; r < ranks.length; r++) {
                    this.deck.push({
                        suit: suits[s],
                        rank: ranks[r],
                        value: values[r],
                        isRed: suits[s] === '♥' || suits[s] === '♦'
                    });
                }
            }
        }
        this.shuffle();
    }
    
    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        // 切牌（简单模拟）
        this.deck.splice(0, Math.floor(Math.random() * 20) + 10);
    }
    
    bindEvents() {
        // 筹码选择
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.currentChip = parseInt(e.currentTarget.dataset.val);
            });
        });
        // 默认选中第一个
        document.querySelector('.chip').click();
        
        // Chip scrolling
        const chipScrollArea = document.getElementById('chips-scroll-area');
        const btnLeft = document.getElementById('chip-scroll-left');
        const btnRight = document.getElementById('chip-scroll-right');
        
        if (chipScrollArea && btnLeft && btnRight) {
            btnLeft.onclick = () => {
                chipScrollArea.scrollBy({ left: -100, behavior: 'smooth' });
            };
            btnRight.onclick = () => {
                chipScrollArea.scrollBy({ left: 100, behavior: 'smooth' });
            };
        }

        // 下注按钮
        const betMap = {
            'bet-player': 'player',
            'bet-banker': 'banker',
            'bet-tie': 'tie',
            'bet-player-pair': 'playerPair',
            'bet-banker-pair': 'bankerPair',
            'bet-lucky6': 'lucky6',
            'bet-lucky6-2': 'lucky6_2',
            'bet-lucky6-3': 'lucky6_3',
            'bet-lucky7': 'lucky7',
            'bet-super-lucky7': 'superLucky7'
        };
        
        for (const [id, type] of Object.entries(betMap)) {
            const btn = document.getElementById(id);
            if (btn) {
                // Remove old listeners (if any, though this is new instance)
                // Use a wrapper to ensure binding
                btn.onclick = () => this.placeBet(type, btn);
            }
        }
        
        // 功能按钮
        document.getElementById('btn-clear').onclick = () => this.clearBets();
        document.getElementById('btn-deal').onclick = () => this.deal();
    }
    
    updateBalanceUI() {
        const el = document.getElementById('balance-amount');
        if (!el) return;
        
        el.textContent = this.balance.toLocaleString();
        
        // Dynamic Color Logic
        // 总买入金额+-40%为白色, >-40%~-80%为黃色, >-80%~-100%为紅色, >40%~100%为綠色
        const profit = this.balance - this.totalBuyin;
        let percent = 0;
        if (this.totalBuyin > 0) {
            percent = profit / this.totalBuyin;
        }
        
        el.classList.remove('text-color-white', 'text-color-yellow', 'text-color-red', 'text-color-green');
        
        if (percent > 0.4) {
            el.classList.add('text-color-green');
        } else if (percent < -0.8) {
            el.classList.add('text-color-red');
        } else if (percent < -0.4) {
            el.classList.add('text-color-yellow');
        } else {
            el.classList.add('text-color-white');
        }
    }

    updateStats(winner, pPair, bPair, isLucky6, isLucky7) {
        this.stats.total++;
        if (winner === 'banker') this.stats.banker++;
        if (winner === 'player') this.stats.player++;
        if (winner === 'tie') this.stats.tie++;
        
        if (pPair) this.stats.playerPair++;
        if (bPair) this.stats.bankerPair++;
        
        if (isLucky6) this.stats.lucky6++;
        if (isLucky7) this.stats.lucky7++;
        
        this.updateStatsUI();
    }
    
    updateStatsUI() {
        const ids = {
            total: 'stat-total',
            banker: 'stat-banker',
            player: 'stat-player',
            tie: 'stat-tie',
            bankerPair: 'stat-bpair',
            playerPair: 'stat-ppair',
            lucky6: 'stat-lucky6',
            lucky7: 'stat-lucky7'
        };
        for (const [key, id] of Object.entries(ids)) {
            const el = document.getElementById(id);
            if (el) el.textContent = this.stats[key];
        }
    }
    
    updateDealButtonState() {
        const totalBet = Object.values(this.bet).reduce((a, b) => a + b, 0);
        const btnDeal = document.getElementById('btn-deal');
        if (btnDeal) {
            btnDeal.textContent = totalBet > 0 ? TRANSLATIONS[currentLang]['btn_deal'] : TRANSLATIONS[currentLang]['btn_fly'];
        }
    }

    updateClearButtonState() {
        const totalBet = Object.values(this.bet).reduce((a, b) => a + b, 0);
        const btnClear = document.getElementById('btn-clear');
        if (btnClear) {
            btnClear.textContent = totalBet > 0 ? TRANSLATIONS[currentLang]['btn_clear'] : TRANSLATIONS[currentLang]['btn_rebet'];
        }
    }

    placeBet(type, btnElement) {
        if (this.isDealing) return;
        
        // Mutually exclusive Player/Banker
        if (type === 'player' && this.bet.banker > 0) {
            alert('庄和闲不能同时下注');
            return;
        }
        if (type === 'banker' && this.bet.player > 0) {
            alert('庄和闲不能同时下注');
            return;
        }

        const amount = this.currentChip;
        
        // 检查余额
        if (this.balance < amount) {
            alert('余额不足！');
            return;
        }
        
        // 检查台红 (单注限红)
        // 假设每个下注区都受此限制，或者只有庄闲？通常是单注。
        if (this.bet[type] + amount > this.config.maxLimit) {
            alert(`超过单注限红: ${this.config.maxLimit}`);
            return;
        }
        
        // 扣除余额
        this.balance -= amount;
        this.bet[type] += amount;
        
        // 更新UI
        this.updateBalanceUI();
        this.updateBetMarker(btnElement, this.bet[type]);
        this.updateDealButtonState();
        this.updateClearButtonState();
        btnElement.classList.add('active');
    }
    
    updateBetMarker(btn, amount) {
        let marker = btn.querySelector('.bet-chip-marker');
        if (!marker) {
            marker = document.createElement('div');
            marker.className = 'bet-chip-marker';
            btn.appendChild(marker);
        }
        marker.textContent = amount;
        if (amount === 0) marker.remove();
    }
    
    clearBets() {
        if (this.isDealing) return;
        
        const totalBet = Object.values(this.bet).reduce((a, b) => a + b, 0);

        if (totalBet > 0) {
            // 清除逻辑
            for (const key in this.bet) {
                this.balance += this.bet[key];
                this.bet[key] = 0;
            }
            this.updateBalanceUI();
            
            document.querySelectorAll('.bet-btn').forEach(btn => {
                btn.classList.remove('active');
                const marker = btn.querySelector('.bet-chip-marker');
                if (marker) marker.remove();
            });
            this.updateDealButtonState();
        } else {
            // 重下逻辑 (Rebet)
            if (!this.lastBet) return;

            const rebetTotal = Object.values(this.lastBet).reduce((a, b) => a + b, 0);
            if (rebetTotal === 0) return;

            if (this.balance < rebetTotal) {
                alert('余额不足，无法重下');
                return;
            }

            // 扣除余额并应用下注
            this.balance -= rebetTotal;
            this.bet = { ...this.lastBet };
            this.updateBalanceUI();

            // 更新UI
            const betMap = {
                'player': 'bet-player',
                'banker': 'bet-banker',
                'tie': 'bet-tie',
                'playerPair': 'bet-player-pair',
                'bankerPair': 'bet-banker-pair',
                'lucky6': 'bet-lucky6',
                'lucky6_2': 'bet-lucky6-2',
                'lucky6_3': 'bet-lucky6-3',
                'lucky7': 'bet-lucky7',
                'superLucky7': 'bet-super-lucky7'
            };

            for (const [type, id] of Object.entries(betMap)) {
                if (this.bet[type] > 0) {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.classList.add('active');
                        this.updateBetMarker(btn, this.bet[type]);
                    }
                }
            }
            this.updateDealButtonState();
        }
        this.updateClearButtonState();
    }
    
    async deal() {
        if (this.isDealing) return;
        
        // Hide result overlay
        const overlay = document.getElementById('result-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        // 保存上一局下注记录，用于重下
        this.lastBet = { ...this.bet };

        // 检查是否有下注 (可选)
        // if (Object.values(this.bet).reduce((a, b) => a + b, 0) === 0) {
        //     alert('请先下注');
        //     return;
        // }
        
        this.isDealing = true;
        document.getElementById('btn-deal').disabled = true;
        
        // 清理桌面
        this.clearTable();
        
        const pCards = [];
        const bCards = [];
        
        // 初始两张
        await this.drawCard('player', pCards);
        await this.drawCard('banker', bCards);
        await this.drawCard('player', pCards);
        await this.drawCard('banker', bCards);
        
        let pScore = this.calcScore(pCards);
        let bScore = this.calcScore(bCards);
        
        this.updateScore('player', pScore);
        this.updateScore('banker', bScore);
        
        // 补牌规则
        let pDraw = false;
        let bDraw = false;
        
        const natural = pScore >= 8 || bScore >= 8;
        
        if (!natural) {
            // 闲家补牌：0-5补
            if (pScore <= 5) {
                await this.drawCard('player', pCards);
                pDraw = true;
                pScore = this.calcScore(pCards);
                this.updateScore('player', pScore);
            }
            
            // 庄家补牌
            if (!pDraw) {
                // 闲家没补，庄家 0-5 补
                if (bScore <= 5) {
                    bDraw = true;
                }
            } else {
                // 闲家补了，庄家看闲家第三张
                const p3 = pCards[2].value; // 0-9
                if (bScore <= 2) bDraw = true;
                else if (bScore === 3 && p3 !== 8) bDraw = true;
                else if (bScore === 4 && (p3 >= 2 && p3 <= 7)) bDraw = true;
                else if (bScore === 5 && (p3 >= 4 && p3 <= 7)) bDraw = true;
                else if (bScore === 6 && (p3 === 6 || p3 === 7)) bDraw = true;
            }
            
            if (bDraw) {
                await this.drawCard('banker', bCards);
                bScore = this.calcScore(bCards);
                this.updateScore('banker', bScore);
            }
        }
        
        // 结算
        setTimeout(() => {
            this.settle(pScore, bScore, pCards, bCards);
            this.isDealing = false;
            document.getElementById('btn-deal').disabled = false;
            this.updateDealButtonState();
        }, 500);
    }
    
    async drawCard(who, handArr) {
        if (this.deck.length < 10) this.initDeck(); // 洗牌
        
        const card = this.deck.pop();
        handArr.push(card);
        
        // 渲染卡片
        const container = document.getElementById(`cards-${who}`);
        const cardEl = document.createElement('div');
        
        // 第3张牌（补牌）添加特殊样式
        const isThird = handArr.length === 3;
        cardEl.className = `card ${isThird ? 'horizontal' : ''}`;
        
        // Calculate Sprite Position
        // Image Rows: 0:Club, 1:Diamond, 2:Heart, 3:Spade
        const suitMap = {
            '♠': 3, // Spades -> Row 4 (Index 3)
            '♥': 2, // Hearts -> Row 3 (Index 2)
            '♣': 0, // Clubs -> Row 1 (Index 0)
            '♦': 1  // Diamonds -> Row 2 (Index 1)
        };
        
        const rankMap = {
            'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
            '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12
        };
        
        const suitIdx = suitMap[card.suit];
        const rankIdx = rankMap[card.rank];
        
        const xPos = (rankIdx * 100 / 12).toFixed(4) + '%';
        const yPos = (suitIdx * 100 / 4).toFixed(4) + '%';
        
        cardEl.style.backgroundPosition = `${xPos} ${yPos}`;

        // 动画
        cardEl.style.opacity = '0';
        cardEl.style.transform = 'translateY(-20px)';
        container.appendChild(cardEl);
        
        // 触发重绘
        cardEl.offsetHeight;
        
        cardEl.style.transition = 'all 0.3s';
        cardEl.style.opacity = '1';
        cardEl.style.transform = 'translateY(0)';
        
        return new Promise(resolve => setTimeout(resolve, 600)); // 发牌间隔
    }
    
    calcScore(cards) {
        const sum = cards.reduce((acc, c) => acc + c.value, 0);
        return sum % 10;
    }
    
    updateScore(who, score) {
        document.getElementById(`score-${who}`).textContent = score;
    }
    
    clearTable() {
        document.getElementById('cards-player').innerHTML = '';
        document.getElementById('cards-banker').innerHTML = '';
        document.getElementById('score-player').textContent = '0';
        document.getElementById('score-banker').textContent = '0';
    }
    
    settle(pScore, bScore, pCards, bCards) {
        let winner = 'tie';
        if (pScore > bScore) winner = 'player';
        if (bScore > pScore) winner = 'banker';
        
        // 计算输赢
        let winnings = 0;
        let totalBet = 0;
        
        // 1. 闲 (Player) 1:1
        if (this.bet.player > 0) {
            totalBet += this.bet.player;
            if (winner === 'player') {
                winnings += this.bet.player * 2;
            } else if (winner === 'tie') {
                winnings += this.bet.player; // 和局退回
            }
        }
        
        // 2. 庄 (Banker)
        if (this.bet.banker > 0) {
            totalBet += this.bet.banker;
            if (winner === 'banker') {
                let odds = 0.95;
                if (this.config.commissionMode === 'super6') {
                    if (bScore === 6) odds = 0.5;
                    else odds = 1.0;
                }
                winnings += this.bet.banker * (1 + odds);
            } else if (winner === 'tie') {
                winnings += this.bet.banker; // 和局退回
            }
        }
        
        // 3. 和 (Tie) 1:8
        if (this.bet.tie > 0) {
            totalBet += this.bet.tie;
            if (winner === 'tie') {
                winnings += this.bet.tie * 9;
            }
        }
        
        // 4. 对子 (Pairs) 1:11
        const pPair = pCards[0].rank === pCards[1].rank;
        const bPair = bCards[0].rank === bCards[1].rank;
        
        if (this.bet.playerPair > 0) {
            totalBet += this.bet.playerPair;
            if (pPair) winnings += this.bet.playerPair * 12;
        }
        if (this.bet.bankerPair > 0) {
            totalBet += this.bet.bankerPair;
            if (bPair) winnings += this.bet.bankerPair * 12;
        }
        
        // 5. 幸运6 (Lucky 6) - 庄6点赢
        const bankerWin6 = (winner === 'banker' && bScore === 6);
        const bankerCardsCount = bCards.length;
        
        // 通用 Lucky 6 (2张1:12, 3张1:20)
        if (this.bet.lucky6 > 0) {
            totalBet += this.bet.lucky6;
            if (bankerWin6) {
                const odds = bankerCardsCount === 2 ? 12 : 20;
                winnings += this.bet.lucky6 * (1 + odds);
            }
        }
        
        // 2张 Lucky 6 (1:22)
        if (this.bet.lucky6_2 > 0) {
            totalBet += this.bet.lucky6_2;
            if (bankerWin6 && bankerCardsCount === 2) {
                winnings += this.bet.lucky6_2 * 23;
            }
        }
        
        // 3张 Lucky 6 (1:50)
        if (this.bet.lucky6_3 > 0) {
            totalBet += this.bet.lucky6_3;
            if (bankerWin6 && bankerCardsCount === 3) {
                winnings += this.bet.lucky6_3 * 51;
            }
        }
        
        // 6. 幸运7 (Lucky 7) - 闲7点赢 (条件：闲7赢)
        // 7. 超级幸运7 (Super Lucky 7) - 闲7赢庄6
        
        const playerWin7 = (winner === 'player' && pScore === 7);
        const superCondition = (playerWin7 && bScore === 6); // 闲7赢庄6
        
        const playerCardsCount = pCards.length;
        const totalCardsCount = pCards.length + bCards.length;
        
        // 幸运7 (2张1:6, 3张1:15)
        if (this.bet.lucky7 > 0) {
            totalBet += this.bet.lucky7;
            if (playerWin7) {
                // 仅闲家手牌张数
                const odds = playerCardsCount === 2 ? 6 : 15;
                winnings += this.bet.lucky7 * (1 + odds);
            }
        }
        
        // 超级幸运7 (4张1:30, 5张1:40, 6张1:100)
        if (this.bet.superLucky7 > 0) {
            totalBet += this.bet.superLucky7;
            if (superCondition) {
                let odds = 0;
                if (totalCardsCount === 4) odds = 30;
                else if (totalCardsCount === 5) odds = 40;
                else if (totalCardsCount === 6) odds = 100;
                
                if (odds > 0) winnings += this.bet.superLucky7 * (1 + odds);
            }
        }
        
        // Show Result Overlay
        let resultText = '';
        if (winner === 'tie') {
            resultText = '和';
        } else if (winner === 'banker') {
            resultText = bankerWin6 ? '庄赢(幸運6)' : '庄赢';
        } else if (winner === 'player') {
            resultText = playerWin7 ? '闲赢(幸運7)' : '闲赢';
        }
        
        const overlay = document.getElementById('result-overlay');
        if (overlay) {
            overlay.textContent = resultText;
            overlay.classList.remove('hidden');
            
            // Add specific classes for styling
            overlay.className = 'result-overlay'; // Reset classes
            if (winner === 'banker') overlay.classList.add('text-banker');
            else if (winner === 'player') overlay.classList.add('text-player');
            else if (winner === 'tie') overlay.classList.add('text-tie');
            
            // Re-trigger animation
            overlay.style.animation = 'none';
            overlay.offsetHeight; /* trigger reflow */
            overlay.style.animation = 'moveFromCenter 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }

        // Highlight winning buttons
        const winningIds = [];
        if (winner === 'player') winningIds.push('bet-player');
        if (winner === 'banker') winningIds.push('bet-banker');
        if (winner === 'tie') winningIds.push('bet-tie');
        
        if (pPair) winningIds.push('bet-player-pair');
        if (bPair) winningIds.push('bet-banker-pair');
        
        if (bankerWin6) {
            winningIds.push('bet-lucky6');
            if (bankerCardsCount === 2) winningIds.push('bet-lucky6-2');
            if (bankerCardsCount === 3) winningIds.push('bet-lucky6-3');
        }
        
        if (playerWin7) winningIds.push('bet-lucky7');
        
        if (superCondition) winningIds.push('bet-super-lucky7');
        
        winningIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.add('win-flash');
                setTimeout(() => {
                    btn.classList.remove('win-flash');
                }, 1500);
            }
        });
        
        // Update Stats
        this.updateStats(winner, pPair, bPair, bankerWin6, playerWin7);

        // 更新余额
        if (winnings > 0) {
            this.balance += winnings;
            // 简单提示赢钱 (可选)
            // console.log(`You won ${winnings}!`);
        }
        this.updateBalanceUI();
        
        // 更新路单
        handleInput(winner);
        
        // 清除下注（赢的钱已经加回余额，输的已经扣除）
        // 重置下注UI
        this.bet = {
            player: 0, banker: 0, tie: 0, playerPair: 0, bankerPair: 0,
            lucky6: 0, lucky6_2: 0, lucky6_3: 0, lucky7: 0, superLucky7: 0
        };
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.classList.remove('active');
            const marker = btn.querySelector('.bet-chip-marker');
            if (marker) marker.remove();
        });
        this.updateClearButtonState();
    }
}

// 保留原有的 handleInput 用于路单逻辑
function handleInput(type) {
    if (type === 'tie') {
        beadRoad.addMarker('tie', 'T');
    } else {
        // 先让上一手的 enableNext 生效
        ['dayan', 'xiaolu', 'zhanglang'].forEach(k => {
            if (roads[k].enableNext) {
                roads[k].enabled = true;
                roads[k].enableNext = false;
            }
        });

        const info = roads.dalu.addMarker(type);

        if (info && info.movedRight && info.rowIndex === 0) {
            if (info.colIndex === 1) roads.dayan.enableNext = true;
            if (info.colIndex === 2) roads.xiaolu.enableNext = true;
            if (info.colIndex === 3) roads.zhanglang.enableNext = true;
        }

        const isDown = info ? info.movedDown : true;
        if (roads.dayan.enabled && info) roads.dayan.placeDerivedByBigRoadDirection(isDown, info);
        if (roads.xiaolu.enabled && info) roads.xiaolu.placeDerivedByBigRoadDirection(isDown, info);
        if (roads.zhanglang.enabled && info) roads.zhanglang.placeDerivedByBigRoadDirection(isDown, info);
        
        const text = type === 'banker' ? 'B' : 'P';
        beadRoad.addMarker(type, text);
    }
}
