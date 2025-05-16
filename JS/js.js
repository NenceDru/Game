// Основные элементы
        const gameContainer = document.getElementById('game-container');
        const welcomeScreen = document.getElementById('welcome-screen');
        const gameScreen = document.getElementById('game-screen');
        const resultScreen = document.getElementById('result-screen');
        const gameoverScreen = document.getElementById('gameover-screen');
        console.log(gameContainer)
        // Элементы управления 
        const playerNameInput = document.getElementById('player-name');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const gameoverRestartBtn = document.getElementById('gameover-restart-btn');
        
        // Игровые элементы
        const player = document.getElementById('player');
        const background = document.getElementById('background');
        const pauseOverlay = document.getElementById('pause-overlay');

        // Информационные элементы
        const playerInfo = document.getElementById('player-info');
        const timeInfo = document.getElementById('time-info');
        const powerPercent = document.getElementById('power-percent');
        const powerFill = document.getElementById('power-fill');
        const resultText = document.getElementById('result-text');
        const gameoverText = document.getElementById('gameover-text');
        
        // Игровые переменные
        let playerName = '';
        let gameTime = 0;
        let power = 50;
        let gameInterval;
        let powerInterval;
        let isGameRunning = false;
        let isPaused = false;
        let walls = [];
        let batteries = [];
        let animationId;
        let lastWallX = 0;
        let scrollSpeed = 1;
        
        // Размеры игрового поля
        const gameWidth = gameContainer.offsetWidth;
        const gameHeight = gameContainer.offsetHeight;
        
        // Обработчики событий
        playerNameInput.addEventListener('input', () => {
            startBtn.disabled = playerNameInput.value.trim() === '';
             if (playerNameInput.value.trim() === '') { 
                 startBtn.removeAttribute(disabled)
            }
        
             else {
                  startBtn.setAttributeAttribute(disabled)
            }
        });
        
        

        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
        gameoverRestartBtn.addEventListener('click', restartGame);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                togglePause();
            }
            
            if (isGameRunning && !isPaused) {
                if (e.key.toLowerCase() === 'w') {
                    movePlayer(-10);
                } else if (e.key.toLowerCase() === 's') {
                    movePlayer(10);
                }
            }
        });
        
        // Функции игры
        function startGame() {
            playerName = playerNameInput.value.trim();
            playerInfo.textContent = `Игрок: ${playerName}`;
            
            welcomeScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            
            resetGame();
            isGameRunning = true;
            
            // Запуск таймера
            gameInterval = setInterval(updateGame, 1000);
            
            // Уменьшение заряда
            powerInterval = setInterval(() => {
                if (!isPaused) {
                    power--;
                    updatePower();
                    
                    if (power <= 0) {
                        endGame('power');
                    }
                }
            }, 1000);
            // Запуск игрового цикла
            animationId = requestAnimationFrame(gameLoop);
        }
        
        function resetGame() {
            // Сброс переменных
            gameTime = 0;
            power = 50;
            walls = [];
            batteries = [];
            lastWallX = gameWidth;
            scrollSpeed = 1;
            
            // Очистка игрового поля от предыдущих элементов
            document.querySelectorAll('.wall').forEach(wall => wall.remove());
            document.querySelectorAll('.battery').forEach(battery => battery.remove());
            document.querySelectorAll('.explosion').forEach(exp => exp.remove());
            document.querySelectorAll('.collect-animation').forEach(anim => anim.remove());
            
            // Сброс позиции игрока
            player.style.top = `${gameHeight / 2 - player.offsetHeight / 2}px`;
            
            // Обновление интерфейса
            updateTime();
            updatePower();
        }
        
        function restartGame() {
            clearInterval(gameInterval);
            clearInterval(powerInterval);
            cancelAnimationFrame(animationId);
            
            resultScreen.classList.add('hidden');
            gameoverScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
        
            startGame();
        }
        
        function endGame(reason) {
            isGameRunning = false;
            
            clearInterval(gameInterval);
            clearInterval(powerInterval);
            cancelAnimationFrame(animationId);
            
            // Показать соответствующий экран
            if (reason === 'collision') {
                createExplosion(player.offsetLeft + player.offsetWidth / 2, player.offsetTop + player.offsetHeight / 2);
                setTimeout(() => {
                    gameScreen.classList.add('hidden');
                    gameoverText.textContent = `Игрок: ${playerName} Время: ${formatTime(gameTime)}`;
                    gameoverScreen.classList.remove('hidden');
                }, 1000);
            } else if (reason === 'power') {
                gameScreen.classList.add('hidden');
                resultText.textContent = `Игрок: ${playerName} Время: ${formatTime(gameTime)}`;
                resultScreen.classList.remove('hidden');
            }
        }
        
        function togglePause() {
            if (!isGameRunning) return;
            
            isPaused = !isPaused;
            pauseOverlay.classList.toggle('active');
            
            if (isPaused) {
                clearInterval(gameInterval);
                clearInterval(powerInterval);
                cancelAnimationFrame(animationId);
            } else {
                gameInterval = setInterval(updateGame, 1000);
                powerInterval = setInterval(() => {
                    power--;
                    updatePower();
                    
                    if (power <= 0) {
                        endGame('power');
                    }
                }, 1000);
                animationId = requestAnimationFrame(gameLoop);
            }
        }
        
        function updateGame() {
            if (!isPaused) {
                gameTime++;
                updateTime();
            }
        }
        
        function updateTime() {
            timeInfo.textContent = `Время: ${formatTime(gameTime)}`;
        }
        
        function updatePower() {
            powerPercent.textContent = power;
            powerFill.style.width = `${power}%`;
            
            if (power > 50) {
                powerFill.style.backgroundColor = '#4CAF50';
            } else if (power > 20) {
                powerFill.style.backgroundColor = '#FFC107';
            } else {
                powerFill.style.backgroundColor = '#F44336';
            }
        }
        
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        }
        
        function movePlayer(dy) {
            if (!isGameRunning || isPaused) return;
            
            const currentTop = parseInt(player.style.top) || gameHeight / 2 - player.offsetHeight / 2;
            const newTop = currentTop + dy;
            
            // Проверка границ
            if (newTop >= 0 && newTop <= gameHeight - player.offsetHeight) {
                player.style.top = `${newTop}px`;
            }
        }
        
        function gameLoop() {
            if (isPaused) return;
            
            // Генерация стен
            if (lastWallX > gameWidth - 300) {
                lastWallX -= scrollSpeed;
            } else {
                createWall();
                lastWallX = gameWidth;
            }
            
            // Движение стен и батареек
            moveGameElements();
            
            // Проверка столкновений
            checkCollisions();
            
            animationId = requestAnimationFrame(gameLoop);
        }
        
        function createWall() {
            const wallHeight = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
            const isTopWall = Math.random() > 0.5;
            
            const wall = document.createElement('div');
            wall.className = 'wall';
            wall.style.width = '50px';
            wall.style.height = `${wallHeight}px`;
            wall.style.left = `${gameWidth}px`;
            
            if (isTopWall) {
                wall.style.top = '0';
            } else {
                wall.style.bottom = '0';
            }
            
            gameContainer.appendChild(wall);
            walls.push({
                element: wall,
                x: gameWidth,
                height: wallHeight,
                isTop: isTopWall
            });
            
            // Создание батарейки в промежутке между стенами
            if (walls.length > 1) {
                createBattery();
            }
        }
        
        function createBattery() {
            const prevWall = walls[walls.length - 2];
            const currentWall = walls[walls.length - 1];
            
            const minX = prevWall.x + prevWall.element.offsetWidth + 50;
            const maxX = currentWall.x - 50;
            
            if (maxX - minX < 30) return; // Недостаточно места для батарейки
            
            const batteryX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            const batteryY = Math.floor(Math.random() * (gameHeight - 100 - 50 + 1)) + 50;
            
            const battery = document.createElement('div');
            battery.className = 'battery';
            battery.style.left = `${batteryX}px`;
            battery.style.top = `${batteryY}px`;
            
            // Добавляем части батареи для визуализации
            for (let i = 0; i < 3; i++) {
                const part = document.createElement('div');
                part.className = 'battery-part';
                battery.appendChild(part);
            }
            
            gameContainer.appendChild(battery);
            batteries.push({
                element: battery,
                x: batteryX,
                y: batteryY
            });
        }
        
        function moveGameElements() {
            // Движение фона
            const currentBgPos = parseInt(background.style.backgroundPositionX) || 0;
            background.style.backgroundPositionX = `${(currentBgPos - scrollSpeed / 2) % 100}px`;
            
            // Движение стен
            walls.forEach(wall => {
                wall.x -= scrollSpeed;
                wall.element.style.left = `${wall.x}px`;
                
                // Удаление стен за пределами экрана
                if (wall.x + wall.element.offsetWidth < 0) {
                    wall.element.remove();
                    walls = walls.filter(w => w !== wall);
                }
            });
            
            // Движение батареек
            batteries.forEach(battery => {
                battery.x -= scrollSpeed;
                battery.element.style.left = `${battery.x}px`;
                
                // Удаление батареек за пределами экрана
                if (battery.x + battery.element.offsetWidth < 0) {
                    battery.element.remove();
                    batteries = batteries.filter(b => b !== battery);
                }
            });
        }
        
        function checkCollisions() {
            const playerRect = player.getBoundingClientRect();
            const gameRect = gameContainer.getBoundingClientRect();
            if (playerRect.top < gameRect.top || playerRect.bottom > gameRect.bottom) {
                endGame('collision');
                return;
            }
            // Проверка столкновений со стенами
            walls.forEach(wall => {
                    const wallRect = wall.element.getBoundingClientRect();
                    
                    if (
                        playerRect.right > wallRect.left &&
                        playerRect.left < wallRect.right &&
                        playerRect.bottom > wallRect.top &&
                        playerRect.top < wallRect.bottom
                    ) {
                        endGame('collision');
                    }
                });
            
            // Проверка сбора батареек
            batteries.forEach(battery => {
                const batteryRect = battery.element.getBoundingClientRect();
                
                if (
                    playerRect.right > batteryRect.left &&
                    playerRect.left < batteryRect.right &&
                    playerRect.bottom > batteryRect.top &&
                    playerRect.top < batteryRect.bottom
                ) {
                    // Анимация сбора
                    createCollectAnimation(batteryRect.left + batteryRect.width / 2 - gameRect.left, batteryRect.top + batteryRect.height / 2 - gameRect.top);
                    
                    // Увеличение заряда
                    power = Math.min(100, power + 5);
                    updatePower();
                    
                    // Удаление батарейки
                    battery.element.remove();
                    batteries = batteries.filter(b => b !== battery);
                }
            });
        }
        
        function createExplosion(x, y) {
            const explosion = document.createElement('div');
            explosion.className = 'explosion';
            explosion.style.left = `${x - 50}px`;
            explosion.style.top = `${y - 50}px`;
            
            gameContainer.appendChild(explosion);
            
            setTimeout(() => {
                explosion.style.transition = 'transform 0.5s, opacity 0.5s';
                explosion.style.transform = 'scale(1)';
                explosion.style.opacity = '0.8';
                
                setTimeout(() => {
                    explosion.style.opacity = '0';
                    setTimeout(() => explosion.remove(), 500);
                }, 200);
            }, 10);
        }
        
        function createCollectAnimation(x, y) {
            const anim = document.createElement('div');
            anim.className = 'collect-animation';
            anim.style.left = `${x - 15}px`;
            anim.style.top = `${y - 15}px`;
            
            gameContainer.appendChild(anim);
            
            setTimeout(() => {
                anim.remove();
            }, 500);
        }