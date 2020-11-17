// 보드 로직 파일

class Board {
    grid;

    // 새 게임이 시작되면 보드를 초기화한다.
    reset() {
        this.grid = this.getEmptyBoard();
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
                    this.isEmpty(value) || (this.insideWall(x) && this.aboveFloor(y))
                );
            });
        });
    }

    // 충돌 감지
    // 1. 보드 안에 다른 블록과 부딪힌다.
    // 2. 회전하는 중에 벽 또는 다른 블록과 부딪힌다.
    isEmpty(value) {
        return value === 0;
    }

    // 3. 왼쪽 또는 오른쪽 벽으로 이동한다.
    insideWall(x) {
        return (x >= 0 && x < COLS);
    }

    // 4. 바닥에 닿는다.
    aboveFloor(y) {
        return y < ROWS;
    }
}