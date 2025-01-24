// 游戏元素
const court = document.querySelector('.court');
const leftPaddle = document.querySelector('.left-paddle');
const rightPaddle = document.querySelector('.right-paddle');
const shuttlecock = document.querySelector('.shuttlecock');
const player1Score = document.querySelector('.player1');
const player2Score = document.querySelector('.player2');

// 游戏变量
const paddleSpeed = 8;
const shuttlecockSpeed = 5;
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
    ArrowUp: false,
    ArrowDown: false
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
    movePaddles();
    moveShuttlecock();
    checkCollisions();
    updateScore();
    requestAnimationFrame(gameLoop);
}

// 移动球拍
function movePaddles() {
    // 左球拍（W/S/A/D）
    const leftPaddleRect = leftPaddle.getBoundingClientRect();
    const leftPaddleTop = parseFloat(leftPaddle.style.top) || 0;
    const leftPaddleLeft = parseFloat(leftPaddle.style.left) || 0;
    
    // 上下移动（允许伸出球场一半高度）
    const verticalLimit = -leftPaddleRect.height / 2;
    if (keys.w && leftPaddleTop > verticalLimit) {
        leftPaddle.style.top = `${Math.max(verticalLimit, leftPaddleTop - paddleSpeed)}px`;
    }
    if (keys.s && leftPaddleTop + leftPaddleRect.height < court.offsetHeight + leftPaddleRect.height/2) {
        leftPaddle.style.top = `${Math.min(
            court.offsetHeight - leftPaddleRect.height/2,
            leftPaddleTop + paddleSpeed
        )}px`;
    }

    // 左右移动（不能越过中线）
    if (keys.a && leftPaddleLeft > 0) {
        leftPaddle.style.left = `${Math.max(0, leftPaddleLeft - paddleSpeed)}px`;
    }
    if (keys.d && leftPaddleLeft + leftPaddleRect.width < court.offsetWidth/2) {
        leftPaddle.style.left = `${Math.min(
            court.offsetWidth/2 - leftPaddleRect.width,
            leftPaddleLeft + paddleSpeed
        )}px`;
    }

    // 右球拍（上下箭头/左右箭头）
    const rightPaddleRect = rightPaddle.getBoundingClientRect();
    const rightPaddleTop = parseFloat(rightPaddle.style.top) || 0;
    const rightPaddleLeft = parseFloat(rightPaddle.style.left) || court.offsetWidth/2;
    
    // 上下移动（允许伸出球场一半高度）
    if (keys.ArrowUp && rightPaddleTop > verticalLimit) {
        rightPaddle.style.top = `${Math.max(verticalLimit, rightPaddleTop - paddleSpeed)}px`;
    }
    if (keys.ArrowDown && rightPaddleTop + rightPaddleRect.height < court.offsetHeight + rightPaddleRect.height/2) {
        rightPaddle.style.top = `${Math.min(
            court.offsetHeight - rightPaddleRect.height/2,
            rightPaddleTop + paddleSpeed
        )}px`;
    }

    // 左右移动（不能越过中线）
    if (keys.ArrowLeft && rightPaddleLeft > court.offsetWidth/2) {
        rightPaddle.style.left = `${Math.max(court.offsetWidth/2, rightPaddleLeft - paddleSpeed)}px`;
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

    // 上下边界碰撞
    if (shuttlecockRect.top <= 0) {
        shuttlecockY = 0;
        dy = Math.abs(dy);
    }
    if (shuttlecockRect.bottom >= court.offsetHeight) {
        shuttlecockY = court.offsetHeight - shuttlecockRect.height;
        dy = -Math.abs(dy);
    }

    // 左球拍碰撞
    if (shuttlecockRect.left <= leftPaddleRect.right &&
        shuttlecockRect.bottom > leftPaddleRect.top &&
        shuttlecockRect.top < leftPaddleRect.bottom) {
        dx = Math.abs(dx);
        shuttlecockX = leftPaddleRect.right;
        // 根据碰撞位置调整垂直速度
        const hitPosition = (shuttlecockRect.top + shuttlecockRect.height/2 - leftPaddleRect.top) / leftPaddleRect.height;
        dy = (hitPosition - 0.5) * 2 * shuttlecockSpeed;
    }

    // 右球拍碰撞
    if (shuttlecockRect.right >= rightPaddleRect.left &&
        shuttlecockRect.bottom > rightPaddleRect.top &&
        shuttlecockRect.top < rightPaddleRect.bottom) {
        dx = -Math.abs(dx);
        shuttlecockX = rightPaddleRect.left - shuttlecockRect.width;
        // 根据碰撞位置调整垂直速度
        const hitPosition = (shuttlecockRect.top + shuttlecockRect.height/2 - rightPaddleRect.top) / rightPaddleRect.height;
        dy = (hitPosition - 0.5) * 2 * shuttlecockSpeed;
    }

    // 得分检测
    if (shuttlecockRect.left <= 0) {
        score2++;
        resetShuttlecock();
    }
    if (shuttlecockRect.right >= court.offsetWidth) {
        score1++;
        resetShuttlecock();
    }
}

// 重置羽毛球位置
function resetShuttlecock() {
    shuttlecockX = 400;
    shuttlecockY = 250;
    dx = shuttlecockSpeed * (Math.random() > 0.5 ? 1 : -1);
    dy = shuttlecockSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// 更新分数
function updateScore() {
    player1Score.textContent = score1;
    player2Score.textContent = score2;

    // 检查胜利条件
    if (score1 >= winningScore) {
        endGame(1);
    } else if (score2 >= winningScore) {
        endGame(2);
    }
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
    winnerText.textContent = `玩家 ${winner} 获胜！`;
    endScreen.classList.add('visible');
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
