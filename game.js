// 游戏元素
const court = document.querySelector('.court');
const leftPaddle = document.querySelector('.left-paddle');
const rightPaddle = document.querySelector('.right-paddle');
const shuttlecock = document.querySelector('.shuttlecock');
const player1Score = document.querySelector('.player1');
const player2Score = document.querySelector('.player2');

// 游戏变量
const basePaddleSpeed = 5; // 基础移动速度
const maxPaddleSpeed = 15; // 最大移动速度
const paddleAcceleration = 0.1; // 长按加速速率
const baseShuttlecockSpeed = 3; // 基础羽毛球速度
let paddleSpeed = basePaddleSpeed;
let shuttlecockSpeed = baseShuttlecockSpeed;
let shuttlecockX = 400;
let shuttlecockY = 250;
let dx = shuttlecockSpeed;
let dy = shuttlecockSpeed;
let score1 = 0;
let score2 = 0;
let gameActive = false;
const winningScore = 11;

// DOM元素
const startScreen = document.querySelector('.start-screen');
const endScreen = document.querySelector('.end-screen');
const winnerText = document.querySelector('.winner');
const startBtn = document.querySelector('.start-btn');
const restartBtn = document.querySelector('.restart-btn');

// 初始化事件监听
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// 键盘状态
const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// 事件监听
document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// 游戏循环
function gameLoop() {
    if (!gameActive) return;
    movePaddles();
    moveShuttlecock();
    checkCollisions();
    updateScore();
    requestAnimationFrame(gameLoop);
}

// 更新球拍速度
function updatePaddleSpeed() {
    // 检测是否有按键按下
    const anyKeyPressed = Object.values(keys).some(v => v);
    
    if (anyKeyPressed) {
        // 长按加速
        paddleSpeed = Math.min(paddleSpeed + paddleAcceleration, maxPaddleSpeed);
    } else {
        // 松开按键时重置速度
        paddleSpeed = basePaddleSpeed;
    }
}

// 移动球拍
function movePaddles() {
    updatePaddleSpeed();
    
    // 左球拍移动限制
    const leftPaddleRect = leftPaddle.getBoundingClientRect();
    const leftPaddleTop = parseFloat(leftPaddle.style.top) || 0;
    const leftPaddleLeft = parseFloat(leftPaddle.style.left) || 0;
    
    // 上下移动（不能出球场）
    if (keys.w && leftPaddleTop > 0) {
        leftPaddle.style.top = `${Math.max(0, leftPaddleTop - paddleSpeed)}px`;
    }
    if (keys.s && leftPaddleTop + leftPaddleRect.height < court.offsetHeight) {
        leftPaddle.style.top = `${Math.min(
            court.offsetHeight - leftPaddleRect.height,
            leftPaddleTop + paddleSpeed
        )}px`;
    }

    // 前后移动（不能越过中线）
    if (keys.a && leftPaddleLeft > 0) {
        leftPaddle.style.left = `${Math.max(0, leftPaddleLeft - paddleSpeed)}px`;
    }
    if (keys.d && leftPaddleLeft + leftPaddleRect.width < court.offsetWidth/2) {
        leftPaddle.style.left = `${Math.min(
            court.offsetWidth/2 - leftPaddleRect.width,
            leftPaddleLeft + paddleSpeed
        )}px`;
    }

    // 右球拍移动限制
    const rightPaddleRect = rightPaddle.getBoundingClientRect();
    const rightPaddleTop = parseFloat(rightPaddle.style.top) || 0;
    const rightPaddleLeft = parseFloat(rightPaddle.style.left) || (court.offsetWidth - rightPaddleRect.width);
    
    // 上下移动（不能出球场）
    if (keys.ArrowUp && rightPaddleTop > 0) {
        rightPaddle.style.top = `${Math.max(0, rightPaddleTop - paddleSpeed)}px`;
    }
    if (keys.ArrowDown && rightPaddleTop + rightPaddleRect.height < court.offsetHeight) {
        rightPaddle.style.top = `${Math.min(
            court.offsetHeight - rightPaddleRect.height,
            rightPaddleTop + paddleSpeed
        )}px`;
    }

    // 前后移动（不能越过中线）
    if (keys.ArrowLeft && rightPaddleLeft > court.offsetWidth/2) {
        rightPaddle.style.left = `${Math.max(court.offsetWidth/2 - rightPaddleRect.width, rightPaddleLeft - paddleSpeed)}px`;
    }
    if (keys.ArrowRight && rightPaddleLeft + rightPaddleRect.width < court.offsetWidth) {
        rightPaddle.style.left = `${Math.min(
            court.offsetWidth - rightPaddleRect.width,
            rightPaddleLeft + paddleSpeed
        )}px`;
    }
}

// 获取相对位置
function getRelativePosition(element) {
    const rect = element.getBoundingClientRect();
    const courtRect = court.getBoundingClientRect();
    return {
        top: rect.top - courtRect.top,
        left: rect.left - courtRect.left,
        right: rect.right - courtRect.left,
        bottom: rect.bottom - courtRect.top,
        width: rect.width,
        height: rect.height
    };
}

// 移动羽毛球
function moveShuttlecock() {
    shuttlecockX += dx;
    shuttlecockY += dy;
    shuttlecock.style.left = `${shuttlecockX}px`;
    shuttlecock.style.top = `${shuttlecockY}px`;
}

// 碰撞检测
function checkCollisions() {
    const shuttlecockRect = getRelativePosition(shuttlecock);
    const leftPaddleRect = getRelativePosition(leftPaddle);
    const rightPaddleRect = getRelativePosition(rightPaddle);

    // 上下边界碰撞 - 直接得分
    if (shuttlecockRect.top <= 0 || shuttlecockRect.bottom >= court.offsetHeight) {
        if (shuttlecockRect.left < court.offsetWidth/2) {
            score2++;
            endGame(2);
        } else {
            score1++;
            endGame(1);
        }
    }

    // 左球拍碰撞
    if (shuttlecockRect.left <= leftPaddleRect.right &&
        shuttlecockRect.bottom > leftPaddleRect.top &&
        shuttlecockRect.top < leftPaddleRect.bottom) {
        dx = Math.abs(dx);
        shuttlecockX = leftPaddleRect.right;
        // 根据碰撞位置调整垂直速度
        const hitPosition = (shuttlecockRect.top + shuttlecockRect.height/2 - leftPaddleRect.top) / leftPaddleRect.height;
        // 根据球拍速度增加羽毛球速度，但限制最大速度
        const speedMultiplier = 1 + (paddleSpeed - basePaddleSpeed) / (maxPaddleSpeed - basePaddleSpeed);
        const maxShuttlecockSpeed = 8; // 羽毛球最大速度
        const speedDecay = 0.98; // 速度衰减系数
        
        // 计算新速度并限制最大值
        let newDy = (hitPosition - 0.5) * 2 * shuttlecockSpeed * speedMultiplier;
        let newDx = Math.abs(dx) * speedMultiplier;
        
        // 应用速度衰减
        dy = Math.min(newDy * speedDecay, maxShuttlecockSpeed);
        dx = Math.min(newDx * speedDecay, maxShuttlecockSpeed);
    }

    // 右球拍碰撞
    if (shuttlecockRect.right >= rightPaddleRect.left &&
        shuttlecockRect.bottom > rightPaddleRect.top &&
        shuttlecockRect.top < rightPaddleRect.bottom) {
        dx = -Math.abs(dx);
        shuttlecockX = rightPaddleRect.left - shuttlecockRect.width;
        // 根据碰撞位置调整垂直速度
        const hitPosition = (shuttlecockRect.top + shuttlecockRect.height/2 - rightPaddleRect.top) / rightPaddleRect.height;
        // 根据球拍速度增加羽毛球速度，但限制最大速度
        const speedMultiplier = 1 + (paddleSpeed - basePaddleSpeed) / (maxPaddleSpeed - basePaddleSpeed);
        const maxShuttlecockSpeed = 8; // 羽毛球最大速度
        const speedDecay = 0.98; // 速度衰减系数
        
        // 计算新速度并限制最大值
        let newDy = (hitPosition - 0.5) * 2 * shuttlecockSpeed * speedMultiplier;
        let newDx = Math.abs(dx) * speedMultiplier;
        
        // 应用速度衰减
        dy = Math.min(newDy * speedDecay, maxShuttlecockSpeed);
        dx = -Math.min(newDx * speedDecay, maxShuttlecockSpeed);
    }

    // 得分检测 - 羽毛球必须越过中线
    if (shuttlecockRect.left <= 0 && shuttlecockRect.right < court.offsetWidth/2) {
        score2++;
        endGame(2);
    }
    if (shuttlecockRect.right >= court.offsetWidth && shuttlecockRect.left > court.offsetWidth/2) {
        score1++;
        endGame(1);
    }
}

// 重置羽毛球位置
function resetShuttlecock() {
    shuttlecockX = 400;
    shuttlecockY = 250;
    dx = shuttlecockSpeed * (Math.random() > 0.5 ? 1 : -1);
    dy = 0; // 初始垂直速度为0，保持水平运动
}

// 更新分数
function updateScore() {
    player1Score.textContent = score1;
    player2Score.textContent = score2;
}

// 游戏控制函数
function startGame() {
    startScreen.style.display = 'none';
    gameActive = true;
    resetGame();
    gameLoop();
}

function endGame(winner) {
    gameActive = false;
    winnerText.textContent = `玩家 ${winner} 获胜！比分：${score1} - ${score2}`;
    endScreen.classList.add('visible');
    
    // 添加分数动画
    winnerText.style.animation = 'scoreAnimation 1s ease-in-out';
    setTimeout(() => {
        winnerText.style.animation = '';
    }, 1000);
}

function restartGame() {
    endScreen.classList.remove('visible');
    startGame();
}

function resetGame() {
    score1 = 0;
    score2 = 0;
    player1Score.textContent = 0;
    player2Score.textContent = 0;
    resetShuttlecock();
}

// 显示开始界面
startScreen.style.display = 'flex';

// 添加分数动画样式
const style = document.createElement('style');
style.textContent = `
@keyframes scoreAnimation {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}
`;
document.head.appendChild(style);
