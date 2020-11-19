// 보드 로직 파일

class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.level = 1000;
    }

    // 새 게임이 시작되면 보드를 초기화한다.
    reset() {
        this.grid = this.getEmptyBoard();
        this.piece = new Piece(this.ctx);
    }

    // 0으로 채워진 행렬을 얻는다.
    getEmptyBoard() {
        return Array.from(
            { length: ROWS }, () => Array(COLS).fill(0)
        );
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

    draw() {
        this.piece.draw();
        this.drawBoard();
    }

    drop() {
        let p = moves[KEY.DOWN](this.piece);
        if (this.valid(p)) {
            this.piece.move(p);
        } else {
            this.freeze();
            this.piece.spawn();
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


}