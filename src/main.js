// 게임 초기화와 종료 로직 코드

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');
const canvasKeep = document.getElementById('keep');
const ctxKeep = canvasKeep.getContext('2d');

const playBtn = document.querySelector('#play-btn');
const pauseBtn = document.querySelector('#pause-btn');
const form = document.querySelector('.input-name');
const input = form.querySelector('.name-txt');

let accountValues = {
    score: 0,
    level: 0,
    lines: 0
};

function updateAccount(key, value) {
    let element = document.getElementById(key);
    if (element) {
        element.textContent = value;
    }
}

let account = new Proxy(accountValues, {
    set: (target, key, value) => {
        target[key] = value;
        updateAccount(key, value);
        return true;
    }
});

let requestId = null;
let time = null;
let playNow = true;

const moves = {
    [KEY.LEFT]: p => ({ x: p.x - 1, y: p.y, shape: p.shape }),
    [KEY.RIGHT]: p => ({ x: p.x + 1, y: p.y, shape: p.shape }),
    [KEY.DOWN]: p => ({ x: p.x, y: p.y + 1, shape: p.shape }),
    [KEY.SPACE]: p => ({ x: p.x, y: p.y + 1, shape: p.shape }),
    [KEY.UP]: p => board.rotate(p),
    [KEY.CONTROL]: p => board.changePiece(p)
};

let board = new Board(ctx, ctxNext, ctxKeep);

initNext();
initKeep();
showHighScores();
showControlKey();

function initNext() {
    // 4개 블록을 위한 캔버스 사이즈를 설정한다.
    ctxNext.canvas.width = 4 * BLOCK_SIZE;
    ctxNext.canvas.height = 4 * BLOCK_SIZE;
    ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function initKeep() {
    ctxKeep.canvas.width = 4 * BLOCK_SIZE;
    ctxKeep.canvas.height = 4 * BLOCK_SIZE;
    ctxKeep.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function addEventListener() {
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    if (event.key === KEY.P) {
        pause();
    }
    if (event.key === KEY.ESC) {
        gameOver();
    } else if (moves[event.key]) {
        // 이벤트 버블링을 막는다.
        event.preventDefault();

        if (!playNow) return;

        // Get new state
        let p = moves[event.key](board.piece);

        if (event.key === KEY.SPACE) {
            // Hard drop
            while (board.valid(p)) {
                // score
                account.score += POINTS.HARD_DROP;

                board.piece.move(p);
                p = moves[KEY.DOWN](board.piece);
            }

            if (!board.drop()) {
                gameOver();
                return;
            }

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            board.draw();
        } else if (board.valid(p)) {
            // 이동이 가능한 상태라면 조각을 이동한다.
            board.piece.move(p);

            // score
            if (event.key === KEY.DOWN) {
                account.score += POINTS.SOFT_DROP;
            }
        }
    }
}

function play() {
    addEventListener();
    resetGame();

    let piece = new Piece(ctx);
    board.piece = piece;
    board.piece.setStartingPosition();
    animate();

    playBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
}

// 게임 초기화
function resetGame() {
    account.score = 0;
    account.lines = 0;
    account.level = 0;
    board.reset();
    time = { start: performance.now(), elapsed: 0, level: LEVEL[account.level] };
}

// game loop
function animate(now = 0) {
    // 지난 시간을 업데이트 한다.
    const delta = now - time.start;
    time.elapsed += delta;
    time.start = now;

    if (time.elapsed >= time.level) {
        time.elapsed %= time.level;

        if (!board.drop()) {
            gameOver();
            return;
        }
    }

    // 새로운 상태로 그리기 전에 보드를 지운다. 
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    board.draw();
    requestId = requestAnimationFrame(animate);
}

// Game over
function gameOver() {
    cancelAnimationFrame(requestId);

    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', 1.8, 4);

    checkHighScore(account.score);

    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
}

function pause() {
    if (!playNow) {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'block';
        animate();
        playNow = true;
        return;
    }

    playNow = false;

    cancelAnimationFrame(requestId);

    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText('PAUSED', 3, 4);

    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
}

function showControlKey() {
    const controlKeyList = document.getElementById('control-keys');

    CONTROL_KEYS.forEach((key) => {
        const li = document.createElement('li');
        li.innerText = `${key}`;
        controlKeyList.appendChild(li);
    });
}

function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const highScoreList = document.getElementById('highScores');

    highScores.forEach((score) => {
        const li = document.createElement('li');
        li.innerText = `${score.score} - ${score.name}`;
        highScoreList.appendChild(li);
    })
}

function checkHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const lowestScore = highScores[NO_OF_HIGH_SCORES - 1]?.score ?? 0;

    if (score > lowestScore) {
        form.style.display = 'block';
        form.addEventListener('submit', () => {
            const name = input.value;
            const newScore = { score, name };
            saveHighScore(newScore, highScores);
            showHighScores();
        });
    }
}

function saveHighScore(score, highScores) {
    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(NO_OF_HIGH_SCORES);

    localStorage.setItem('highScores', JSON.stringify(highScores));
}