// 게임 초기화와 종료 로직 코드

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// 상수를 사용해 캔버스의 크기를 계산한다.
ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;

// 블록의 크기를 변경한다.
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

let requestId = null;

const moves = {
    [KEY.LEFT]: p => ({ x: p.x - 1, y: p.y, shape: p.shape }),
    [KEY.RIGHT]: p => ({ x: p.x + 1, y: p.y, shape: p.shape }),
    [KEY.DOWN]: p => ({ x: p.x, y: p.y + 1, shape: p.shape }),
    [KEY.SPACE]: p => ({ x: p.x, y: p.y + 1, shape: p.shape }),
    [KEY.UP]: p => board.rotate(p)
};

let board = new Board(ctx);

function play() {
    board.reset();
    let piece = new Piece(ctx);
    board.piece = piece;
    animate();
}

document.addEventListener('keydown', event => {
    if (moves[event.key]) {
        // 이벤트 버블링을 막는다.
        event.preventDefault();

        // Get new state
        let p = moves[event.key](board.piece);

        if (event.key === KEY.SPACE) {
            // Hard drop
            while (board.valid(p)) {
                board.piece.move(p);
                p = moves[KEY.DOWN](board.piece);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                board.draw();
            }
        } else if (board.valid(p)) {
            // 이동이 가능한 상태라면 조각을 이동한다.
            board.piece.move(p);
        }
    }
});

let time = { start: 0, elapsed: 0 };

// game loop
function animate(now = 0) {
    // 지난 시간을 업데이트 한다.
    const delta = now - time.start;
    time.elapsed += delta;
    time.start = now;

    if (time.elapsed >= board.level) {
        time.elapsed %= board.level;
        if (!board.drop()) {
            return;
        }
    }

    // 새로운 상태로 그리기 전에 보드를 지운다. 
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    board.draw();
    requestAnimationFrame(animate);
}