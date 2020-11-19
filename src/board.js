// 보드 로직 파일

class Board {
    constructor(ctx, ctxNext, ctxKeep) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.ctxKeep = ctxKeep;
        this.init();
    }

    init() {
        // 상수를 사용해 캔버스의 크기를 계산한다.
        ctx.canvas.width = COLS * BLOCK_SIZE;
        ctx.canvas.height = ROWS * BLOCK_SIZE;

        // 블록의 크기를 변경한다.
        ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    // 새 게임이 시작되면 보드를 초기화한다.
    reset() {
        this.grid = this.getEmptyBoard();
        this.piece = new Piece(this.ctx);
        this.piece.setStartingPosition();
        this.getNewNextPiece();
        this.getNewKeepPiece();
    }

    // 0으로 채워진 행렬을 얻는다.
    getEmptyBoard() {
        return Array.from(
            { length: ROWS }, () => Array(COLS).fill(0)
        );
    }

    getNewNextPiece() {
        const { width, height } = this.ctxNext.canvas;
        this.next = new Piece(this.ctxNext);
        this.ctxNext.clearRect(0, 0, width, height);
        this.next.draw();
    }

    getNewKeepPiece() {
        const { width, height } = this.ctxKeep.canvas;
        this.keep = new Piece(this.ctxKeep);
        this.ctxKeep.clearRect(0, 0, width, height);
        this.keep.draw();
    }

    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;
                return (
                    this.isEmpty(value) || (this.isInsideWall(x, y) && this.notOccupied(x, y))
                );
            });
        });
    }

    // 충돌 감지
    isEmpty(value) {
        return value === 0;
    }

    isInsideWall(x, y) {
        return x >= 0 && x < COLS && y < ROWS;
    }

    notOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] === 0;
    }

    freeze() {
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
                }
            });
        });
    }

    cleanLines() {
        let lines = 0;

        this.grid.forEach((row, y) => {
            // 모든 갑시 0보다 큰지 비교한다.
            if (row.every(value => value > 0)) {
                lines++; // 지워진 줄 수를 증가시킨다.

                // 행을 삭제한다.
                this.grid.splice(y, 1);

                // 맨 위에 0으로 채워진 행을 추가한다.
                this.grid.unshift(Array(COLS).fill(0));
            }
        });

        if (lines > 0) {
            // 지워진 줄과 레벨로 점수를 계산한다.

            account.score += this.getLineClearPoints(lines);
            account.lines += lines;

            // 다음 레벨에 도달할 수 있는 줄 수 가 되었다면
            if (account.lines >= LINES_PER_LEVEL) {
                // 레벨 값을 증가시킨다.
                account.level++;

                // 다음 레벨을 시작하기 위해 줄을 지운다.
                account.lines -= LINES_PER_LEVEL;

                // 게임 속도를 올린다.
                time.level = LEVEL[account.level];
            }
        }
    }

    draw() {
        this.piece.draw();
        this.drawBoard();
    }

    drop() {
        let p = moves[KEY.DOWN](this.piece);
        if (this.valid(p)) {
            this.piece.move(p);
        } else {
            // Game over 
            if (this.piece.y === 0) {
                return false;
            }

            this.freeze();
            this.cleanLines();
            this.piece.spawn();

            this.piece = this.next;
            this.piece.ctx = this.ctx;
            this.piece.setStartingPosition();
            this.getNewNextPiece();
        }
        return true;
    }

    drawBoard() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value - 1];
                    this.ctx.fillRect(x, y, 1, 1);
                }
            });
        });
    }

    changePiece(p) {
        [p, this.keep] = [this.keep, p];
        return p;
    }

    rotate(p) {
        const { x, y } = p;
        const shape = p.copyShape();

        // 행렬을 변환한다.
        for (let y = 0; y < shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [shape[x][y], shape[y][x]] = [shape[y][x], shape[x][y]];
            }
        }

        // 열 순서대로 뒤집는다.
        shape.forEach(row => row.reverse());

        return { shape, x, y };
    }

    // 블록 줄을 지웠을 때 점수
    getLineClearPoints(lines) {
        const lineClearPints =
            lines === 1 ? POINTS.SINGLE :
                lines === 2 ? POINTS.DOUBLE :
                    lines === 3 ? POINTS.TRIPLE :
                        lines === 4 ? POINTS.TETRIS :
                            0;
        return (account.level + 1) * lineClearPints;
    }
}