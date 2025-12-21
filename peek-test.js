class PeekController {
    constructor() {
        this.overlay = document.getElementById('peek-overlay');
        this.container = document.querySelector('.peek-container');
        this.btnOpen = document.querySelector('.btn-open');
        this.title = document.querySelector('.peek-title');
        
        this.cards = [];
        this.resolvePromise = null;
        
        this.btnOpen.addEventListener('click', () => this.finishPeek());
    }

    // Start Peeking Session
    // cardsData: Array of {suit, rank, value}
    // type: 'player' | 'banker'
    peek(cardsData, type) {
        return new Promise((resolve) => {
            this.cards = cardsData;
            this.resolvePromise = resolve;
            
            // Setup UI
            this.title.textContent = type === 'player' ? '闲家看牌 (Player Squeeze)' : '庄家看牌 (Banker Squeeze)';
            this.title.style.color = type === 'player' ? '#8ecae6' : '#ffadad';
            
            this.renderCards(cardsData);
            this.overlay.classList.add('active');
        });
    }

    renderCards(cardsData) {
        this.container.innerHTML = '';
        
        cardsData.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'peek-card';
            
            // Check if it's a 3rd card (single card scenario)
            if (cardsData.length === 1) {
                cardEl.classList.add('horizontal');
            }
            
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
            e.preventDefault(); // Prevent scroll
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
            setTimeout(() => this.finishPeek(), 500);
        }
    }

    finishPeek() {
        // Mark all cards as fully opened to hide masks
        const cards = this.container.querySelectorAll('.peek-card');
        cards.forEach(c => c.classList.add('fully-opened'));
        
        // Also ensure all backs are 'revealed' if button was clicked
        const backs = this.container.querySelectorAll('.peek-card-back');
        backs.forEach(b => b.classList.add('revealed'));

        // Delay closing overlay to let user see full card
        setTimeout(() => {
            this.overlay.classList.remove('active');
            if (this.resolvePromise) {
                this.resolvePromise();
                this.resolvePromise = null;
            }
        }, 1000); // 1s delay to show revealed numbers
    }
}

// Test Logic
const peekCtrl = new PeekController();

// Mock Cards
const mockPlayerCards = [
    { suit: '♠', rank: '8', value: 8 },
    { suit: '♥', rank: 'K', value: 0 }
];

const mockBankerCards = [
    { suit: '♣', rank: '9', value: 9 },
    { suit: '♦', rank: '7', value: 7 }
];

const mock3rdCard = [
    { suit: '♦', rank: '5', value: 5 }
];

document.getElementById('btn-test-player').addEventListener('click', async () => {
    console.log('Start Peek Player');
    await peekCtrl.peek(mockPlayerCards, 'player');
    console.log('End Peek Player');
});

document.getElementById('btn-test-banker').addEventListener('click', async () => {
    console.log('Start Peek Banker');
    await peekCtrl.peek(mockBankerCards, 'banker');
    console.log('End Peek Banker');
});

document.getElementById('btn-test-3rd').addEventListener('click', async () => {
    console.log('Start Peek 3rd Card');
    await peekCtrl.peek(mock3rdCard, 'player'); // Assume player for color, but logic is generic
    console.log('End Peek 3rd Card');
});
