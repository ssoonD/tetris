// 테트리스 조각 로직 파일

class Piece {
    constructor(ctx) {
        this.ctx = ctx;
        this.spawn();
    }

    // 테트로미노의 위치, 색상 및 모양 지정
    spawn() {
        this.typeId = this.randomizeTetrominoType(COLORS.length);
        this.shape = SHAPES[this.typeId];
        // Starting position
        this.x = 0;
        this.y = -1;
    }

    // 해당 테트로미노 그려주기
    draw() {
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                // this.x, this.y는 shape 상단 왼쪽 좌표이다.
                // shape 안에 있는 블록 좌표에 x, y를 더한다.
                // 보드에서 블록의 좌표는 this.x + x가 된다.
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value - 1];
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
                }
            });
        });
    }

    // 보드 위에서 위치를 변경하기 위해 현재 조각의 x 또는 y 변경
    move(p) {
        this.shape = p.shape;
        this.x = p.x;
        this.y = p.y;
        if (typeof p.typeId === 'number') {
            this.typeId = p.typeId;
        }
    }

    // 테트로미노 index 지정
    setStartingPosition() {
        this.x = this.getStartingPosition();
    }

    getStartingPosition() {
        return this.typeId === 3 ? 4 : 3;
    }

    // 랜덤 번호 만들어주기
    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes);
    }

    // shape 복사하기
    copyShape() {
        return this.shape.map(row => [...row.map(item => item)]);
    }

}