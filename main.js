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
        min_bet: '最低投注',
        max_bet: '最大投注',
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
        min_bet: '最低投注',
        max_bet: '最大投注',
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
        // Dynamic Init Styles
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        const ratio = this.cols / 6.3; // Slight adjustment for borders
        this.container.style.aspectRatio = `${ratio}`;
        this.container.style.overflowX = 'auto';
        this.container.style.scrollbarWidth = 'none';

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
                
                if (c === this.cols - 1) {
                    cell.classList.add('last-col');
                }
                
                this.container.appendChild(cell);
            }
        }
    }

    clear() {
        // Reset Grid Data
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        
        // Reset Logic Data
        this.colorData = {
            lastColor: null, 
            lastStartCol: -1, 
            startCol: 0, 
            currRow: 0, 
            currCol: 0,
            clickCnt: 0, 
            turned: false, 
            isStuck: false, 
            numShowCount: 0, 
            numberMode: false 
        };

        if (this.type === 'dalu') {
            this.columns = [];
            this.currentColumnIndex = -1;
        }

        this.enabled = this.type === 'dalu' || this.type === 'bead' ? true : false;
        this.enableNext = false;

        // Reset DOM (keep current columns size or reset? User implied "add 10 cols when < 3", suggesting dynamic size persists or we check again. 
        // Usually 'Clear' resets the view. But if we reset to 30 cols, we lose the expansion history.
        // However, standard baccarat clears to default.
        // Let's reset DOM to current cols (clearing content) to be safe, or rebuild.
        // initDOM uses this.cols. So if we don't reset this.cols, it keeps size.
        this.initDOM();
    }

    expandGrid(count) {
        const oldCols = this.cols;
        this.cols += count;

        // Expand Grid Data
        for (let r = 0; r < this.rows; r++) {
            for (let i = 0; i < count; i++) {
                this.grid[r].push(null);
            }
        }

        // Expand DOM: Insert 'count' cells at the end of each row
        // The DOM structure is flat: row0...row1...
        // We need to insert after (r * oldCols + oldCols - 1) + (r * count) <-- offset by previous insertions
        // Easier: Select the last cell of each row using data attributes.
        
        // We iterate backwards to avoid messing up indices? No, we can query by data attributes.
        for (let r = 0; r < this.rows; r++) {
            // Find the last cell of this row (which was at oldCols - 1)
            const lastCell = this.container.querySelector(`div[data-row="${r}"][data-col="${oldCols - 1}"]`);
            let referenceNode = lastCell ? lastCell.nextSibling : null;
            
            for (let c = oldCols; c < this.cols; c++) {
                const cell = document.createElement('div');
                if (this.type === 'dalu') cell.className = 'cell-dalu';
                else if (this.type === 'bead') cell.className = 'cell-zhuzailu cell-dalu';
                else cell.className = 'cell-dalu';

                cell.dataset.row = r;
                cell.dataset.col = c;
                
                // Add last-col if it is the last one
                if (c === this.cols - 1) cell.classList.add('last-col');

                if (referenceNode) {
                    this.container.insertBefore(cell, referenceNode);
                } else {
                    this.container.appendChild(cell);
                }
            }
            // Remove last-col from previous last cell
            if (lastCell) lastCell.classList.remove('last-col');
        }

        // Update Styles
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        const ratio = this.cols / 6.3;
        this.container.style.aspectRatio = `${ratio}`;
    }

    isOccupied(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
        return this.grid[r][c] !== null;
    }

    // 添加标记
    // winner: 'banker' | 'player'
    addMarker(winner, pPair, bPair, lucky6, lucky7) {
        // 大路返回落子方向信息，其他路按原逻辑
        if (this.type === 'dalu') {
            return this.addMarkerBigRoad(winner, pPair, bPair, lucky6, lucky7);
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

        // Check for expansion
        if (['dalu', 'dayan', 'small', 'cockroach'].includes(this.type)) {
             if (this.cols - targetCol < 3) {
                 this.expandGrid(10);
             }
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

    getNextBigRoadPosition(winner) {
        const data = { ...this.colorData };
        let movedDown = false;
        let movedRight = false;

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
        }

        data.clickCnt++;
        
        let targetRow = data.currRow;
        let targetCol = data.currCol;

        if (data.clickCnt === 1) {
            targetRow = 0;
            targetCol = data.startCol;
            movedRight = true;
        } else {
            if (!data.turned) {
                const nextRow = data.currRow + 1;
                const nextCol = data.currCol;
                // Use this.isOccupied which reads this.grid (safe as we don't modify grid)
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
        
        return {
            colIndex: targetCol,
            rowIndex: targetRow,
            movedDown: movedDown,
            movedRight: movedRight
        };
    }

    addMarkerBigRoad(winner, pPair, bPair, lucky6, lucky7) {
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

        // Check for expansion
        if (this.cols - targetCol < 3) {
             this.expandGrid(10);
        }

        if (targetRow < this.rows && targetCol < this.cols && !this.grid[targetRow][targetCol]) {
            this.grid[targetRow][targetCol] = winner;
            this.renderMarker(targetRow, targetCol, winner, pPair, bPair, lucky6, lucky7);
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
    
    renderMarker(r, c, winner, pPair, bPair, lucky6, lucky7, text = null) {
        // 查找单元格
        const index = r * this.cols + c;
        const cell = this.container.children[index];
        if (!cell) return;
        
        // 如果有文本（数字2），直接绘制数字
        if (text) {
            const numEl = document.createElement('div');
            numEl.className = 'marker-text';
            numEl.textContent = text;
            
            // 根据赢家颜色设置字体颜色
            if (this.type === 'dayan') {
                numEl.style.color = (winner === 'banker') ? '#d93025' : '#1a73e8'; // red : blue
            } else if (this.type === 'small') {
                numEl.style.color = (winner === 'banker') ? '#d93025' : '#1a73e8';
            } else if (this.type === 'cockroach') {
                numEl.style.color = (winner === 'banker') ? '#d93025' : '#1a73e8';
            }
            
            cell.appendChild(numEl);
            return; // 不画圈，直接返回
        }

        const marker = document.createElement('div');
        marker.className = 'marker';
        
        if (this.type === 'dalu') {
            marker.classList.add(winner === 'banker' ? 'red-circle' : 'blue-circle');
            
            // Add Pair Dots for Big Road
            if (bPair) {
                const dot = document.createElement('div');
                dot.className = 'pair-dot banker';
                marker.appendChild(dot);
            }
            if (pPair) {
                const dot = document.createElement('div');
                dot.className = 'pair-dot player';
                marker.appendChild(dot);
            }
            
            // Lucky 6 / Lucky 7 Logic
            if (winner === 'banker' && lucky6) {
                const num = document.createElement('div');
                num.className = 'lucky-number';
                // User Requirement: Show '2' if 2 cards, '3' if 3 cards
                if (lucky6 === 2) {
                    num.textContent = '2';
                    marker.appendChild(num);
                } else if (lucky6 === 3) {
                    num.textContent = '3';
                    marker.appendChild(num);
                }
            }
            
            if (winner === 'player' && lucky7) {
                 const num = document.createElement('div');
                 num.className = 'lucky-number';
                 // User Requirement: Show '2' if 2 cards, '3' if 3 cards
                 if (lucky7 === 2) {
                     num.textContent = '2';
                     marker.appendChild(num);
                 } else if (lucky7 === 3) {
                     num.textContent = '3';
                     marker.appendChild(num);
                 }
            }
            
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
            // 寻找下一个可用的起始列
            // 通常是 startCol + 1，但如果之前的长龙向右延伸占用了位置，需要跳过
            let nextStart = this.colorData.startCol + 1;
            
            // 安全保护：添加最大迭代次数和扩容检查，防止无限循环
            let loopSafety = 0;
            while (this.isOccupied(0, nextStart)) {
                nextStart++;
                loopSafety++;
                // 如果搜索超过100列，或者超出当前列数，则认为需要扩容或停止
                if (nextStart >= this.cols) {
                     this.expandGrid(10);
                }
                if (loopSafety > 1000) {
                    console.error("Infinite loop detected in placeDerivedByBigRoadDirection");
                    break;
                }
            }
            this.colorData.startCol = nextStart;
            
            // 特殊修正：如果是第一次绘制，确保 startCol 为 0
            if (lastColor === null) {
                this.colorData.startCol = 0;
            }
            
            targetCol = this.colorData.startCol;
            row = 0;
            this.colorData.currCol = targetCol;
            this.colorData.currRow = 0;
            this.colorData.clickCnt = 1; // 计数器重置为1
            this.colorData.turned = false;
            this.colorData.isNumberMode = false;
            color = colorIfNewCol;
        } else {
            // 同色 -> 优先向下，受阻则向右（拐弯）
            let nextRow = this.colorData.currRow + 1;
            let nextCol = this.colorData.currCol;
            let currentCount = (this.colorData.clickCnt || 0) + 1;
            
            // 默认颜色与上一手相同（同色）
            color = lastColor;

            // 1. 如果已经处于数字模式，直接原地更新数字
            if (this.colorData.isNumberMode) {
                // 原地更新，不移动
                this.colorData.clickCnt = currentCount;
                
                // 重新绘制当前格子（更新数字）
                const r = this.colorData.currRow;
                const c = this.colorData.currCol;
                
                const index = r * this.cols + c;
                const cell = this.container.children[index];
                if (cell) {
                    cell.innerHTML = ''; // 清除旧数字
                    // 绘制新数字 (currentCount)
                    this.renderMarker(r, c, color, null, null, null, null, String(currentCount));
                }
                return; // 完成，退出
            }

            // 2. 检查是否触发死路（双重受阻） -> 进入数字模式
            // 检查向下是否受阻
            const downBlocked = this.isOccupied(nextRow, nextCol);
            
            // 检查向右是否受阻 (注意：向右是在当前行 currRow，列 currCol + 1)
            const rightBlocked = this.isOccupied(this.colorData.currRow, this.colorData.currCol + 1);
            
            // 触发死路/数字逻辑：
            // 情况A: 双重受阻 (向下且向右都堵死) -> 任何时候都触发
            // 情况B: 第二手向下受阻 (Row 0 -> Row 1 受阻) -> 强制触发数字模式，禁止在第一行横向拐弯 (防止第一行出现左右同色)
            
            const isDoubleBlocked = downBlocked && rightBlocked;
            const isSecondBlocked = currentCount === 2 && downBlocked;

            if (isDoubleBlocked || isSecondBlocked) {
                // 触发死路逻辑 -> 开启数字模式
                this.colorData.isNumberMode = true;
                this.colorData.clickCnt = currentCount;

                // 回溯修改当前格子（即上一个圈的位置）
                const r = this.colorData.currRow;
                const c = this.colorData.currCol;
                
                const index = r * this.cols + c;
                const cell = this.container.children[index];
                if (cell) {
                    cell.innerHTML = ''; // 清除原来的圈
                    // 绘制数字 (currentCount，通常为2)
                    this.renderMarker(r, c, color, null, null, null, null, String(currentCount));
                }
                // 位置保持不变
                return;
            }

            if (this.colorData.turned || downBlocked) {
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

            this.colorData.currCol = targetCol;
            this.colorData.currRow = row;
            this.colorData.clickCnt = currentCount;
        }

        // 放置
        this.grid[row][targetCol] = color;
        this.renderMarker(row, targetCol, color);
        // 移除旧的数字显示逻辑 (renderNumber) 以免冲突


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

    clear() {
        zhuzailuIndex = 0;
        this.container.innerHTML = '';
        this.initDOM();
    }
    
    addMarker(winner, text, pPair, bPair) {
        if (zhuzailuIndex >= 90) return; // Stop
        
        const col = Math.floor(zhuzailuIndex / 6);
        const row = zhuzailuIndex % 6;
        
        const index = row * this.cols + col; 
        const cell = this.container.children[index];
        if (cell) {
            const marker = document.createElement('div');
            marker.className = `bead-marker bead-${winner}`;
            
            // Add Pair Dots
            if (bPair) {
                const dot = document.createElement('div');
                dot.className = 'pair-dot banker';
                marker.appendChild(dot);
            }
            if (pPair) {
                const dot = document.createElement('div');
                dot.className = 'pair-dot player';
                marker.appendChild(dot);
            }

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

    // Initialize Music Controller
    new MusicController();
    
    // 初始化时显示弹窗，不直接初始化游戏
    const modal = document.getElementById('settings-modal');
    const btnStart = document.getElementById('btn-start-game');
    
    // 格式化输入金额
    const buyinInput = document.getElementById('setting-buyin');
    if (buyinInput) {
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
    }

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            // 获取设置
            const buyinRaw = document.getElementById('setting-buyin').value.replace(/,/g, '');
            const buyinAmount = parseInt(buyinRaw) || 0;
            
            const minLimit = parseInt(document.getElementById('setting-min-limit').value);
            const maxLimit = parseInt(document.getElementById('setting-max-limit').value);
            
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
    }

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
    
    // 绑定余额信息按钮
    const btnBalanceInfo = document.getElementById('btn-balance-info');
    const balanceInfoModal = document.getElementById('balance-info-modal');
    const btnCloseInfo = document.getElementById('btn-close-info');

    if (btnBalanceInfo && balanceInfoModal) {
        btnBalanceInfo.addEventListener('click', () => {
            const totalBuyin = game ? game.totalBuyin : 0;
            const currentBalance = game ? game.balance : 0;
            const winLoss = currentBalance - totalBuyin;
            
            const totalBuyinEl = document.getElementById('info-total-buyin');
            const winLossEl = document.getElementById('info-win-loss');
            
            if (totalBuyinEl) totalBuyinEl.textContent = totalBuyin.toLocaleString();
            if (winLossEl) {
                const sign = winLoss > 0 ? '+' : '';
                winLossEl.textContent = sign + winLoss.toLocaleString();
                // 根据正负值设置颜色：赢为绿色，输为红色，0 为黑色
                if (winLoss > 0) {
                    winLossEl.style.color = '#34c759'; // Green
                } else if (winLoss < 0) {
                    winLossEl.style.color = '#ff4444'; // Red
                } else {
                    winLossEl.style.color = 'black';
                }
            }
            
            balanceInfoModal.classList.remove('hidden');
            balanceInfoModal.style.display = 'flex';
        });

        const closeInfo = () => {
            balanceInfoModal.classList.add('hidden');
            balanceInfoModal.style.display = 'none';
        };

        if (btnCloseInfo) btnCloseInfo.addEventListener('click', closeInfo);
        
        balanceInfoModal.addEventListener('click', (e) => {
            if (e.target === balanceInfoModal) closeInfo();
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

    // 绑定测试按钮
    const btnTest = document.getElementById('btn-test-run');
    if (btnTest) {
        btnTest.addEventListener('click', () => {
            // Confirm before running test (optional)
            // if (confirm('Start auto-play test?')) {
                autoPlay(57);
            // }
        });
    }
});

// 语音播报类
class VoiceAnnouncer {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.enabled = true; // 默认开启
        this.volume = 0.1; // 默认音量 0.1
        this.init();
        this.initUI();
    }

    init() {
        // 尝试加载语音
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
        this.loadVoices();
    }

    initUI() {
        this.btnToggle = document.getElementById('btn-voice-toggle');
        this.statusText = document.getElementById('voice-status-text');

        if (this.btnToggle) {
            this.btnToggle.addEventListener('click', () => this.toggle());
            this.updateUI();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.synth.cancel(); // 立即停止正在播放的语音
        }
        this.updateUI();
    }

    updateUI() {
        if (this.btnToggle) {
            this.btnToggle.textContent = this.enabled ? '🔊' : '🔇';
            if (this.enabled) {
                this.btnToggle.classList.add('playing'); // 复用 playing 样式
            } else {
                this.btnToggle.classList.remove('playing');
            }
        }
        if (this.statusText) {
            const isCN = (typeof currentLang !== 'undefined' && currentLang === 'zh-CN');
            this.statusText.textContent = this.enabled ? (isCN ? '开启' : 'On') : (isCN ? '已关闭' : 'Off');
        }
    }

    loadVoices() {
        const voices = this.synth.getVoices();
        // 优先选择中文语音
        // 1. 尝试找 "Google 普通话" 或 "Google 粤语" (如果是繁体环境)
        // 2. 找 zh-CN 或 zh-TW
        
        // 简单策略：优先 zh-CN，其次 zh-TW
        this.voice = voices.find(v => v.lang === 'zh-CN') || 
                     voices.find(v => v.lang === 'zh-TW') || 
                     voices.find(v => v.lang.includes('zh'));
    }
    
    speak(text, interrupt = false) {
        if (!this.enabled) return;

        if (interrupt) {
             this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
            utterance.voice = this.voice;
        } else {
            utterance.lang = 'zh-CN'; 
        }
        
        utterance.rate = 1.0; 
        utterance.volume = this.volume; // Use configured volume
        
        this.synth.speak(utterance);
    }

    announceResult(winner, score, isLucky6, isLucky7) {
        if (!this.synth || !this.enabled) return;

        // 确保有语音，如果没有再试一次
        if (!this.voice) this.loadVoices();

        let text = '';
        
        if (winner === 'tie') {
            text = `和局${score}点`;
        } else if (winner === 'banker') {
            if (isLucky6) {
                text = '庄幸运6赢';
            } else {
                text = `庄家${score}点赢`;
            }
        } else if (winner === 'player') {
            if (isLucky7) {
                text = '闲幸运7赢';
            } else {
                text = `闲家${score}点赢`;
            }
        }

        if (text) {
            this.speak(text, true); // Interrupt previous
        }
    }

    announceLastRound() {
        if (!this.synth || !this.enabled) return;
        this.speak('最后一局', false); // Queue it, don't interrupt result
    }

    announceShuffling() {
        if (!this.synth || !this.enabled) return;
        this.speak('洗牌中，请稍等', true); // Interrupt previous
    }

    announceCut(count) {
        if (!this.synth || !this.enabled) return;
        this.speak(`消牌${count}张，请投注`, true);
    }

    speak(text, interrupt = true) {
        // 取消当前的播报
        if (interrupt) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
            utterance.voice = this.voice;
        }
        utterance.rate = 1.0; // 语速
        utterance.pitch = 1.0; // 音调
        utterance.volume = 0.4; // 音量 (0.0 to 1.0)

        this.synth.speak(utterance);
    }
}

// 看牌控制器类
class PeekController {
    constructor() {
        this.overlay = document.getElementById('peek-overlay');
        this.container = document.querySelector('.peek-container');
        this.opponentContainer = document.querySelector('.peek-opponent-cards');
        this.opponentTitleScore = document.getElementById('peek-opponent-score');
        this.myTitleScore = document.getElementById('peek-my-score');
        this.initialScoreDisplay = document.getElementById('peek-initial-score');
        this.btnOpen = document.querySelector('.btn-open');
        this.title = document.querySelector('.peek-title');
        
        this.announcer = new VoiceAnnouncer(); // Re-use or new instance? Global game.announcer exists.
        // Better to pass announcer or access global game instance if possible, but let's use a new one or passed in.
        // Actually, main.js has 'game' variable globally available after init.
        
        this.cards = [];
        this.resolvePromise = null;
        
        if (this.btnOpen) {
            this.btnOpen.addEventListener('click', () => this.finishPeek());
        }
    }

    // Start Peeking Session
    // cardsData: Array of {suit, rank, value} (My Cards to Peek)
    // type: 'player' | 'banker'
    // opponentCards: Array of {suit, rank, value} (Opponent Cards)
    // opponentType: 'player' | 'banker'
    // initialScore: Number (Optional, score of first 2 cards if peeking 3rd)
    // opponentFullyRevealed: Boolean (Optional, if true, opponent cards are shown face up)
    peek(cardsData, type, opponentCards = [], opponentType = null, initialScore = null, opponentFullyRevealed = false) {
        return new Promise((resolve) => {
            this.cards = cardsData;
            this.resolvePromise = resolve;
            this.savedInitialScore = initialScore; // Store for calculation
            
            // Setup UI
            if (this.title) {
                // ... (Existing code)
                const typeText = type === 'player' ? '闲家看牌 (Player Squeeze)' : '庄家看牌 (Banker Squeeze)';
                const color = type === 'player' ? '#8ecae6' : '#ffadad';
                
                this.title.innerHTML = `${typeText} <span id="peek-my-score"></span>`;
                this.title.style.color = color;
                
                this.myTitleScore = document.getElementById('peek-my-score');
            }
            
            // Clear previous score display
            if (this.opponentTitleScore) this.opponentTitleScore.textContent = '';
            if (this.myTitleScore) this.myTitleScore.textContent = '';
            if (this.initialScoreDisplay) {
                this.initialScoreDisplay.textContent = '';
                if (initialScore !== null) {
                    this.initialScoreDisplay.textContent = `(首两张: ${initialScore}点)`;
                }
            }
            
            this.renderCards(cardsData);
            this.renderOpponentCards(opponentCards, opponentType, opponentFullyRevealed);
            
            if (this.overlay) {
                this.overlay.classList.add('active');
            } else {
                resolve();
            }
        });
    }

    renderOpponentCards(cardsData, type, forceReveal = false) {
        if (!this.opponentContainer) return;
        this.opponentContainer.innerHTML = '';
        
        // If it's 3rd card peek (my cards length == 1), opponent might have 3 cards.
        // We only want to show the relevant opponent cards.
        // If initial deal (2 cards), show 2.
        // If 3rd card deal, usually we want to see the opponent's 3rd card if they have one?
        // Or all their cards? User said "最上方加入對家1張的補牌".
        // If opponent has 3 cards, and I am peeking my 3rd card.
        // We should render all of them, but focus on the new one?
        // Or only render the new one if I am peeking only the new one?
        // `cardsData` passed to `peek` is what I am peeking.
        // If `cardsData` has 1 card (3rd card), and `opponentCards` has 3 cards.
        // We probably want to show all 3 opponent cards so we can calculate total score.
        
        const isSupplementPeek = this.cards.length === 1;
        
        // If supplement peek, and opponent has 3 cards, we show all 3.
        // The first 2 are already revealed in main game, so they should be face up here too?
        // Or hidden until clicked?
        // "点击可打开牌" implies hidden initially.
        // But in main game, opponent's first 2 cards are already revealed before 3rd card deal?
        // Let's check game logic:
        // P1, B1, P2, B2 -> Peek -> Reveal Initial.
        // Then Draw 3rd.
        // So opponent's first 2 cards ARE revealed.
        // We should render them face up, and only the 3rd card face down?
        
        cardsData.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'peek-opponent-card';
            
            // Horizontal for 3rd card
            if (index === 2) { 
                cardEl.classList.add('horizontal');
            }
            
            // Face
            const face = document.createElement('div');
            face.className = 'peek-opponent-card-face';
            this.setCardFace(face, card);
            
            // Back
            const back = document.createElement('div');
            back.className = 'peek-opponent-card-back';
            
            // Logic for initial visibility:
            // If it's the 3rd card (index 2), it should be hidden (back visible).
            // If it's index 0 or 1:
            //    If we are in supplement peek (isSupplementPeek), they should be already revealed (face visible).
            //    If we are in initial peek, they should be hidden (back visible).
            
            let isRevealed = false;
            if (isSupplementPeek && index < 2) {
                isRevealed = true;
            }
            
            if (forceReveal) {
                isRevealed = true;
            }
            
            if (isRevealed) {
                cardEl.classList.add('revealed');
            }
            
            // Click to reveal
            cardEl.onclick = () => {
                if (!cardEl.classList.contains('revealed')) {
                    cardEl.classList.add('revealed');
                    
                    // Check if this was the last card to reveal (or specific logic)
                    // User: "打開後報對家合共點數"
                    // We should check if ALL opponent cards are revealed now.
                    this.checkOpponentReveal(cardsData, type);
                }
            };
            
            cardEl.appendChild(face);
            cardEl.appendChild(back);
            this.opponentContainer.appendChild(cardEl);
        });
        
        // If forceReveal is true, check score immediately
        if (forceReveal) {
            this.checkOpponentReveal(cardsData, type);
        }
    }
    
    checkOpponentReveal(cardsData, type) {
        const els = this.opponentContainer.querySelectorAll('.peek-opponent-card');
        const allRevealed = Array.from(els).every(el => el.classList.contains('revealed'));
        
        if (allRevealed) {
            // Calculate Score
            const sum = cardsData.reduce((acc, c) => acc + c.value, 0);
            const score = sum % 10;
            
            // Announce
            const typeName = type === 'banker' ? '庄' : '闲';
            const text = `${typeName}${score}点`;
            
            if (this.opponentTitleScore) {
                this.opponentTitleScore.textContent = ` - ${text}`;
            }
            
            // Speak
            // Use global game announcer if available to avoid conflict
            if (typeof game !== 'undefined' && game.announcer) {
                game.announcer.speak(text);
            } else if (this.announcer) {
                this.announcer.speak(text);
            }
        }
    }

    renderCards(cardsData) {
        if (!this.container) return;
        this.container.innerHTML = '';
        
        cardsData.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'peek-card';
            
            // Check if it's a 3rd card (single card scenario)
            // User Change: "補牌也是打直看牌" -> Even 3rd card should be vertical in peek mode.
            // Original: if (cardsData.length === 1) cardEl.classList.add('horizontal');
            // New: Always vertical. Remove this check.
            /* 
            if (cardsData.length === 1) {
                cardEl.classList.add('horizontal');
            }
            */
            
            // Face
            const face = document.createElement('div');
            face.className = 'peek-card-face';
            this.setCardFace(face, card);
            
            // Add Masks for Corners (Obscure numbers)
            // Top-Left
            const maskTL = document.createElement('div');
            maskTL.className = 'corner-mask top-left';
            face.appendChild(maskTL);
            
            // Bottom-Right
            const maskBR = document.createElement('div');
            maskBR.className = 'corner-mask bottom-right';
            face.appendChild(maskBR);
            
            // Back
            const back = document.createElement('div');
            back.className = 'peek-card-back';
            
            // Bind Drag Events
            this.bindDrag(back);
            
            cardEl.appendChild(face);
            cardEl.appendChild(back);
            this.container.appendChild(cardEl);
        });
    }

    setCardFace(element, card) {
        // Map suit/rank to sprite position (Copy from main.js logic)
        const suitMap = { '♠': 3, '♥': 2, '♣': 0, '♦': 1 };
        const rankMap = {
            'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
            '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12
        };
        
        const suitIdx = suitMap[card.suit];
        const rankIdx = rankMap[card.rank];
        
        const xPos = (rankIdx * 100 / 12).toFixed(4) + '%';
        const yPos = (suitIdx * 100 / 4).toFixed(4) + '%';
        
        element.style.backgroundPosition = `${xPos} ${yPos}`;
    }

    bindDrag(element) {
        let startX, startY;
        let isDragging = false;
        
        const onStart = (e) => {
            isDragging = true;
            const point = e.touches ? e.touches[0] : e;
            startX = point.clientX;
            startY = point.clientY;
            
            element.classList.add('dragging');
            // e.preventDefault(); // Prevent scroll - Removed to allow some default behaviors if needed, but usually good for drag
        };
        
        const onMove = (e) => {
            if (!isDragging) return;
            const point = e.touches ? e.touches[0] : e;
            
            const dx = point.clientX - startX;
            const dy = point.clientY - startY;
            
            // Move and Rotate slightly
            element.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.1}deg)`;
        };
        
        const onEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove('dragging');
            
            // Check threshold (e.g., moved 100px)
            const matrix = new WebKitCSSMatrix(window.getComputedStyle(element).transform);
            const dist = Math.sqrt(matrix.m41 * matrix.m41 + matrix.m42 * matrix.m42); // x^2 + y^2
            
            if (dist > 100) {
                // Reveal
                element.classList.add('revealed');
                this.checkAllRevealed();
            } else {
                // Snap back
                element.style.transform = '';
            }
        };
        
        element.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        
        element.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    }

    checkAllRevealed() {
        // Check if all backs are revealed
        const backs = this.container.querySelectorAll('.peek-card-back');
        const allRevealed = Array.from(backs).every(b => b.classList.contains('revealed'));
        
        if (allRevealed) {
            // Calculate My Score
            if (this.myTitleScore && this.cards) {
                // If peeking supplement (1 card), we need to add initial score if passed?
                // Wait, calcScore in main.js takes array of cards.
                // Here this.cards is only the cards being peeked (e.g. 1 card).
                // So the score displayed here is ONLY the score of the peeked card(s)?
                // Or total score?
                // User asked: "在看補牌过程中可顯示首2張牌合共的點數". I added that separately.
                // But the main score "peek-my-score" should probably show the FINAL total score after reveal?
                // Or just the new card value?
                // Usually "Player X Points" means total.
                // If I only have the 3rd card in `this.cards`, I can't calculate total unless I know initial.
                // I can extract initial score from the display string I just set, or pass it to class state.
                // Let's rely on the passed `initialScore` if I store it.
                
                // Let's store initialScore in the class instance in peek()
                // I need to update peek() to store it.
                
                let totalScore = 0;
                const currentCardsScore = this.cards.reduce((acc, c) => acc + c.value, 0);
                
                if (this.savedInitialScore !== null && this.cards.length === 1) {
                     totalScore = (this.savedInitialScore + currentCardsScore) % 10;
                } else {
                     totalScore = currentCardsScore % 10;
                }
                
                this.myTitleScore.textContent = ` - ${totalScore}点`;
                
                // Speak My Score
                const typeName = this.title.textContent.includes('闲') ? '闲' : '庄';
                const text = `${typeName}${totalScore}点`;
                if (typeof game !== 'undefined' && game.announcer) {
                    game.announcer.speak(text);
                }
            }

            setTimeout(() => this.finishPeek(), 500);
        }
    }

    finishPeek() {
        // Mark all cards as fully opened to hide masks
        if (!this.container) return;
        const cards = this.container.querySelectorAll('.peek-card');
        cards.forEach(c => c.classList.add('fully-opened'));
        
        // Also ensure all backs are 'revealed' if button was clicked
        const backs = this.container.querySelectorAll('.peek-card-back');
        backs.forEach(b => b.classList.add('revealed'));

        // Delay closing overlay to let user see full card
        setTimeout(() => {
            if (this.overlay) this.overlay.classList.remove('active');
            if (this.resolvePromise) {
                this.resolvePromise();
                this.resolvePromise = null;
            }
        }, 1000); // 1s delay to show revealed numbers
    }
}

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
        
        // Random Max Rounds (58-72)
        this.maxRounds = Math.floor(Math.random() * (72 - 58 + 1)) + 58;

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

        this.squeezeMode = true; // Default Squeeze ON

        this.announcer = new VoiceAnnouncer();
        this.peekCtrl = new PeekController();

        this.initUI();
        this.initDeck();
        this.bindEvents();
        this.updateBalanceUI();
        this.updateDealButtonState();
        this.updateClearButtonState();
        
        // Trigger Cut Animation on Init
        setTimeout(() => this.performCut(), 500);
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

        // Bind Peek Toggle
        const btnPeekToggle = document.getElementById('btn-peek-toggle');
        if (btnPeekToggle) {
            this.updatePeekButtonUI(btnPeekToggle);
            btnPeekToggle.onclick = () => {
                this.squeezeMode = !this.squeezeMode;
                this.updatePeekButtonUI(btnPeekToggle);
            };
        }
        
        this.updateStatsUI();
    }

    updatePeekButtonUI(btn) {
        if (!btn) return;
        if (this.squeezeMode) {
            btn.classList.remove('disabled');
            btn.textContent = '👁️'; // Open eye
        } else {
            btn.classList.add('disabled');
            btn.textContent = '🙈'; // Monkey covering eyes or closed eye
        }
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
        
        this.isDealing = true;
        document.getElementById('btn-deal').disabled = true;
        
        // Check Last Round Warning
        if (this.stats.total + 1 === this.maxRounds) {
            const overlay = document.getElementById('result-overlay');
            if (overlay) {
                overlay.textContent = '最後一局';
                overlay.classList.remove('hidden');
                overlay.className = 'result-overlay';
                
                // Show for 1.5s then continue
                await new Promise(r => setTimeout(r, 1500));
                overlay.classList.add('hidden');
            }
        }

        // Hide result overlay
        const overlay = document.getElementById('result-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        // 保存上一局下注记录，用于重下
        this.lastBet = { ...this.bet };

        // 检查是否有下注 (可选)
        const totalBet = Object.values(this.bet).reduce((a, b) => a + b, 0);
        
        // 飞牌规则：如果没有下注，也允许发牌（即飞牌）
        // 只有在有下注的情况下，才检查最低投注限制
        if (totalBet > 0) {
            // 检查最低投注限制 (Minimum Bet Check)
            // 规则：总下注额必须 >= 台红最低限制
            if (totalBet < this.config.minLimit) {
                alert(`下注金额低于台红最低限制: ${this.config.minLimit}`);
                this.isDealing = false;
                document.getElementById('btn-deal').disabled = false;
                return;
            }
        }
        
        // Determine Peek Mode
        // User Rule: Only one side can be bet (enforced in placeBet).
        // If bet on Player -> Peek Player.
        // If bet on Banker -> Peek Banker.
        // If bet on Tie/Pairs only? Usually no peek, or host deals.
        // Let's assume peek if bet on Main side.
        const peekPlayer = this.bet.player > 0;
        const peekBanker = this.bet.banker > 0;
        
        // Logic Update: If user is peeking (betting on one side), 
        // ALL initial cards should be dealt hidden to create suspense.
        // The opponent's cards will only be revealed AFTER the user peeks.
        // Also respect global squeezeMode toggle.
        const shouldPeek = this.squeezeMode && (peekPlayer || peekBanker);
        const shouldHideInitial = shouldPeek;
        
        // 清理桌面
        this.clearTable();
        
        const pCards = [];
        const bCards = [];
        
        // 初始两张
        // Deal 4 cards
        // P1
        await this.drawCard('player', pCards, shouldHideInitial);
        // B1
        await this.drawCard('banker', bCards, shouldHideInitial);
        // P2
        await this.drawCard('player', pCards, shouldHideInitial);
        // B2
        await this.drawCard('banker', bCards, shouldHideInitial);
        
        // Peek Phase 1: Initial Hands
        if (shouldPeek) {
            if (peekPlayer) {
                // User bets Player: Peek Player first
                // Opponent: Banker (bCards)
                await this.peekCtrl.peek(pCards, 'player', bCards, 'banker');
                // Reveal Player (User's hand)
                await this.revealHand('player', pCards);
                // Then Reveal Banker (Opponent)
                await this.revealHand('banker', bCards);
            } else if (peekBanker) {
                // User bets Banker: Peek Banker first
                // Opponent: Player (pCards)
                await this.peekCtrl.peek(bCards, 'banker', pCards, 'player');
                // Reveal Banker (User's hand)
                await this.revealHand('banker', bCards);
                // Then Reveal Player (Opponent)
                await this.revealHand('player', pCards);
            }
        } else {
            // No peeking involved (e.g. Tie bet only or just watching OR Squeeze Mode OFF)
            // Reveal all immediately if they were hidden (though we only hid if shouldHideInitial is true)
            // But if shouldHideInitial is false, cards are visible.
            // Just in case we expand logic later, ensure reveal.
            // (Currently redundant but safe)
        }
        
        let pScore = this.calcScore(pCards);
        let bScore = this.calcScore(bCards);
        
        this.updateScore('player', pScore);
        this.updateScore('banker', bScore);
        
        // 补牌规则
        let pDraw = false;
        let bDraw = false;
        
        const natural = pScore >= 8 || bScore >= 8;
        
        if (!natural) {
            // Logic for Third Cards (Determine draws first)
            
            // 1. Player Draw Check
            if (pScore <= 5) {
                pDraw = true;
            }
            
            // 2. Banker Draw Check
            if (!pDraw) {
                // Player stood (6 or 7) -> Banker draws on 0-5
                if (bScore <= 5) {
                    bDraw = true;
                }
            } else {
                // Player drew. Need to know the card value.
                // We haven't drawn it yet in the code, but we can simulate the draw logic 
                // or just draw it now but keep it hidden/unprocessed stats-wise.
                // Let's draw Player card physically (hidden) to get the value.
                
                // Determine if we should hide 3rd cards initially
                // If anyone is betting/peeking, we hide to maintain suspense order
                const hide3rd = shouldPeek;
                
                await this.drawCard('player', pCards, hide3rd);
                // Now pCards has the 3rd card
                const p3Card = pCards[2];
                const p3 = p3Card.value;
                
                // Banker Rule with Player 3rd Card
                if (bScore <= 2) bDraw = true;
                else if (bScore === 3 && p3 !== 8) bDraw = true;
                else if (bScore === 4 && (p3 >= 2 && p3 <= 7)) bDraw = true;
                else if (bScore === 5 && (p3 >= 4 && p3 <= 7)) bDraw = true;
                else if (bScore === 6 && (p3 === 6 || p3 === 7)) bDraw = true;
            }
            
            // 3. Banker Physical Draw (if needed)
            if (bDraw) {
                const hide3rd = shouldPeek;
                await this.drawCard('banker', bCards, hide3rd);
            }
            
            // 4. Peek and Reveal Sequence
            // Scenario A: User bets Player (Peeks Player)
            if (shouldPeek && pDraw && peekPlayer) {
                // Peek Player 3rd
                // Opponent might have 3 cards now (if bDraw executed) or 2.
                // We should pass opponent's current hand.
                // Calculate Initial Score (P1 + P2)
                const initialPScore = this.calcScore([pCards[0], pCards[1]]);
                await this.peekCtrl.peek([pCards[2]], 'player', bCards, 'banker', initialPScore);
                // Reveal Player 3rd
                await this.revealHand('player', pCards);
                // If Banker drew, reveal Banker 3rd NOW (after Player opened)
                if (bDraw) await this.revealHand('banker', bCards);
            } 
            // Scenario B: User bets Banker (Peeks Banker)
            else if (shouldPeek && bDraw && peekBanker) {
                // Calculate Initial Score (B1 + B2)
                const initialBScore = this.calcScore([bCards[0], bCards[1]]);
                
                // Logic: If Banker has 3,4,5,6 (initialBScore >= 3), they rely on Player's card to draw.
                // So Player MUST reveal first.
                // If Banker has 0,1,2, they force draw. Player doesn't need to reveal first.
                
                let forceOpponentReveal = false;
                
                if (initialBScore >= 3 && pDraw) {
                    forceOpponentReveal = true;
                    // Reveal Player 3rd FIRST
                    await this.revealHand('player', pCards);
                }
                
                // Peek Banker 3rd
                await this.peekCtrl.peek([bCards[2]], 'banker', pCards, 'player', initialBScore, forceOpponentReveal);
                
                // Reveal Banker 3rd
                await this.revealHand('banker', bCards);
                
                // If NOT forced reveal yet, reveal Player 3rd NOW (after Banker opened)
                if (pDraw && !forceOpponentReveal) {
                    await this.revealHand('player', pCards);
                }
            }
            // Scenario C: No Peeking (or User didn't bet on the drawing side that triggers peek)
            else {
                 // Just reveal any hidden cards
                 // We need to check if cards were hidden. `shouldPeek` determined `hide3rd`.
                 // If shouldPeek was true, but we fell through to here (e.g. betting Player but Banker drew, or betting Banker but Player drew, wait...
                 // If I bet Player (peekPlayer=true), and pDraw=false, bDraw=true.
                 // shouldPeek=true. hide3rd=true.
                 // Scenario A is false (pDraw false). Scenario B is false (peekBanker false).
                 // So we land here. Banker card is hidden. We should reveal it.
                 // So if shouldPeek is true, we must reveal.
                 if (shouldPeek) {
                     if (pDraw) await this.revealHand('player', pCards);
                     if (bDraw) await this.revealHand('banker', bCards);
                 }
            }
            
            // Recalculate Scores
            if (pDraw) {
                pScore = this.calcScore(pCards);
                this.updateScore('player', pScore);
            }
            if (bDraw) {
                bScore = this.calcScore(bCards);
                this.updateScore('banker', bScore);
            }
        }
        
        // 结算
        setTimeout(() => {
            this.settle(pScore, bScore, pCards, bCards);
            
            // Check AFTER settle (because settle increments stats.total)
            const needsReset = this.stats.total >= this.maxRounds;
            
            // Only re-enable if NOT resetting
            if (!needsReset) {
                this.isDealing = false;
                document.getElementById('btn-deal').disabled = false;
                this.updateDealButtonState();
            }
            // If needsReset, settle() will call resetGame() which handles UI
        }, 500);
    }
    
    async drawCard(who, handArr, isHidden = false) {
        if (this.deck.length < 10) this.initDeck(); // 洗牌
        
        const card = this.deck.pop();
        handArr.push(card);
        
        // 渲染卡片
        const container = document.getElementById(`cards-${who}`);
        const cardEl = document.createElement('div');
        
        // 第3张牌（补牌）添加特殊样式
        const isThird = handArr.length === 3;
        // User Change: "補牌也是打直看牌" -> This likely refers to the PEEKING (squeeze) view.
        // However, on the table (deal area), Baccarat convention is usually horizontal for the 3rd card.
        // The user said "補牌也是打直看牌", literally "Supplement card is also look straight".
        // This usually implies the SQUEEZE/PEEK interaction should be vertical (straight).
        // I have already updated PeekController (renderCards) to remove .horizontal class.
        // But should the table layout also be vertical?
        // Standard Baccarat: Table = Horizontal 3rd card. Squeeze = Depends on player preference, but user asked for straight.
        // I will keep the TABLE layout horizontal (standard) but the PEEK layout vertical (as requested).
        // So I will NOT change this line for the main table.
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
        
        if (isHidden) {
            // Render Back
            cardEl.classList.add('back');
            // Back style is handled by CSS (or we can force it here if needed)
            // Assuming .card.back has background-image override or we set it manually
            // Let's use the same pattern as peek-test for back
            cardEl.style.backgroundImage = 'none';
            cardEl.style.background = 'repeating-linear-gradient(45deg, #1a3c75, #1a3c75 5px, #142f5c 5px, #142f5c 10px)';
            cardEl.style.border = '2px solid white';
            
            // Store face info for later reveal
            cardEl.dataset.xPos = xPos;
            cardEl.dataset.yPos = yPos;
        } else {
            cardEl.style.backgroundPosition = `${xPos} ${yPos}`;
        }

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
    
    async revealHand(who, cards) {
        const container = document.getElementById(`cards-${who}`);
        const cardEls = container.querySelectorAll('.card');
        
        // Reveal logic: flip animation
        // Assuming cards match order in container
        // We only reveal those that are currently 'back'
        
        const promises = [];
        
        cardEls.forEach((el, index) => {
            if (el.classList.contains('back')) {
                const p = new Promise(resolve => {
                    // Flip animation
                    el.style.transition = 'transform 0.3s';
                    el.style.transform = 'scaleX(0)'; // Compress
                    
                    setTimeout(() => {
                        el.classList.remove('back');
                        // Restore Face
                        el.style.background = ''; // Clear gradient
                        el.style.border = '';
                        el.style.backgroundImage = "url('assets/cards.png'), url('assets/cards.svg')";
                        el.style.backgroundSize = "1300% 500%";
                        el.style.backgroundPosition = `${el.dataset.xPos} ${el.dataset.yPos}`;
                        
                        el.style.transform = 'scaleX(1)'; // Expand
                        setTimeout(resolve, 300);
                    }, 300);
                });
                promises.push(p);
            }
        });
        
        return Promise.all(promises);
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
            // 构建 HTML 内容，支持多行
            let htmlContent = `<div>${resultText}</div>`;
            
            // 如果有赢钱，追加显示赢取金额 (本金 + 盈利)
            if (winnings > 0) {
                // winnings 已经包含了本金 + 盈利 (在前面的计算逻辑中：bet * odds 是利润，这里代码逻辑似乎需要确认)
                // 检查前面的逻辑：
                // winnings += this.bet.player * 2; -> 包含本金 (1赔1)
                // winnings += this.bet.banker * (1 + odds); -> 包含本金
                // winnings += this.bet.tie * 9; -> 包含本金 (1赔8，返还1，共9)
                // 所以 winnings 变量本身就是 "本金 + 盈利"
                htmlContent += `<div class="win-amount">赢取: ${Math.floor(winnings).toLocaleString()}</div>`;
            }

            overlay.innerHTML = htmlContent; // 使用 innerHTML 而不是 textContent
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
        // lucky6: false, 2, 3 (number of cards)
        // lucky7: false, 3 (number of cards)
        let lucky6Val = false;
        if (bankerWin6) {
             lucky6Val = bankerCardsCount;
        }
        
        let lucky7Val = false;
        if (playerWin7) {
             lucky7Val = playerCardsCount;
        }

        // 语音播报
        const winScore = (winner === 'banker') ? bScore : pScore;
        this.announcer.announceResult(winner, winScore, bankerWin6, playerWin7);

        // Pre-announce Last Round (when entering the last round)
        if (this.stats.total === this.maxRounds - 1) {
             this.announcer.announceLastRound();
        }

        // Check for Game Over (Reset)
        if (this.stats.total >= this.maxRounds) {
             // Game Over, shuffling...
             setTimeout(() => {
                 this.resetGame();
             }, 2000);
        }

        handleInput(winner, pPair, bPair, lucky6Val, lucky7Val);

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
    resetGame() {
        this.maxRounds = Math.floor(Math.random() * (72 - 58 + 1)) + 58;
        this.stats = {
            total: 0, banker: 0, player: 0, tie: 0, 
            bankerPair: 0, playerPair: 0, lucky6: 0, lucky7: 0
        };
        this.updateStatsUI();
        this.initDeck();
        
        // Clear Roads
        if (roads.dalu) roads.dalu.clear();
        if (roads.dayan) roads.dayan.clear();
        if (roads.xiaolu) roads.xiaolu.clear();
        if (roads.zhanglang) roads.zhanglang.clear();
        if (beadRoad) beadRoad.clear();
        
        // Clear Table
        this.clearTable();
        
        // Reset Bet
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
        
        // UI Notification
        const overlay = document.getElementById('result-overlay');
        if(overlay) {
             overlay.textContent = '洗牌中...';
             this.announcer.announceShuffling(); // Voice announcement
             overlay.classList.remove('hidden');
             setTimeout(() => {
                 overlay.classList.add('hidden');
                 this.performCut(); // Trigger Cut after shuffle
             }, 1500);
        }
        
        updatePrediction();
    }

    async performCut() {
        if (this.deck.length < 20) this.initDeck(); // Ensure enough cards

        const overlay = document.getElementById('cut-overlay');
        const indicatorContainer = document.getElementById('cut-indicator-card');
        const burnGrid = document.getElementById('burn-cards-grid');
        const infoText = document.getElementById('cut-info-text');
        
        if (!overlay || !indicatorContainer || !burnGrid) return;

        // 1. Draw Indicator Card
        const indicatorCard = this.deck.pop();
        
        // 2. Determine Burn Count
        let burnCount = indicatorCard.value;
        if (indicatorCard.rank === 'J' || indicatorCard.rank === 'Q' || indicatorCard.rank === 'K' || indicatorCard.rank === '10') {
            burnCount = 10;
        } else if (indicatorCard.rank === 'A') {
            burnCount = 1;
        }
        
        // Announce Cut
        if (this.announcer) {
            this.announcer.announceCut(burnCount);
        }
        
        // Update Info Text
        infoText.textContent = `${indicatorCard.rank}点 - 销牌${burnCount}张`;

        // Render Indicator Card
        this.renderCard(indicatorCard, indicatorContainer);
        
        // 3. Draw Burn Cards
        const burnCards = [];
        for (let i = 0; i < burnCount; i++) {
            burnCards.push(this.deck.pop());
        }

        // Render Burn Cards (Backs)
        burnGrid.innerHTML = '';
        burnCards.forEach(() => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card'; // CSS handles back style for .burn-grid .card
            burnGrid.appendChild(cardEl);
        });

        // Show Overlay
        overlay.classList.remove('hidden');

        // Wait for 3 seconds then hide
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        overlay.classList.add('hidden');

        // Re-enable dealing
        this.isDealing = false;
        const btnDeal = document.getElementById('btn-deal');
        if (btnDeal) {
            btnDeal.disabled = false;
            this.updateDealButtonState();
        }
    }

    renderCard(card, container) {
        // Clear container but keep class
        container.innerHTML = '';
        container.style.backgroundImage = ''; // Reset inline style
        
        // Calculate Sprite Position (Copied from drawCard)
        const suitMap = { '♠': 3, '♥': 2, '♣': 0, '♦': 1 };
        const rankMap = {
            'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
            '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12
        };
        
        const suitIdx = suitMap[card.suit];
        const rankIdx = rankMap[card.rank];
        
        const xPos = (rankIdx * 100 / 12).toFixed(4) + '%';
        const yPos = (suitIdx * 100 / 4).toFixed(4) + '%';
        
        container.style.backgroundImage = "url('assets/cards.png'), url('assets/cards.svg')";
        container.style.backgroundPosition = `${xPos} ${yPos}`;
        container.style.backgroundSize = "1300% 500%";
    }
}

// 保留原有的 handleInput 用于路单逻辑
function handleInput(type, pPair, bPair, lucky6, lucky7) {
    if (type === 'tie') {
        beadRoad.addMarker('tie', 'T', pPair, bPair, lucky6, lucky7);
    } else {
        // 先让上一手的 enableNext 生效
        ['dayan', 'xiaolu', 'zhanglang'].forEach(k => {
            if (roads[k].enableNext) {
                roads[k].enabled = true;
                roads[k].enableNext = false;
            }
        });

        const info = roads.dalu.addMarker(type, pPair, bPair, lucky6, lucky7);

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
        beadRoad.addMarker(type, text, pPair, bPair, lucky6, lucky7);
    }
    
    updatePrediction();
}

function updatePrediction() {
    if (!roads.dalu) return;
    
    // Helper to predict for a winner
    const predictFor = (winner) => {
        // 1. Get where it would go in Big Road
        const pos = roads.dalu.getNextBigRoadPosition(winner);
        
        // 2. Predict derived roads
        const res = {};
        
        // Helper function to calculate color directly (Logic copy from computeDerivedColorFromBigRoad)
        // gap: 1 for Dayan, 2 for Small, 3 for Cockroach
        const calculateColor = (gap) => {
            const bigRoad = roads.dalu;
            const col = pos.colIndex;
            const row = pos.rowIndex;
            const isDown = pos.movedDown;
            
            // Check validity
            // Dayan: needs col >= 1 (if row>0) or col >= 2 (if row=0)
            // But standard rule:
            // Dayan starts at col 1 row 1 OR col 2 row 0.
            // Small starts at col 2 row 1 OR col 3 row 0.
            // Cockroach starts at col 3 row 1 OR col 4 row 0.
            
            // Simplified check: can we look back 'gap' columns?
            // If row=0 (new column), we compare len(col-1) and len(col-1-gap)
            // If row>0 (continuation), we compare grid[col-gap][row] and grid[col-gap][row-1]? No.
            // Let's use standard logic:
            
            let color = null; // 'banker'(Red) or 'player'(Blue)
            
            if (row === 0) {
                // Case 1: New Column (Change of luck)
                // Compare length of previous column (col-1) with length of column (col-1-gap)
                // Validity check: col >= gap + 1
                if (col < gap + 1) return null;
                
                let lenPrev = 0;
                let lenPrevGap = 0;
                
                // Get length of col-1
                for (let r = 0; r < bigRoad.rows; r++) {
                    if (bigRoad.isOccupied(r, col - 1)) lenPrev++;
                    else break;
                }
                
                // Get length of col-1-gap
                for (let r = 0; r < bigRoad.rows; r++) {
                    if (bigRoad.isOccupied(r, col - 1 - gap)) lenPrevGap++;
                    else break;
                }
                
                // Equal length -> Red, Unequal -> Blue
                color = (lenPrev === lenPrevGap) ? 'banker' : 'player';
                
            } else {
                // Case 2: Continuation (Same luck)
                // Compare cell at (col-gap, row)
                // Validity check: col >= gap
                if (col < gap) return null;
                
                // Standard: Check if (col-gap, row) is occupied
                // If occupied -> Red
                // If empty -> Check if (col-gap, row-1) is occupied.
                //    If (col-gap, row-1) occupied -> Blue (Empty but prev occupied = "Gap")
                //    If (col-gap, row-1) empty -> Red (Both empty = "Stable") -- Wait, standard rule?
                
                // Let's use the exact logic from computeDerivedColorFromBigRoad:
                // "Look at col - gap.
                // If matrix[row][col-gap] is occupied -> Red
                // Else (empty):
                //    If matrix[row-1][col-gap] is occupied -> Blue (One empty)
                //    Else -> Red (Both empty)"
                
                const isTargetOccupied = bigRoad.isOccupied(row, col - gap);
                
                if (isTargetOccupied) {
                    color = 'banker'; // Red
                } else {
                    const isPrevRowOccupied = bigRoad.isOccupied(row - 1, col - gap);
                    if (isPrevRowOccupied) {
                        color = 'player'; // Blue
                    } else {
                        color = 'banker'; // Red
                    }
                }
            }
            return color;
        };

        res.dayan = calculateColor(1);
        res.small = calculateColor(2);
        res.cockroach = calculateColor(3);
        
        return res;
    };
    
    const predBanker = predictFor('banker');
    const predictPlayer = predictFor('player'); // Rename to avoid confusion
    
    // Render
    renderPredictionSymbol('pred-banker-dayan', predBanker.dayan, 'dayan');
    renderPredictionSymbol('pred-banker-small', predBanker.small, 'small');
    renderPredictionSymbol('pred-banker-cockroach', predBanker.cockroach, 'cockroach');
    
    renderPredictionSymbol('pred-player-dayan', predictPlayer.dayan, 'dayan');
    renderPredictionSymbol('pred-player-small', predictPlayer.small, 'small');
    renderPredictionSymbol('pred-player-cockroach', predictPlayer.cockroach, 'cockroach');
}

function renderPredictionSymbol(id, color, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'pred-symbol';
    
    const marker = document.createElement('div');
    marker.style.width = '100%';
    marker.style.height = '100%';
    
    if (!color) {
        // Show grey dash if no prediction available
        marker.className = 'marker no-prediction-dash';
    } else {
        let className = 'marker '; // Add marker class for centering
        if (type === 'dayan') className += color === 'banker' ? 'dayan-red' : 'dayan-blue';
        else if (type === 'small') className += color === 'banker' ? 'small-red' : 'small-blue';
        else if (type === 'cockroach') className += color === 'banker' ? 'cockroach-red' : 'cockroach-blue';
        marker.className = className;
    }
    
    wrapper.appendChild(marker);
    el.appendChild(wrapper);
}

// 快速测试功能
let autoPlayInterval = null;

function autoPlay(rounds = 50) {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }

    const btnTest = document.getElementById('btn-test-run');
    if (btnTest) {
        btnTest.disabled = true;
        btnTest.textContent = 'Running...';
    }

    if (!game) {
        // Ensure game is initialized for stats update
        game = new BaccaratGame();
    }
    
    let count = 0;
    autoPlayInterval = setInterval(() => {
        if (count >= rounds) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            if (btnTest) {
                btnTest.disabled = false;
                btnTest.textContent = 'Test';
            }
            return;
        }
        
        // Random result
        const rand = Math.random();
        let winner;
        if (rand < 0.4586) winner = 'banker';
        else if (rand < 0.4586 + 0.4462) winner = 'player';
        else winner = 'tie';
        
        // Random pairs/lucky
        const pPair = Math.random() < 0.07;
        const bPair = Math.random() < 0.07;
        const lucky6 = (winner === 'banker' && Math.random() < 0.05) ? (Math.random() < 0.5 ? 2 : 3) : false;
        const lucky7 = (winner === 'player' && Math.random() < 0.05) ? (Math.random() < 0.5 ? 2 : 3) : false;
        
        // Update Game Logic (Stats)
        // Simulate Score
        const pScore = winner === 'player' ? 8 : (winner === 'tie' ? 8 : 7);
        const bScore = winner === 'banker' ? 8 : (winner === 'tie' ? 8 : 7);
        
        // Use game.updateStats logic if available or direct
        game.updateStats(winner, pPair, bPair, !!lucky6, !!lucky7);
        
        // Update Roads
        handleInput(winner, pPair, bPair, lucky6, lucky7);
        
        count++;
    }, 50); // Fast speed
}

// Music Controller Class
class MusicController {
    constructor() {
        // 如果是路单测试页，完全禁用音乐控制器
        if (window.location.pathname.includes('roadmap-test.html')) {
            return;
        }

        this.bgm = new Audio('assets/bgm.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.1; // Default 0.1
        this.isPlaying = false;
        
        // Controls in Settings
        this.btnSetting = document.getElementById('btn-music-toggle');
        this.volumeSlider = document.getElementById('music-volume');
        if (this.volumeSlider) {
             this.volumeSlider.value = 0.1;
        }
        this.statusText = document.getElementById('music-status-text');
        
        // Main Button (Top Right)
        this.btnMain = document.getElementById('btn-music-toggle-main');
        
        this.hasInteracted = false;
        
        this.init();
    }
    
    init() {
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value);
                this.bgm.volume = vol;
                
                // Also update Voice Announcer if game instance exists
                if (typeof game !== 'undefined' && game.announcer) {
                    game.announcer.volume = vol;
                }
            });
        }

        // Bind Setting Button
        if (this.btnSetting) {
            this.btnSetting.addEventListener('click', () => this.toggle());
        }
        
        // Bind Main Button
        if (this.btnMain) {
            this.btnMain.addEventListener('click', () => this.toggle());
        }
        
        // 自动播放处理：浏览器通常阻止自动播放，直到用户与页面交互
        const startPlay = () => {
            if (!this.hasInteracted) {
                this.hasInteracted = true;
                if (!this.isPlaying) {
                   this.play();
                }
                document.removeEventListener('click', startPlay);
                document.removeEventListener('touchstart', startPlay);
            }
        };
        
        document.addEventListener('click', startPlay);
        document.addEventListener('touchstart', startPlay);
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        const playPromise = this.bgm.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updateUI();
            }).catch(error => {
                console.log('Auto-play was prevented.', error);
                this.isPlaying = false;
                this.updateUI();
            });
        }
    }
    
    pause() {
        this.bgm.pause();
        this.isPlaying = false;
        this.updateUI();
    }
    
    updateUI() {
        const updateBtn = (btn) => {
            if (btn) {
                btn.textContent = this.isPlaying ? '🎵' : '🔇';
                if (this.isPlaying) {
                    btn.classList.add('playing');
                } else {
                    btn.classList.remove('playing');
                }
            }
        };

        updateBtn(this.btnSetting);
        updateBtn(this.btnMain);

        if (this.statusText) {
            // Simple localization check or use global currentLang
            const isCN = (typeof currentLang !== 'undefined' && currentLang === 'zh-CN');
            this.statusText.textContent = this.isPlaying ? (isCN ? '播放中' : 'Playing') : (isCN ? '已关闭' : 'Off');
        }
    }
}
