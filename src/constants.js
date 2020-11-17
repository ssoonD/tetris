// 게임 설정과 규칙 정의

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// 키들을 키 코드 값으로 매핑
const KEY = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown'
};

// Object.freeze() : 객체를 동결
// 1. 잘 동작하게 하려면, 엄격 모드를 사용
// 2. 불변으로 만드는 값은 1레벨에서만 동작
Object.freeze(KEY);
