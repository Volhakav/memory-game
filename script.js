const CARD_SYMBOLS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isLocked = false;
let mismatchTimeout = null;
let movesCounterEl, pairsCounterEl, boardEl;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    startNewGame();
});

function initApp() {
    const header = document.createElement('header');
    
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'btn';
    newGameBtn.textContent = 'Новая игра';
    newGameBtn.setAttribute('aria-label', 'Начать новую игру');
    newGameBtn.addEventListener('click', startNewGame);

    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.className = 'btn';
    leaderboardBtn.textContent = 'Таблица лидеров';
    leaderboardBtn.setAttribute('aria-label', 'Открыть таблицу лидеров');
    leaderboardBtn.addEventListener('click', openLeaderboardModal);

    header.append(newGameBtn, leaderboardBtn);

    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';

    const movesWrapper = document.createElement('div');
    movesCounterEl = document.createElement('span');
    movesCounterEl.textContent = '0';
    movesWrapper.textContent = 'Ходы: ';
    movesWrapper.append(movesCounterEl);

    const pairsWrapper = document.createElement('div');
    pairsCounterEl = document.createElement('span');
    pairsCounterEl.textContent = '0 из 8';
    pairsWrapper.textContent = 'Найденные пары: ';
    pairsWrapper.append(pairsCounterEl);

    statsContainer.append(movesWrapper, pairsWrapper);

    boardEl = document.createElement('div');
    boardEl.className = 'game-board';

    document.body.append(header, statsContainer, boardEl);
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startNewGame() {
    if (mismatchTimeout) {
        clearTimeout(mismatchTimeout);
        mismatchTimeout = null;
    }

    isLocked = false;
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;

    updateStats();

    const duplicatedSymbols = [...CARD_SYMBOLS, ...CARD_SYMBOLS];
    const shuffledSymbols = shuffle(duplicatedSymbols);

    cards = shuffledSymbols.map((symbol, index) => ({
        id: index,
        symbol: symbol,
        isFlipped: false,
        isMatched: false,
        element: null 
    }));

    renderBoard();
}

function renderBoard() {
    boardEl.textContent = ''; 

    cards.forEach((cardData) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.id = cardData.id;

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = cardData.symbol;

        cardInner.append(cardFront, cardBack);
        cardEl.append(cardInner);

        cardData.element = cardEl;

        cardEl.addEventListener('click', () => handleCardClick(cardData.id));
        boardEl.append(cardEl);
    });
}

function handleCardClick(id) {
    if (isLocked) return;

    const clickedCard = cards.find(c => c.id === id);

    if (clickedCard.isFlipped || clickedCard.isMatched) return;
    if (flippedCards.length === 1 && flippedCards[0].id === id) return;

    clickedCard.isFlipped = true;
    clickedCard.element.classList.add('flipped');
    flippedCards.push(clickedCard);

    if (flippedCards.length === 2) {
        moves++;
        updateStats();

        const [card1, card2] = flippedCards;

        if (card1.symbol === card2.symbol) {
            card1.isMatched = true;
            card2.isMatched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            
            matchedPairs++;
            updateStats();
            flippedCards = [];

            if (matchedPairs === 8) {
                saveGameResult(moves);
                setTimeout(openVictoryModal, 500);
            }
        } else {
            isLocked = true;
            mismatchTimeout = setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                
                flippedCards = [];
                isLocked = false;
                mismatchTimeout = null;
            }, 1000);
        }
    }
}

function updateStats() {
    if (movesCounterEl && pairsCounterEl) {
        movesCounterEl.textContent = moves;
        pairsCounterEl.textContent = `${matchedPairs} из 8`;
    }
}

function createModal(contentElement) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.append(contentElement);
    overlay.append(modal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay);
        }
    });

    const escListener = (e) => {
        if (e.key === 'Escape') {
            closeModal(overlay);
            window.removeEventListener('keydown', escListener);
        }
    };
    window.addEventListener('keydown', escListener);

    document.body.append(overlay);
    document.body.style.overflow = 'hidden';

    return overlay;
}

function closeModal(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.remove();
        document.body.style.overflow = '';
    }
}

function openVictoryModal() {
    const content = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Победа! 🎉';

    const text = document.createElement('p');
    text.textContent = `Вы нашли все пары за ${moves} ходов.`;

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'modal-buttons';

    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'btn';
    newGameBtn.textContent = 'Новая игра';
    newGameBtn.setAttribute('aria-label', 'Начать новую игру');
    newGameBtn.addEventListener('click', () => {
        closeModal(modalOverlay);
        startNewGame();
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.textContent = 'Закрыть';
    closeBtn.setAttribute('aria-label', 'Закрыть окно победы');
    closeBtn.addEventListener('click', () => {
        closeModal(modalOverlay);
    });

    buttonsWrapper.append(newGameBtn, closeBtn);
    content.append(title, text, buttonsWrapper);

    const modalOverlay = createModal(content);
}

function getLeaderboardData() {
    try {
        const data = localStorage.getItem('memory_game_leaders');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveGameResult(totalMoves) {
    const results = getLeaderboardData();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}.${month}.${year}`;

    results.push({ moves: totalMoves, date: dateStr, timestamp: Date.now() });

    results.sort((a, b) => {
        if (a.moves !== b.moves) {
            return a.moves - b.moves;
        }
        return a.timestamp - b.timestamp;
    });

    const top10 = results.slice(0, 10);
    localStorage.setItem('memory_game_leaders', JSON.stringify(top10));
}

function openLeaderboardModal() {
    const content = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Таблица лидеров';

    const results = getLeaderboardData();

    if (results.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'Пока нет результатов.';
        content.append(title, emptyMsg);
    } else {
        const list = document.createElement('ul');
        list.className = 'leaderboard-list';

        results.forEach((res, index) => {
            const li = document.createElement('li');
            
            const placeSpan = document.createElement('span');
            placeSpan.textContent = `${index + 1}. Ходов: ${res.moves}`;
            
            const dateSpan = document.createElement('span');
            dateSpan.textContent = res.date;

            li.append(placeSpan, dateSpan);
            list.append(li);
        });

        content.append(title, list);
    }

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.textContent = 'Закрыть';
    closeBtn.setAttribute('aria-label', 'Закрыть таблицу лидеров');
    closeBtn.style.marginTop = '15px';

    const modalOverlay = createModal(content);

    closeBtn.addEventListener('click', () => {
        closeModal(modalOverlay);
    });

    content.append(closeBtn);
}