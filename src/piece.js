// 테트리스 조각 로직 파일

class Piece {
    x;
    y;
    color;
    shape;
    ctx;

    constructor(ctx) {
        this.ctx = ctx;
        this.spawn();
    }

    // 테트로미노의 위치, 색상 및 모양 지정
    spawn() {
        const typeId = this.randomizeTetrominoType(COLORS.length);
        this.shape = SHAPES[typeId];
        this.color = COLORS[typeId];
        // Starting position
        this.x = 3;
        this.y = 0;
    }

    // 해당 테트로미노 그려주기
    draw() {
        this.ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                // this.x, this.y는 shape 상단 왼쪽 좌표이다.
                // shape 안에 있는 블록 좌표에 x, y를 더한다.
                // 보드에서 블록의 좌표는 this.x + x가 된다.
                if (value > 0) {
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
                }
            });
        });
    }

    // 보드 위에서 위치를 변경하기 위해 현재 조각의 x 또는 y 변경
    move(p) {
        this.x = p.x;
        this.y = p.y;
    }

    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes);
    }
}