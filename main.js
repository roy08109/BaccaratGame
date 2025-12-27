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
    
    if (typeof game !== 'undefined' && game) {
        game.updateDealButtonState();
        game.updateClearButtonState();
        
        const buyinLabel = document.querySelector('label[data-i18n="buyin_amount"]');
        const btnStart = document.getElementById('btn-start-game');
        
        if (buyinLabel) buyinLabel.textContent = t[game.started ? 'add_amount' : 'buyin_amount'];
        if (btnStart) btnStart.textContent = t['btn_continue'];
    }
}

window.__roadDebug = window.__roadDebug ?? false;

// 通用路单类
class RoadMap {
    constructor(id, config) {
        // Support ID string or direct Element
        if (typeof id === 'string') {
            this.container = document.getElementById(id);
        } else {
            this.container = id;
        }
        
        if (!this.container) {
            console.warn(`RoadMap container not found: ${id}`);
            return;
        }

        this.rows = config.rows;
        this.cols = config.cols;
        this.type = config.type;
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        
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

        this.enabled = this.type === 'dalu' || this.type === 'bead' ? true : false;
        this.enableNext = false;

        if (this.type === 'dalu') {
            this.columns = [];
            this.currentColumnIndex = -1;
        }

        this.initDOM();
    }

    initDOM() {
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        const ratio = this.cols / 6.3;
        this.container.style.aspectRatio = `${ratio}`;
        this.container.style.overflowX = 'auto';
        this.container.style.scrollbarWidth = 'none';

        this.container.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                if (this.type === 'dalu') cell.className = 'cell-dalu';
                else if (this.type === 'bead') cell.className = 'cell-zhuzailu cell-dalu';
                else cell.className = 'cell-dalu';

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
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        
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
        
        this.initDOM();
    }

    expandGrid(count) {
        const oldCols = this.cols;
        this.cols += count;

        for (let r = 0; r < this.rows; r++) {
            for (let i = 0; i < count; i++) {
                this.grid[r].push(null);
            }
        }

        for (let r = 0; r < this.rows; r++) {
            const lastCell = this.container.querySelector(`div[data-row="${r}"][data-col="${oldCols - 1}"]`);
            let referenceNode = lastCell ? lastCell.nextSibling : null;
            
            for (let c = oldCols; c < this.cols; c++) {
                const cell = document.createElement('div');
                if (this.type === 'dalu') cell.className = 'cell-dalu';
                else if (this.type === 'bead') cell.className = 'cell-zhuzailu cell-dalu';
                else cell.className = 'cell-dalu';

                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (c === this.cols - 1) cell.classList.add('last-col');

                if (referenceNode) {
                    this.container.insertBefore(cell, referenceNode);
                } else {
                    this.container.appendChild(cell);
                }
            }
            if (lastCell) lastCell.classList.remove('last-col');
        }

        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        const ratio = this.cols / 6.3;
        this.container.style.aspectRatio = `${ratio}`;
    }

    isOccupied(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
        return this.grid[r][c] !== null;
    }

    addMarker(winner, pPair, bPair, lucky6, lucky7) {
        if (this.type === 'dalu') {
            return this.addMarkerBigRoad(winner, pPair, bPair, lucky6, lucky7);
        }

        const data = this.colorData;
        
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

        if (data.numberMode) {
            this.renderNumber(data.currCol, data.clickCnt);
            return;
        }

        let targetRow = data.currRow;
        let targetCol = data.currCol;
        
        if (data.clickCnt === 1) {
            targetRow = 0;
            targetCol = data.startCol;
        } else {
            if (!data.turned) {
                const nextRow = data.currRow + 1;
                const nextCol = data.currCol;
                
                if (this.isOccupied(nextRow, nextCol)) {
                    data.turned = true;
                    targetRow = data.currRow;
                    targetCol = data.currCol + 1;
                } else {
                    targetRow = nextRow;
                    targetCol = nextCol;
                }
            } else {
                targetRow = data.currRow;
                targetCol = data.currCol + 1;
            }
        }

        if (targetCol >= this.cols) {
            data.isStuck = true; 
        }

        if (['dalu', 'dayan', 'small', 'cockroach'].includes(this.type)) {
             if (this.cols - targetCol < 3) {
                 this.expandGrid(10);
             }
        }
        
        if (targetRow < this.rows && targetCol < this.cols && !this.grid[targetRow][targetCol]) {
            this.grid[targetRow][targetCol] = winner;
            this.renderMarker(targetRow, targetCol, winner);
            data.currRow = targetRow;
            data.currCol = targetCol;
        } else {
            data.isStuck = true;
            data.numberMode = true;
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

        if (winner === 'tie') {
            if (data.lastColor !== null) {
                this.renderTie(data.currRow, data.currCol);
            }
            // Tie does not change column or advance position
            return { movedDown: false, movedRight: false, colIndex: data.currCol, rowIndex: data.currRow };
        }

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

        if (this.cols - targetCol < 3) {
             this.expandGrid(10);
        }

        if (targetRow < this.rows && targetCol < this.cols && !this.grid[targetRow][targetCol]) {
            this.grid[targetRow][targetCol] = winner;
            this.renderMarker(targetRow, targetCol, winner, pPair, bPair, lucky6, lucky7);
            data.currRow = targetRow;
            data.currCol = targetCol;
        } else {
             data.isStuck = true;
             data.numberMode = true;
             if (data.clickCnt >= 2) {
                 this.renderNumber(data.currCol, data.clickCnt);
             }
        }

        if (winner === 'banker' || winner === 'player') {
            if (movedRight) {
                this.currentColumnIndex++;
                this.columns[this.currentColumnIndex] = [];
            }
            if (this.currentColumnIndex < 0) {
                this.currentColumnIndex = 0;
                this.columns[this.currentColumnIndex] = [];
            }
            this.columns[this.currentColumnIndex].push(winner);
        }

        return { movedDown, movedRight, colIndex: targetCol, rowIndex: targetRow };
    }
    
    renderMarker(r, c, winner, pPair, bPair, lucky6, lucky7, text = null) {
        const index = r * this.cols + c;
        const cell = this.container.children[index];
        if (!cell) return;
        
        if (text) {
            const numEl = document.createElement('div');
            numEl.className = 'marker-text';
            numEl.textContent = text;
            
            if (this.type === 'dayan' || this.type === 'small' || this.type === 'cockroach') {
                numEl.style.color = (winner === 'banker') ? '#d93025' : '#1a73e8';
            }
            
            cell.appendChild(numEl);
            return;
        }

        const marker = document.createElement('div');
        marker.className = 'marker';
        
        if (this.type === 'dalu') {
            marker.classList.add(winner === 'banker' ? 'red-circle' : 'blue-circle');
            
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
            
            if (winner === 'banker' && lucky6) {
                const num = document.createElement('div');
                num.className = 'lucky-number';
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

    renderTie(r, c) {
        const index = r * this.cols + c;
        const cell = this.container.children[index];
        if (!cell) return;
        
        const slash = document.createElement('div');
        slash.className = 'tie-slash';
        cell.appendChild(slash);
    }
    
    renderNumber(col, num) {
        this.colorData.numShowCount++;
        const index = 0 * this.cols + col;
        const cell = this.container.children[index];
        if (!cell) return;
        
        let numTag = cell.querySelector('.num-tag');
        if (!numTag) {
            numTag = document.createElement('div');
            numTag.className = 'num-tag';
            cell.appendChild(numTag);
        }
        
        numTag.classList.remove('num-banker', 'num-player');
        numTag.classList.add(this.colorData.lastColor === 'banker' ? 'num-banker' : 'num-player');
        
        numTag.classList.remove('num-tag-14', 'num-tag-12', 'small-num');
        if (this.type === 'dalu') {
            numTag.classList.add('num-tag-14');
        } else {
            if (this.colorData.numShowCount === 1) {
                numTag.classList.add('num-tag-12');
            } else {
                numTag.classList.add('small-num');
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
        const hasLeft = col - 1 >= 0 && !!this.grid[row][col - 1];
        const hasUp = row - 1 >= 0 && !!this.grid[row - 1][col];
        const fe = row === 0;

        if (hasLeft) return 'banker';
        if (!hasLeft && hasUp && fe) return 'player';
        return 'banker';
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
                color = 'banker'; 
            } else if (!hasLeftInBig && hasUpInBig && feDerived) {
                color = 'player';
            } else {
                color = 'banker';
            }
        } else {
            const currentColumnIdx = colIndex - 1;
            const prevColumnIdx = currentColumnIdx - offset;
            
            const lenCurr = bigRoad.columns[currentColumnIdx]?.length || 0;
            const lenPrev = bigRoad.columns[prevColumnIdx]?.length || 0;
            
            if (lenCurr === lenPrev) {
                color = 'banker';
            } else {
                color = 'player';
            }
        }
        return color;
    }

    placeDerivedByBigRoadDirection(isDown, bigRoadInfo) {
        // Assume 'roads' is accessible globally or bound. 
        // We will make 'roads' available globally for Game View, or pass it in.
        // For Lobby view, we don't calculate derived roads usually, or we don't display them.
        // The game logic uses 'roads.dalu'.
        // We need to ensure 'roads' variable is available. 
        // In the new architecture, 'game.roads' is the place. 
        // But this method is inside RoadMap class. 
        // We'll fix this by passing the bigRoad instance.
        
        // However, existing code calls: roads.dayan.placeDerivedByBigRoadDirection
        // And inside it calls computeDerivedColorFromBigRoad(roads.dalu, ...)
        
        // Refactor: Pass bigRoad as argument or rely on global 'game.roads.dalu'.
        // For now, let's assume 'game' instance exists if we are in game view.
        // If 'game' is undefined, we might be in lobby (but lobby doesn't draw derived roads).
        
        let bigRoad;
        if (typeof game !== 'undefined' && game.roads && game.roads.dalu) {
            bigRoad = game.roads.dalu;
        } else if (typeof roads !== 'undefined' && roads.dalu) {
            bigRoad = roads.dalu; // Fallback for old code if any
        }
        
        if (!bigRoad) return; // Cannot compute

        const newColIndex = this.colorData.startCol + 1;
        const colorIfNewCol = this.computeDerivedColorFromBigRoad(
            bigRoad,
            bigRoadInfo.colIndex,
            bigRoadInfo.rowIndex,
            isDown,
            newColIndex,
            0
        );
        const lastColor = this.colorData.lastColor;

        if (lastColor === null) {
             this.colorData.startCol = 0;
             this.colorData.currCol = 0;
             this.colorData.currRow = 0;
             this.colorData.lastStartCol = -1;
        }

        let targetCol, row, color;

        if (lastColor === null || colorIfNewCol !== lastColor) {
            this.colorData.lastStartCol = this.colorData.startCol;
            let nextStart = this.colorData.startCol + 1;
            
            let loopSafety = 0;
            while (this.isOccupied(0, nextStart)) {
                nextStart++;
                loopSafety++;
                if (nextStart >= this.cols) {
                     this.expandGrid(10);
                }
                if (loopSafety > 1000) break;
            }
            this.colorData.startCol = nextStart;
            
            if (lastColor === null) {
                this.colorData.startCol = 0;
            }
            
            targetCol = this.colorData.startCol;
            row = 0;
            this.colorData.currCol = targetCol;
            this.colorData.currRow = 0;
            this.colorData.clickCnt = 1;
            this.colorData.turned = false;
            this.colorData.isNumberMode = false;
            color = colorIfNewCol;
        } else {
            let nextRow = this.colorData.currRow + 1;
            let nextCol = this.colorData.currCol;
            let currentCount = (this.colorData.clickCnt || 0) + 1;
            
            color = lastColor;

            if (this.colorData.isNumberMode) {
                this.colorData.clickCnt = currentCount;
                const r = this.colorData.currRow;
                const c = this.colorData.currCol;
                const index = r * this.cols + c;
                const cell = this.container.children[index];
                if (cell) {
                    cell.innerHTML = '';
                    this.renderMarker(r, c, color, null, null, null, null, String(currentCount));
                }
                return;
            }

            const downBlocked = this.isOccupied(nextRow, nextCol);
            const rightBlocked = this.isOccupied(this.colorData.currRow, this.colorData.currCol + 1);
            
            const isDoubleBlocked = downBlocked && rightBlocked;
            const isSecondBlocked = currentCount === 2 && downBlocked;

            if (isDoubleBlocked || isSecondBlocked) {
                this.colorData.isNumberMode = true;
                this.colorData.clickCnt = currentCount;

                const r = this.colorData.currRow;
                const c = this.colorData.currCol;
                const index = r * this.cols + c;
                const cell = this.container.children[index];
                if (cell) {
                    cell.innerHTML = '';
                    this.renderMarker(r, c, color, null, null, null, null, String(currentCount));
                }
                return;
            }

            if (this.colorData.turned || downBlocked) {
                this.colorData.turned = true;
                targetCol = this.colorData.currCol + 1;
                row = this.colorData.currRow;
            } else {
                targetCol = nextCol;
                row = nextRow;
            }
            
            if (targetCol >= this.cols) return;

            this.colorData.currCol = targetCol;
            this.colorData.currRow = row;
            this.colorData.clickCnt = currentCount;
        }

        this.grid[row][targetCol] = color;
        this.renderMarker(row, targetCol, color);
        
        this.colorData.lastColor = color;
        this.colorData.currRow = row;
        this.colorData.currCol = targetCol;
    }
}

// 珠仔路类
class BeadRoad {
    constructor(id, config) {
        this.container = document.getElementById(id);
        this.rows = config.rows;
        this.cols = config.cols;
        this.index = 0;
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
        this.index = 0;
        this.container.innerHTML = '';
        this.initDOM();
    }
    
    addMarker(winner, text, pPair, bPair) {
        if (this.index >= this.rows * this.cols) return;
        
        const col = Math.floor(this.index / 6);
        const row = this.index % 6;
        
        const index = row * this.cols + col; 
        const cell = this.container.children[index];
        if (cell) {
            const marker = document.createElement('div');
            marker.className = `bead-marker bead-${winner}`;
            
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
        
        this.index++;
    }
}

// 语音播报类
class VoiceAnnouncer {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.enabled = true;
        this.volume = 1.0;
        this.init();
        this.initUI();
    }

    init() {
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
            this.synth.cancel();
        }
        this.updateUI();
    }

    updateUI() {
        if (this.btnToggle) {
            this.btnToggle.textContent = this.enabled ? '🔊' : '🔇';
            if (this.enabled) {
                this.btnToggle.classList.add('playing');
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
        this.voice = voices.find(v => v.lang === 'zh-CN') || 
                     voices.find(v => v.lang === 'zh-TW') || 
                     voices.find(v => v.lang.includes('zh'));
    }
    
    speak(text, interrupt = false) {
        if (!this.enabled) return;
        if (interrupt) this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) utterance.voice = this.voice;
        else utterance.lang = 'zh-CN'; 
        
        utterance.rate = 1.0; 
        utterance.volume = this.volume;
        this.synth.speak(utterance);
    }

    announceResult(winner, score, isLucky6, isLucky7) {
        if (!this.synth || !this.enabled) return;
        if (!this.voice) this.loadVoices();

        let text = '';
        if (winner === 'tie') {
            text = `和局${score}点`;
        } else if (winner === 'banker') {
            if (isLucky6) text = '庄幸运6赢';
            else text = `庄家${score}点赢`;
        } else if (winner === 'player') {
            if (isLucky7) text = '闲幸运7赢';
            else text = `闲家${score}点赢`;
        }

        if (text) this.speak(text, true);
    }

    announceLastRound() {
        if (!this.synth || !this.enabled) return;
        this.speak('最后一局', false);
    }

    announceShuffling() {
        if (!this.synth || !this.enabled) return;
        this.speak('洗牌中，请稍等', true);
    }

    announceCut(count) {
        if (!this.synth || !this.enabled) return;
        this.speak(`消牌${count}张，请投注`, true);
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
        
        this.announcer = new VoiceAnnouncer();
        this.cards = [];
        this.resolvePromise = null;
        this.savedInitialScore = null;
        
        if (this.btnOpen) {
            this.btnOpen.addEventListener('click', () => this.finishPeek());
        }
    }

    peek(cardsData, type, opponentCards = [], opponentType = null, initialScore = null, opponentFullyRevealed = false) {
        return new Promise((resolve) => {
            this.cards = cardsData;
            this.resolvePromise = resolve;
            this.savedInitialScore = initialScore;
            
            if (this.title) {
                const typeText = type === 'player' ? '闲家看牌 (Player Squeeze)' : '庄家看牌 (Banker Squeeze)';
                const color = type === 'player' ? '#8ecae6' : '#ffadad';
                this.title.innerHTML = `${typeText} <span id="peek-my-score"></span>`;
                this.title.style.color = color;
                this.myTitleScore = document.getElementById('peek-my-score');
            }
            
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
        
        const isSupplementPeek = this.cards.length === 1;
        
        cardsData.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'peek-opponent-card';
            if (index === 2) cardEl.classList.add('horizontal');
            
            const face = document.createElement('div');
            face.className = 'peek-opponent-card-face';
            this.setCardFace(face, card);
            
            const back = document.createElement('div');
            back.className = 'peek-opponent-card-back';
            
            let isRevealed = false;
            if (isSupplementPeek && index < 2) isRevealed = true;
            if (forceReveal) isRevealed = true;
            
            if (isRevealed) cardEl.classList.add('revealed');
            
            cardEl.onclick = () => {
                if (!cardEl.classList.contains('revealed')) {
                    cardEl.classList.add('revealed');
                    this.checkOpponentReveal(cardsData, type);
                }
            };
            
            cardEl.appendChild(face);
            cardEl.appendChild(back);
            this.opponentContainer.appendChild(cardEl);
        });
        
        if (forceReveal) {
            this.checkOpponentReveal(cardsData, type);
        }
    }
    
    checkOpponentReveal(cardsData, type) {
        const els = this.opponentContainer.querySelectorAll('.peek-opponent-card');
        const allRevealed = Array.from(els).every(el => el.classList.contains('revealed'));
        
        if (allRevealed) {
            const sum = cardsData.reduce((acc, c) => acc + c.value, 0);
            const score = sum % 10;
            const typeName = type === 'banker' ? '庄' : '闲';
            const text = `${typeName}${score}点`;
            
            if (this.opponentTitleScore) {
                this.opponentTitleScore.textContent = ` - ${text}`;
            }
            
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
            
            const face = document.createElement('div');
            face.className = 'peek-card-face';
            this.setCardFace(face, card);
            
            const maskTL = document.createElement('div');
            maskTL.className = 'corner-mask top-left';
            face.appendChild(maskTL);
            
            const maskBR = document.createElement('div');
            maskBR.className = 'corner-mask bottom-right';
            face.appendChild(maskBR);
            
            const back = document.createElement('div');
            back.className = 'peek-card-back';
            
            this.bindDrag(back);
            
            cardEl.appendChild(face);
            cardEl.appendChild(back);
            this.container.appendChild(cardEl);
        });
    }

    setCardFace(element, card) {
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
        };
        
        const onMove = (e) => {
            if (!isDragging) return;
            const point = e.touches ? e.touches[0] : e;
            const dx = point.clientX - startX;
            const dy = point.clientY - startY;
            element.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.1}deg)`;
        };
        
        const onEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove('dragging');
            
            const matrix = new WebKitCSSMatrix(window.getComputedStyle(element).transform);
            const dist = Math.sqrt(matrix.m41 * matrix.m41 + matrix.m42 * matrix.m42);
            
            if (dist > 100) {
                element.classList.add('revealed');
                this.checkAllRevealed();
            } else {
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
        const backs = this.container.querySelectorAll('.peek-card-back');
        const allRevealed = Array.from(backs).every(b => b.classList.contains('revealed'));
        
        if (allRevealed) {
            let totalScore = 0;
            const currentCardsScore = this.cards.reduce((acc, c) => acc + c.value, 0);
            
            if (this.savedInitialScore !== null && this.cards.length === 1) {
                 totalScore = (this.savedInitialScore + currentCardsScore) % 10;
            } else {
                 totalScore = currentCardsScore % 10;
            }
            
            this.myTitleScore.textContent = ` - ${totalScore}点`;
            
            const typeName = this.title.textContent.includes('闲') ? '闲' : '庄';
            const text = `${typeName}${totalScore}点`;
            if (typeof game !== 'undefined' && game.announcer) {
                game.announcer.speak(text);
            }

            setTimeout(() => this.finishPeek(), 500);
        }
    }

    finishPeek() {
        if (!this.container) return;
        const cards = this.container.querySelectorAll('.peek-card');
        cards.forEach(c => c.classList.add('fully-opened'));
        
        const backs = this.container.querySelectorAll('.peek-card-back');
        backs.forEach(b => b.classList.add('revealed'));

        setTimeout(() => {
            if (this.overlay) this.overlay.classList.remove('active');
            if (this.resolvePromise) {
                this.resolvePromise();
                this.resolvePromise = null;
            }
        }, 1000);
    }
}

// 游戏逻辑类
class BaccaratGame {
    constructor(config, onRoundEnd = null) {
        this.config = config || {
            balance: 10000,
            minLimit: 25,
            maxLimit: 1500000,
            commissionMode: 'classic',
            sideBets: { lucky6: false, lucky7: false }
        };
        
        this.onRoundEnd = onRoundEnd;
        
        this.balance = this.config.balance;
        this.totalBuyin = this.config.balance;
        
        // Random Max Rounds (58-72)
        this.maxRounds = Math.floor(Math.random() * (72 - 58 + 1)) + 58;

        this.deck = [];
        this.bet = {
            player: 0, banker: 0, tie: 0, playerPair: 0, bankerPair: 0,
            lucky6: 0, lucky6_2: 0, lucky6_3: 0, lucky7: 0, superLucky7: 0
        };
        
        this.currentChip = 25;
        this.isDealing = false;
        this.lastBet = null;
        this.historyLog = [];
        this.started = true;
        
        this.stats = {
            total: 0, banker: 0, player: 0, tie: 0,
            bankerPair: 0, playerPair: 0, lucky6: 0, lucky7: 0
        };

        this.squeezeMode = true;

        this.announcer = new VoiceAnnouncer();
        if (this.config.voiceVolume !== undefined) this.announcer.volume = this.config.voiceVolume;
        
        this.peekCtrl = new PeekController();
        
        // Initialize Roads
        this.initRoads();

        this.initUI();
        this.initDeck();
        this.bindEvents();
        this.updateBalanceUI();
        this.updateDealButtonState();
        this.updateClearButtonState();
        
        // Trigger Cut Animation on Init
        setTimeout(() => this.performCut(), 500);
    }
    
    initRoads() {
        this.roads = {};
        // Clear existing if any
        document.getElementById('dalu').innerHTML = '';
        document.getElementById('dayan').innerHTML = '';
        document.getElementById('xiaolu').innerHTML = '';
        document.getElementById('zhanglang').innerHTML = '';
        document.getElementById('zhuzailu').innerHTML = '';

        this.roads.dalu = new RoadMap('dalu', CONFIG.dalu);
        this.roads.dayan = new RoadMap('dayan', CONFIG.dayan);
        this.roads.xiaolu = new RoadMap('xiaolu', CONFIG.xiaolu);
        this.roads.zhanglang = new RoadMap('zhanglang', CONFIG.zhanglang);
        this.beadRoad = new BeadRoad('zhuzailu', CONFIG.zhuzailu);
    }
    
    loadHistory(history) {
        if (!history || !Array.isArray(history)) return;
        
        history.forEach(res => {
            this.updateStats(res.winner, res.pPair, res.bPair, !!res.lucky6, !!res.lucky7);
            this.recordResult(res.winner, res.pPair, res.bPair, res.lucky6, res.lucky7);
        });
    }

    recordResult(type, pPair, bPair, lucky6, lucky7) {
        this.historyLog.push({ winner: type, pPair, bPair, lucky6, lucky7 });
        
        if (type === 'tie') {
            this.beadRoad.addMarker('tie', 'T', pPair, bPair, lucky6, lucky7);
        } else {
            ['dayan', 'xiaolu', 'zhanglang'].forEach(k => {
                if (this.roads[k].enableNext) {
                    this.roads[k].enabled = true;
                    this.roads[k].enableNext = false;
                }
            });

            const info = this.roads.dalu.addMarker(type, pPair, bPair, lucky6, lucky7);

            if (info && info.movedRight && info.rowIndex === 0) {
                if (info.colIndex === 1) this.roads.dayan.enableNext = true;
                if (info.colIndex === 2) this.roads.xiaolu.enableNext = true;
                if (info.colIndex === 3) this.roads.zhanglang.enableNext = true;
            }

            const isDown = info ? info.movedDown : true;
            if (this.roads.dayan.enabled && info) this.roads.dayan.placeDerivedByBigRoadDirection(isDown, info);
            if (this.roads.xiaolu.enabled && info) this.roads.xiaolu.placeDerivedByBigRoadDirection(isDown, info);
            if (this.roads.zhanglang.enabled && info) this.roads.zhanglang.placeDerivedByBigRoadDirection(isDown, info);
            
            const text = type === 'banker' ? 'B' : 'P';
            this.beadRoad.addMarker(type, text, pPair, bPair, lucky6, lucky7);
        }
        
        this.updatePrediction();
    }
    
    updatePrediction() {
        if (!this.roads.dalu) return;
        
        const predictFor = (winner) => {
            const pos = this.roads.dalu.getNextBigRoadPosition(winner);
            const res = {};
            
            const calculateColor = (gap) => {
                const bigRoad = this.roads.dalu;
                const col = pos.colIndex;
                const row = pos.rowIndex;
                
                let color = null;
                if (row === 0) {
                    if (col < gap + 1) return null;
                    let lenPrev = 0;
                    let lenPrevGap = 0;
                    for (let r = 0; r < bigRoad.rows; r++) {
                        if (bigRoad.isOccupied(r, col - 1)) lenPrev++;
                        else break;
                    }
                    for (let r = 0; r < bigRoad.rows; r++) {
                        if (bigRoad.isOccupied(r, col - 1 - gap)) lenPrevGap++;
                        else break;
                    }
                    color = (lenPrev === lenPrevGap) ? 'banker' : 'player';
                } else {
                    if (col < gap) return null;
                    const isTargetOccupied = bigRoad.isOccupied(row, col - gap);
                    if (isTargetOccupied) {
                        color = 'banker'; 
                    } else {
                        const isPrevRowOccupied = bigRoad.isOccupied(row - 1, col - gap);
                        if (isPrevRowOccupied) {
                            color = 'player'; 
                        } else {
                            color = 'banker'; 
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
        const predictPlayer = predictFor('player');
        
        const renderSymbol = (id, color, type) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.className = 'pred-symbol';
            const marker = document.createElement('div');
            marker.style.width = '100%';
            marker.style.height = '100%';
            
            if (!color) {
                marker.className = 'marker no-prediction-dash';
            } else {
                let className = 'marker ';
                if (type === 'dayan') className += color === 'banker' ? 'dayan-red' : 'dayan-blue';
                else if (type === 'small') className += color === 'banker' ? 'small-red' : 'small-blue';
                else if (type === 'cockroach') className += color === 'banker' ? 'cockroach-red' : 'cockroach-blue';
                marker.className = className;
            }
            wrapper.appendChild(marker);
            el.appendChild(wrapper);
        };
        
        renderSymbol('pred-banker-dayan', predBanker.dayan, 'dayan');
        renderSymbol('pred-banker-small', predBanker.small, 'small');
        renderSymbol('pred-banker-cockroach', predBanker.cockroach, 'cockroach');
        
        renderSymbol('pred-player-dayan', predictPlayer.dayan, 'dayan');
        renderSymbol('pred-player-small', predictPlayer.small, 'small');
        renderSymbol('pred-player-cockroach', predictPlayer.cockroach, 'cockroach');
    }
    
    initUI() {
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            if (this.config.commissionMode === 'super6') {
                gameArea.classList.add('theme-super6');
            } else {
                gameArea.classList.remove('theme-super6');
            }
        }

        const bankerOdds = document.getElementById('banker-odds');
        if (this.config.commissionMode === 'super6') {
            bankerOdds.textContent = '1:1 (6点0.5)';
        } else {
            bankerOdds.textContent = '0.95:1';
        }
        
        const btnLucky6 = document.getElementById('bet-lucky6');
        const btnLucky6_2 = document.getElementById('bet-lucky6-2');
        const btnLucky6_3 = document.getElementById('bet-lucky6-3');
        const btnLucky7 = document.getElementById('bet-lucky7');
        const btnSuperLucky7 = document.getElementById('bet-super-lucky7');
        
        if (btnLucky6) btnLucky6.style.display = this.config.sideBets.lucky6 ? 'flex' : 'none';
        if (btnLucky6_2) btnLucky6_2.style.display = this.config.sideBets.lucky6 ? 'flex' : 'none';
        if (btnLucky6_3) btnLucky6_3.style.display = this.config.sideBets.lucky6 ? 'flex' : 'none';
        if (btnLucky7) btnLucky7.style.display = this.config.sideBets.lucky7 ? 'flex' : 'none';
        if (btnSuperLucky7) btnSuperLucky7.style.display = this.config.sideBets.superLucky7 ? 'flex' : 'none';

        const btnPeekToggle = document.getElementById('btn-peek-toggle');
        if (btnPeekToggle) {
            this.updatePeekButtonUI(btnPeekToggle);
            btnPeekToggle.onclick = () => {
                this.squeezeMode = !this.squeezeMode;
                this.updatePeekButtonUI(btnPeekToggle);
            };
        }
        
        this.updateStatsUI();
        
        // Settings Modal bindings
        const btnSettingsToggle = document.getElementById('btn-settings-toggle');
        const modal = document.getElementById('settings-modal');
        const btnContinue = document.getElementById('btn-start-game');
        
        if (btnSettingsToggle) {
            btnSettingsToggle.onclick = () => {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            };
        }
        
        if (btnContinue) {
            btnContinue.onclick = () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                // Apply setting changes if any
                // Simplified for now
            };
        }
        
        // Info Modal
        const btnBalanceInfo = document.getElementById('btn-balance-info');
        const balanceInfoModal = document.getElementById('balance-info-modal');
        const btnCloseInfo = document.getElementById('btn-close-info');

        if (btnBalanceInfo && balanceInfoModal) {
            btnBalanceInfo.addEventListener('click', () => {
                const totalBuyin = this.totalBuyin;
                const currentBalance = this.balance;
                const winLoss = currentBalance - totalBuyin;
                
                const totalBuyinEl = document.getElementById('info-total-buyin');
                const winLossEl = document.getElementById('info-win-loss');
                
                if (totalBuyinEl) totalBuyinEl.textContent = totalBuyin.toLocaleString();
                if (winLossEl) {
                    const sign = winLoss > 0 ? '+' : '';
                    winLossEl.textContent = sign + winLoss.toLocaleString();
                    if (winLoss > 0) winLossEl.style.color = '#34c759';
                    else if (winLoss < 0) winLossEl.style.color = '#ff4444';
                    else winLossEl.style.color = 'black';
                }
                balanceInfoModal.classList.remove('hidden');
                balanceInfoModal.style.display = 'flex';
            });

            const closeInfo = () => {
                balanceInfoModal.classList.add('hidden');
                balanceInfoModal.style.display = 'none';
            };
            if (btnCloseInfo) btnCloseInfo.addEventListener('click', closeInfo);
        }
    }

    updatePeekButtonUI(btn) {
        if (!btn) return;
        if (this.squeezeMode) {
            btn.classList.remove('disabled');
            btn.textContent = '👁️'; 
        } else {
            btn.classList.add('disabled');
            btn.textContent = '🙈';
        }
    }
    
    initDeck() {
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0];
        
        this.deck = [];
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
        this.deck.splice(0, Math.floor(Math.random() * 20) + 10);
    }
    
    bindEvents() {
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.currentChip = parseInt(e.currentTarget.dataset.val);
            });
        });
        const firstChip = document.querySelector('.chip');
        if (firstChip) firstChip.click();
        
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
                btn.onclick = () => this.placeBet(type, btn);
            }
        }
        
        document.getElementById('btn-clear').onclick = () => this.clearBets();
        document.getElementById('btn-deal').onclick = () => this.deal();
    }
    
    updateBalanceUI() {
        const el = document.getElementById('balance-amount');
        if (!el) return;
        
        el.textContent = this.balance.toLocaleString();
        
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
        
        if (type === 'player' && this.bet.banker > 0) {
            alert('庄和闲不能同时下注');
            return;
        }
        if (type === 'banker' && this.bet.player > 0) {
            alert('庄和闲不能同时下注');
            return;
        }

        const amount = this.currentChip;
        
        if (this.balance < amount) {
            alert('余额不足！');
            return;
        }
        
        if (this.bet[type] + amount > this.config.maxLimit) {
            alert(`超过单注限红: ${this.config.maxLimit}`);
            return;
        }
        
        this.balance -= amount;
        this.bet[type] += amount;
        
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
            if (!this.lastBet) return;

            const rebetTotal = Object.values(this.lastBet).reduce((a, b) => a + b, 0);
            if (rebetTotal === 0) return;

            if (this.balance < rebetTotal) {
                alert('余额不足，无法重下');
                return;
            }

            this.balance -= rebetTotal;
            this.bet = { ...this.lastBet };
            this.updateBalanceUI();

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
        
        if (this.stats.total + 1 === this.maxRounds) {
            const overlay = document.getElementById('result-overlay');
            if (overlay) {
                overlay.textContent = '最後一局';
                overlay.classList.remove('hidden');
                overlay.className = 'result-overlay';
                await new Promise(r => setTimeout(r, 1500));
                overlay.classList.add('hidden');
            }
        }

        const overlay = document.getElementById('result-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        this.lastBet = { ...this.bet };

        const totalBet = Object.values(this.bet).reduce((a, b) => a + b, 0);
        
        if (totalBet > 0) {
            if (totalBet < this.config.minLimit) {
                alert(`下注金额低于台红最低限制: ${this.config.minLimit}`);
                this.isDealing = false;
                document.getElementById('btn-deal').disabled = false;
                return;
            }
        }
        
        const peekPlayer = this.bet.player > 0;
        const peekBanker = this.bet.banker > 0;
        const shouldPeek = this.squeezeMode && (peekPlayer || peekBanker);
        const shouldHideInitial = shouldPeek;
        
        this.clearTable();
        
        const pCards = [];
        const bCards = [];
        
        await this.drawCard('player', pCards, shouldHideInitial);
        await this.drawCard('banker', bCards, shouldHideInitial);
        await this.drawCard('player', pCards, shouldHideInitial);
        await this.drawCard('banker', bCards, shouldHideInitial);
        
        if (shouldPeek) {
            if (peekPlayer) {
                await this.peekCtrl.peek(pCards, 'player', bCards, 'banker');
                await this.revealHand('player', pCards);
                await this.revealHand('banker', bCards);
            } else if (peekBanker) {
                await this.peekCtrl.peek(bCards, 'banker', pCards, 'player');
                await this.revealHand('banker', bCards);
                await this.revealHand('player', pCards);
            }
        }
        
        let pScore = this.calcScore(pCards);
        let bScore = this.calcScore(bCards);
        
        this.updateScore('player', pScore);
        this.updateScore('banker', bScore);
        
        let pDraw = false;
        let bDraw = false;
        
        const natural = pScore >= 8 || bScore >= 8;
        
        if (!natural) {
            if (pScore <= 5) {
                pDraw = true;
            }
            
            if (!pDraw) {
                if (bScore <= 5) {
                    bDraw = true;
                }
            } else {
                const hide3rd = shouldPeek;
                await this.drawCard('player', pCards, hide3rd);
                const p3Card = pCards[2];
                const p3 = p3Card.value;
                
                if (bScore <= 2) bDraw = true;
                else if (bScore === 3 && p3 !== 8) bDraw = true;
                else if (bScore === 4 && (p3 >= 2 && p3 <= 7)) bDraw = true;
                else if (bScore === 5 && (p3 >= 4 && p3 <= 7)) bDraw = true;
                else if (bScore === 6 && (p3 === 6 || p3 === 7)) bDraw = true;
            }
            
            if (bDraw) {
                const hide3rd = shouldPeek;
                await this.drawCard('banker', bCards, hide3rd);
            }
            
            if (shouldPeek && pDraw && peekPlayer) {
                const initialPScore = this.calcScore([pCards[0], pCards[1]]);
                await this.peekCtrl.peek([pCards[2]], 'player', bCards, 'banker', initialPScore);
                await this.revealHand('player', pCards);
                if (bDraw) await this.revealHand('banker', bCards);
            } 
            else if (shouldPeek && bDraw && peekBanker) {
                const initialBScore = this.calcScore([bCards[0], bCards[1]]);
                let forceOpponentReveal = false;
                
                if (initialBScore >= 3 && pDraw) {
                    forceOpponentReveal = true;
                    await this.revealHand('player', pCards);
                }
                
                await this.peekCtrl.peek([bCards[2]], 'banker', pCards, 'player', initialBScore, forceOpponentReveal);
                await this.revealHand('banker', bCards);
                
                if (pDraw && !forceOpponentReveal) {
                    await this.revealHand('player', pCards);
                }
            }
            else {
                 if (shouldPeek) {
                     if (pDraw) await this.revealHand('player', pCards);
                     if (bDraw) await this.revealHand('banker', bCards);
                 }
            }
            
            if (pDraw) {
                pScore = this.calcScore(pCards);
                this.updateScore('player', pScore);
            }
            if (bDraw) {
                bScore = this.calcScore(bCards);
                this.updateScore('banker', bScore);
            }
        }
        
        setTimeout(() => {
            this.settle(pScore, bScore, pCards, bCards);
            const needsReset = this.stats.total >= this.maxRounds;
            if (!needsReset) {
                this.isDealing = false;
                document.getElementById('btn-deal').disabled = false;
                this.updateDealButtonState();
            }
        }, 500);
    }
    
    async drawCard(who, handArr, isHidden = false) {
        if (this.deck.length < 10) this.initDeck();
        
        const card = this.deck.pop();
        handArr.push(card);
        
        const container = document.getElementById(`cards-${who}`);
        const cardEl = document.createElement('div');
        
        const isThird = handArr.length === 3;
        cardEl.className = `card ${isThird ? 'horizontal' : ''}`;
        
        const suitMap = { '♠': 3, '♥': 2, '♣': 0, '♦': 1 };
        const rankMap = {
            'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
            '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12
        };
        
        const suitIdx = suitMap[card.suit];
        const rankIdx = rankMap[card.rank];
        const xPos = (rankIdx * 100 / 12).toFixed(4) + '%';
        const yPos = (suitIdx * 100 / 4).toFixed(4) + '%';
        
        if (isHidden) {
            cardEl.classList.add('back');
            cardEl.style.backgroundImage = 'none';
            cardEl.style.background = 'repeating-linear-gradient(45deg, #1a3c75, #1a3c75 5px, #142f5c 5px, #142f5c 10px)';
            cardEl.style.border = '2px solid white';
            cardEl.dataset.xPos = xPos;
            cardEl.dataset.yPos = yPos;
        } else {
            cardEl.style.backgroundPosition = `${xPos} ${yPos}`;
        }

        cardEl.style.opacity = '0';
        cardEl.style.transform = 'translateY(-20px)';
        container.appendChild(cardEl);
        cardEl.offsetHeight;
        cardEl.style.transition = 'all 0.3s';
        cardEl.style.opacity = '1';
        cardEl.style.transform = 'translateY(0)';
        
        return new Promise(resolve => setTimeout(resolve, 600));
    }
    
    async revealHand(who, cards) {
        const container = document.getElementById(`cards-${who}`);
        const cardEls = container.querySelectorAll('.card');
        const promises = [];
        
        cardEls.forEach((el, index) => {
            if (el.classList.contains('back')) {
                const p = new Promise(resolve => {
                    el.style.transition = 'transform 0.3s';
                    el.style.transform = 'scaleX(0)'; 
                    
                    setTimeout(() => {
                        el.classList.remove('back');
                        el.style.background = ''; 
                        el.style.border = '';
                        el.style.backgroundImage = "url('assets/cards.png'), url('assets/cards.svg')";
                        el.style.backgroundSize = "1300% 500%";
                        el.style.backgroundPosition = `${el.dataset.xPos} ${el.dataset.yPos}`;
                        
                        el.style.transform = 'scaleX(1)'; 
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
        
        let winnings = 0;
        let totalBet = 0;
        
        if (this.bet.player > 0) {
            totalBet += this.bet.player;
            if (winner === 'player') winnings += this.bet.player * 2;
            else if (winner === 'tie') winnings += this.bet.player;
        }
        
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
                winnings += this.bet.banker;
            }
        }
        
        if (this.bet.tie > 0) {
            totalBet += this.bet.tie;
            if (winner === 'tie') winnings += this.bet.tie * 9;
        }
        
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
        
        const bankerWin6 = (winner === 'banker' && bScore === 6);
        const bankerCardsCount = bCards.length;
        
        if (this.bet.lucky6 > 0) {
            totalBet += this.bet.lucky6;
            if (bankerWin6) {
                const odds = bankerCardsCount === 2 ? 12 : 20;
                winnings += this.bet.lucky6 * (1 + odds);
            }
        }
        
        if (this.bet.lucky6_2 > 0) {
            totalBet += this.bet.lucky6_2;
            if (bankerWin6 && bankerCardsCount === 2) winnings += this.bet.lucky6_2 * 23;
        }
        
        if (this.bet.lucky6_3 > 0) {
            totalBet += this.bet.lucky6_3;
            if (bankerWin6 && bankerCardsCount === 3) winnings += this.bet.lucky6_3 * 51;
        }
        
        const playerWin7 = (winner === 'player' && pScore === 7);
        const superCondition = (playerWin7 && bScore === 6);
        const playerCardsCount = pCards.length;
        const totalCardsCount = pCards.length + bCards.length;
        
        if (this.bet.lucky7 > 0) {
            totalBet += this.bet.lucky7;
            if (playerWin7) {
                const odds = playerCardsCount === 2 ? 6 : 15;
                winnings += this.bet.lucky7 * (1 + odds);
            }
        }
        
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
        
        let resultText = '';
        if (winner === 'tie') resultText = '和';
        else if (winner === 'banker') resultText = bankerWin6 ? '庄赢(幸運6)' : '庄赢';
        else if (winner === 'player') resultText = playerWin7 ? '闲赢(幸運7)' : '闲赢';
        
        const overlay = document.getElementById('result-overlay');
        if (overlay) {
            let htmlContent = `<div>${resultText}</div>`;
            if (winnings > 0) {
                htmlContent += `<div class="win-amount">赢取: ${Math.floor(winnings).toLocaleString()}</div>`;
            }
            overlay.innerHTML = htmlContent;
            overlay.classList.remove('hidden');
            overlay.className = 'result-overlay'; 
            if (winner === 'banker') overlay.classList.add('text-banker');
            else if (winner === 'player') overlay.classList.add('text-player');
            else if (winner === 'tie') overlay.classList.add('text-tie');
            
            overlay.style.animation = 'none';
            overlay.offsetHeight;
            overlay.style.animation = 'moveFromCenter 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }

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
                setTimeout(() => btn.classList.remove('win-flash'), 1500);
            }
        });
        
        this.updateStats(winner, pPair, bPair, bankerWin6, playerWin7);
        this.recordResult(winner, pPair, bPair, bankerWin6, playerWin7);

        if (winnings > 0) {
            this.balance += winnings;
        }
        this.updateBalanceUI();
        
        let lucky6Val = false;
        if (bankerWin6) lucky6Val = bankerCardsCount;
        let lucky7Val = false;
        if (playerWin7) lucky7Val = playerCardsCount;

        const winScore = (winner === 'banker') ? bScore : pScore;
        this.announcer.announceResult(winner, winScore, bankerWin6, playerWin7);

        // Trigger callback for external syncing BEFORE possible reset
        if (this.onRoundEnd) {
            this.onRoundEnd({
                winner,
                pPair,
                bPair,
                lucky6: bankerWin6 ? (bankerCardsCount === 2 ? 2 : 3) : null,
                lucky7: playerWin7 ? (playerCardsCount === 2 ? 2 : 3) : null
            });
        }

        if (this.stats.total === this.maxRounds - 1) {
             this.announcer.announceLastRound();
        }

        if (this.stats.total >= this.maxRounds) {
             setTimeout(() => {
                 this.resetGame();
             }, 2000);
        }

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
        this.historyLog = [];
        this.updateStatsUI();
        this.initDeck();
        this.initRoads();
        this.clearTable();
        
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
        
        const overlay = document.getElementById('result-overlay');
        if(overlay) {
             overlay.textContent = '洗牌中...';
             this.announcer.announceShuffling();
             overlay.classList.remove('hidden');
             setTimeout(() => {
                 overlay.classList.add('hidden');
                 this.performCut();
             }, 1500);
        }
        
        this.updatePrediction();
    }

    async performCut() {
        // 如果已经有历史记录（不是新的一靴），则跳过销牌
        if (this.historyLog.length > 0) {
            this.isDealing = false;
            const btnDeal = document.getElementById('btn-deal');
            if (btnDeal) {
                btnDeal.disabled = false;
                this.updateDealButtonState();
            }
            return;
        }

        if (this.deck.length < 20) this.initDeck();

        const overlay = document.getElementById('cut-overlay');
        const indicatorContainer = document.getElementById('cut-indicator-card');
        const burnGrid = document.getElementById('burn-cards-grid');
        const infoText = document.getElementById('cut-info-text');
        
        if (!overlay || !indicatorContainer || !burnGrid) return;

        const indicatorCard = this.deck.pop();
        
        let burnCount = indicatorCard.value;
        if (indicatorCard.rank === 'J' || indicatorCard.rank === 'Q' || indicatorCard.rank === 'K' || indicatorCard.rank === '10') {
            burnCount = 10;
        } else if (indicatorCard.rank === 'A') {
            burnCount = 1;
        }
        
        if (this.announcer) {
            this.announcer.announceCut(burnCount);
        }
        
        infoText.textContent = `${indicatorCard.rank}点 - 销牌${burnCount}张`;

        // Render Indicator
        indicatorContainer.innerHTML = '';
        indicatorContainer.style.backgroundImage = '';
        const suitMap = { '♠': 3, '♥': 2, '♣': 0, '♦': 1 };
        const rankMap = {
            'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
            '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12
        };
        const suitIdx = suitMap[indicatorCard.suit];
        const rankIdx = rankMap[indicatorCard.rank];
        const xPos = (rankIdx * 100 / 12).toFixed(4) + '%';
        const yPos = (suitIdx * 100 / 4).toFixed(4) + '%';
        
        indicatorContainer.style.backgroundImage = "url('assets/cards.png'), url('assets/cards.svg')";
        indicatorContainer.style.backgroundPosition = `${xPos} ${yPos}`;
        indicatorContainer.style.backgroundSize = "1300% 500%";
        
        const burnCards = [];
        for (let i = 0; i < burnCount; i++) {
            burnCards.push(this.deck.pop());
        }

        burnGrid.innerHTML = '';
        burnCards.forEach(() => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card'; 
            burnGrid.appendChild(cardEl);
        });

        overlay.classList.remove('hidden');
        await new Promise(resolve => setTimeout(resolve, 3000));
        overlay.classList.add('hidden');

        this.isDealing = false;
        const btnDeal = document.getElementById('btn-deal');
        if (btnDeal) {
            btnDeal.disabled = false;
            this.updateDealButtonState();
        }
    }
}

// Music Controller Class
class MusicController {
    constructor() {
        if (window.location.pathname.includes('roadmap-test.html')) return;

        this.bgm = new Audio('assets/bgm.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.1;
        this.isPlaying = false;
        
        this.btnSetting = document.getElementById('btn-music-toggle');
        this.volumeSlider = document.getElementById('music-volume');
        if (this.volumeSlider) this.volumeSlider.value = 0.1;
        this.statusText = document.getElementById('music-status-text');
        this.btnMain = document.getElementById('btn-music-toggle-main');
        
        this.hasInteracted = false;
        this.init();
    }
    
    init() {
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value);
                this.bgm.volume = vol;
                if (typeof game !== 'undefined' && game.announcer) {
                    game.announcer.volume = vol;
                }
            });
        }

        if (this.btnSetting) this.btnSetting.addEventListener('click', () => this.toggle());
        if (this.btnMain) this.btnMain.addEventListener('click', () => this.toggle());
        
        const startPlay = () => {
            if (!this.hasInteracted) {
                this.hasInteracted = true;
                if (!this.isPlaying) this.play();
                document.removeEventListener('click', startPlay);
                document.removeEventListener('touchstart', startPlay);
            }
        };
        
        document.addEventListener('click', startPlay);
        document.addEventListener('touchstart', startPlay);
    }
    
    toggle() {
        if (this.isPlaying) this.pause();
        else this.play();
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
                if (this.isPlaying) btn.classList.add('playing');
                else btn.classList.remove('playing');
            }
        };

        updateBtn(this.btnSetting);
        updateBtn(this.btnMain);

        if (this.statusText) {
            const isCN = (typeof currentLang !== 'undefined' && currentLang === 'zh-CN');
            this.statusText.textContent = this.isPlaying ? (isCN ? '播放中' : 'Playing') : (isCN ? '已关闭' : 'Off');
        }
    }
}

// App Class - Main Entry Point
class App {
    constructor() {
        this.state = {
            nickname: 'Player',
            balance: 10000,
            settings: {
                minLimit: 100,
                maxLimit: 10000,
                commissionMode: 'classic', 
                sideBets: { lucky6: false, lucky7: false, superLucky7: false },
                musicVolume: 0.1,
                voiceVolume: 1.0,
                language: 'zh-CN'
            },
            tables: [], 
            currentTableId: null
        };
        
        this.views = {
            login: document.getElementById('login-view'),
            lobby: document.getElementById('lobby-view'),
            game: document.getElementById('game-view')
        };
        
        this.init();
    }
    
    init() {
        const btnEnterLobby = document.getElementById('btn-enter-lobby');
        if (btnEnterLobby) {
            btnEnterLobby.addEventListener('click', () => this.handleLogin());
        }
        
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.switchView('login');
            });
        }
        
        this.musicCtrl = new MusicController();
        
        // Setup login inputs
        const buyinInput = document.getElementById('login-balance');
        if (buyinInput) {
            buyinInput.addEventListener('input', function(e) {
                // simple int check
            });
        }

        // Initialize Volume Sliders in Login
        const loginBgmVol = document.getElementById('login-bgm-volume');
        if(loginBgmVol) {
             loginBgmVol.addEventListener('input', (e) => {
                 this.musicCtrl.bgm.volume = e.target.value / 100;
             });
        }

        this.switchView('login');
    }
    
    switchView(viewName) {
        Object.values(this.views).forEach(el => {
            if(el) el.classList.add('hidden');
        });
        if (this.views[viewName]) this.views[viewName].classList.remove('hidden');
    }
    
    handleLogin() {
        const nickname = document.getElementById('login-nickname').value || 'Guest';
        const balance = parseInt(document.getElementById('login-balance').value) || 10000;
        
        const limitSelect = document.getElementById('login-table-limit');
        const [min, max] = limitSelect.value.split('-').map(Number);
        
        const commMode = document.querySelector('input[name="login-commission"]:checked').value;
        
        const sbLucky6 = document.getElementById('login-sb-lucky6').checked;
        const sbLucky7 = document.getElementById('login-sb-lucky7').checked;
        const sbSuperLucky7 = document.getElementById('login-sb-super7').checked;
        
        const bgmVol = document.getElementById('login-bgm-volume').value / 100;
        const voiceVol = document.getElementById('login-voice-volume').value / 100;
        
        const lang = document.getElementById('login-language').value;
        
        this.state.nickname = nickname;
        this.state.balance = balance;
        this.state.settings = {
            minLimit: min,
            maxLimit: max,
            commissionMode: commMode,
            sideBets: { lucky6: sbLucky6, lucky7: sbLucky7, superLucky7: sbSuperLucky7 },
            musicVolume: bgmVol,
            voiceVolume: voiceVol,
            language: lang
        };
        
        updateLanguage(lang);
        if (this.musicCtrl) {
            this.musicCtrl.bgm.volume = bgmVol;
        }
        
        this.generateTables();
        this.renderLobby();
        this.switchView('lobby');
    }
    
    generateTables() {
        this.state.tables = [];
        for (let i = 1; i <= 10; i++) {
            const rounds = Math.floor(Math.random() * 31);
            const history = this.generateRandomHistory(rounds);
            this.state.tables.push({
                id: i,
                history: history
            });
        }
    }
    
    generateRandomHistory(rounds) {
        const history = [];
        for (let i = 0; i < rounds; i++) {
            const rand = Math.random();
            let winner = 'banker';
            if (rand < 0.4462) winner = 'player';
            else if (rand > 0.9048) winner = 'tie';
            
            const pPair = Math.random() < 0.07;
            const bPair = Math.random() < 0.07;
            const lucky6 = (winner === 'banker' && Math.random() < 0.05) ? (Math.random() < 0.5 ? 2 : 3) : false;
            const lucky7 = (winner === 'player' && Math.random() < 0.05) ? (Math.random() < 0.5 ? 2 : 3) : false;
            
            history.push({ winner, pPair, bPair, lucky6, lucky7 });
        }
        return history;
    }
    
    renderLobby() {
        const list = document.getElementById('lobby-table-list');
        list.innerHTML = '';
        
        document.getElementById('lobby-nickname').textContent = this.state.nickname;
        document.getElementById('lobby-balance').textContent = this.state.balance.toLocaleString();
        
        this.state.tables.forEach(table => {
            const card = document.createElement('div');
            card.className = 'table-card';
            
            // Get last result
            let lastResultText = 'New Game';
            if (table.history.length > 0) {
                const last = table.history[table.history.length - 1];
                const winnerMap = { 'banker': '庄赢', 'player': '闲赢', 'tie': '和' };
                lastResultText = winnerMap[last.winner];
                if (last.winner === 'banker' && last.lucky6) lastResultText += ' (幸運6)';
                if (last.winner === 'player' && last.lucky7) lastResultText += ' (幸運7)';
            }
            
            const header = document.createElement('div');
            header.className = 'table-info-bar';
            header.innerHTML = `
                <div class="table-name">Table ${table.id}</div>
                <div class="table-last-result" style="font-size: 12px; color: #666; font-weight: bold;">Last: ${lastResultText}</div>
                <div class="table-rounds">Rounds: ${table.history.length}</div>
            `;
            
            const roadContainer = document.createElement('div');
            roadContainer.className = 'table-roadmap grid-dalu';
            roadContainer.id = `lobby-road-${table.id}`;
            
            // Make entire card clickable
            card.onclick = () => this.joinTable(table.id);
            
            card.appendChild(header);
            card.appendChild(roadContainer);
            // Removed explicit Join button as the card itself is clickable
            list.appendChild(card);
            
            setTimeout(() => {
                const road = new RoadMap(`lobby-road-${table.id}`, { rows: 6, cols: 30, type: 'dalu' });
                table.history.forEach(res => {
                    road.addMarker(res.winner, res.pPair, res.bPair, res.lucky6, res.lucky7);
                });
            }, 0);
        });
    }
    
    joinTable(tableId) {
        this.state.currentTableId = tableId;
        const table = this.state.tables.find(t => t.id === tableId);
        
        const config = {
            ...this.state.settings,
            balance: this.state.balance
        };
        
        game = new BaccaratGame(config, (result) => {
            // Callback when current table round ends
            // 1. Sync current table history
            if (table) {
                table.history.push(result);
            }
            
            // 2. Simulate other tables
            this.simulateOtherTables(tableId);
        });
        game.loadHistory(table.history);
        
        this.addBackButton();
        this.switchView('game');
    }

    simulateOtherTables(excludeTableId) {
        this.state.tables.forEach(t => {
            if (t.id === excludeTableId) return;
            
            // Generate one random result
            const res = this.generateRandomResult();
            t.history.push(res);
        });
    }

    generateRandomResult() {
        const r = Math.random();
        let winner = 'banker';
        if (r > 0.4586 + 0.4462) winner = 'tie';
        else if (r > 0.4586) winner = 'player';
        
        const pPair = Math.random() < 0.0746;
        const bPair = Math.random() < 0.0746;
        
        let lucky6 = null;
        if (winner === 'banker' && Math.random() < 0.05) { // Rough approx
            lucky6 = Math.random() < 0.6 ? 2 : 3;
        }
        
        let lucky7 = null;
        if (winner === 'player' && Math.random() < 0.05) {
             lucky7 = Math.random() < 0.6 ? 2 : 3;
        }

        return { winner, pPair, bPair, lucky6, lucky7 };
    }
    
    addBackButton() {
        if (document.getElementById('btn-return-lobby')) return;
        
        // Find a place to insert
        const header = document.querySelector('.game-area');
        if (header) {
             const btn = document.createElement('button');
             btn.id = 'btn-return-lobby';
             btn.className = 'btn-secondary-small';
             btn.style.position = 'absolute';
             btn.style.top = '10px';
             btn.style.left = '10px';
             btn.style.zIndex = '100';
             btn.textContent = '🏠 返回大厅';
             btn.onclick = () => this.returnToLobby();
             header.appendChild(btn);
        }
    }
    
    returnToLobby() {
        if (!game) return;
        
        this.state.balance = game.balance;
        
        const currentTable = this.state.tables.find(t => t.id === this.state.currentTableId);
        if (currentTable) {
            currentTable.history = game.historyLog; 
        }
        
        this.switchView('lobby');
        this.renderLobby(); 
    }
}

// Global Variables
let game;
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
