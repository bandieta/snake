import React, { useState, useEffect, useRef } from 'react';
import Snake from './Snake';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SNAKE2 = [{ x: 5, y: 5 }];
const INITIAL_DIRECTION2 = { x: 0, y: 1 };

function getRandomFood(snakes) {
  let food;
  while (true) {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    if (!snakes.some(snake => snake.segments.some(seg => seg.x === food.x && seg.y === food.y))) break;
  }
  return food;
}

function App() {
  const eatAudio = useRef(null);
  const melodyAudio = useRef(null);
  const moveAudio = useRef(null);
  const crashAudio = useRef(null);
  const audioUnlocked = useRef(false);
  const [gameMode, setGameMode] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [snake1] = useState(() => new Snake(INITIAL_SNAKE, INITIAL_DIRECTION));
  const [snake2] = useState(() => new Snake(INITIAL_SNAKE2, INITIAL_DIRECTION2));
  const [food, setFood] = useState(getRandomFood([snake1, snake2]));
  const [, setTick] = useState(0); // Dummy state to force re-render

  // --- Effects ---

  // Play melody and crash sound on game state changes
  useEffect(() => {
    if (!gameOver && melodyAudio.current) {
      melodyAudio.current.loop = true;
      melodyAudio.current.volume = 0.3;
      if (melodyAudio.current.paused) {
        melodyAudio.current.currentTime = 0;
        melodyAudio.current.play();
      }
    }
    if (gameOver) {
      if (melodyAudio.current) {
        melodyAudio.current.pause();
        melodyAudio.current.currentTime = 0;
      }
      if (crashAudio.current) {
        crashAudio.current.currentTime = 0;
        crashAudio.current.play();
      }
    }
  }, [gameOver]);

  // Handle keyboard input for both players
  useEffect(() => {
    if (gameOver || !gameMode) return;
    function unlockAudio() {
      if (!audioUnlocked.current) {
        if (eatAudio.current) {
          eatAudio.current.volume = 0;
          eatAudio.current.play().catch(() => {});
          setTimeout(() => { eatAudio.current.volume = 1; }, 100);
        }
        if (melodyAudio.current) {
          melodyAudio.current.volume = 0;
          melodyAudio.current.play().catch(() => {});
          setTimeout(() => { melodyAudio.current.volume = 0.3; }, 100);
        }
        if (moveAudio.current) {
          moveAudio.current.volume = 0;
          moveAudio.current.play().catch(() => {});
          setTimeout(() => { moveAudio.current.volume = 1; }, 100);
        }
        audioUnlocked.current = true;
      }
    }
    function handleKey(e) {
      let played = false;
      // Player 1: Arrow keys
      if (gameMode >= 1) {
        switch (e.key) {
          case 'ArrowUp':
            snake1.setDirection({ x: 0, y: -1 }); played = true; break;
          case 'ArrowDown':
            snake1.setDirection({ x: 0, y: 1 }); played = true; break;
          case 'ArrowLeft':
            snake1.setDirection({ x: -1, y: 0 }); played = true; break;
          case 'ArrowRight':
            snake1.setDirection({ x: 1, y: 0 }); played = true; break;
          default: break;
        }
      }
      // Player 2: WASD
      if (gameMode === 2) {
        switch (e.key.toLowerCase()) {
          case 'w': snake2.setDirection({ x: 0, y: -1 }); played = true; break;
          case 's': snake2.setDirection({ x: 0, y: 1 }); played = true; break;
          case 'a': snake2.setDirection({ x: -1, y: 0 }); played = true; break;
          case 'd': snake2.setDirection({ x: 1, y: 0 }); played = true; break;
          default: break;
        }
      }
      if (played && moveAudio.current) {
        moveAudio.current.currentTime = 0;
        moveAudio.current.play();
      }
    }
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keydown', unlockAudio, { once: true });
      window.removeEventListener('click', unlockAudio, { once: true });
    };
  }, [gameOver, gameMode, snake1, snake2]);

  // Main game loop: moves the snake every 120ms
  useEffect(() => {
    if (gameOver || !gameMode) return;
    const interval = setInterval(() => {
      let moved = false;
      moved = moveSnakes();
      if (moved) setTick(tick => tick + 1); // Force re-render
      if ((gameMode === 2 && snake1.dead && snake2.dead) || (gameMode === 1 && snake1.dead)) {
        setGameOver(true);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [food, gameOver, gameMode, snake1, snake2]);

  // --- Helpers ---

  // Move both snakes and handle food
  function moveSnakes() {
    let moved = false;
    if (!snake1.dead) {
      const result1 = snake1.move(food, gameMode === 2 ? [snake2] : []);
      moved = true;
      if (result1 === 'eat') {
        setFood(getRandomFood(gameMode === 2 ? [snake1, snake2] : [snake1]));
        playEatSound();
      }
    }
    if (gameMode === 2 && !snake2.dead) {
      const result2 = snake2.move(food, [snake1]);
      moved = true;
      if (result2 === 'eat') {
        setFood(getRandomFood([snake1, snake2]));
        playEatSound();
      }
    }
    return moved;
  }

  // Play eat sound
  function playEatSound() {
    if (eatAudio.current) {
      eatAudio.current.currentTime = 0;
      eatAudio.current.play();
      setTimeout(() => {
        eatAudio.current.pause();
        eatAudio.current.currentTime = 0;
      }, 1000);
    }
  }

  // Render the game board
  function renderBoard() {
    return (
      <div
        style={{
          background: '#222',
          margin: '1rem auto',
          border: '2px solid #555',
          padding: 0,
          width: (BOARD_SIZE * 20) + 'px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
            margin: 'auto',
          }}
        >
          {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, i) => {
            const x = i % BOARD_SIZE;
            const y = Math.floor(i / BOARD_SIZE);
            const isSnake = snake1.segments.some(seg => seg.x === x && seg.y === y);
            const isSnake2 = gameMode === 2 && snake2.segments.some(seg => seg.x === x && seg.y === y);
            const isFood = food.x === x && food.y === y;
            return (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 20,
                  background:
                    isSnake2 ? '#00f' : isSnake ? '#0f0' : isFood ? '#f00' : '#333',
                  border: '1px solid #222',
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const handleRestart = () => {
    snake1.reset(INITIAL_SNAKE, INITIAL_DIRECTION);
    snake2.reset(INITIAL_SNAKE2, INITIAL_DIRECTION2);
    setFood(getRandomFood([snake1, snake2]));
    setGameOver(false);
    setGameMode(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        textAlign: 'center',
      }}
    >
      <audio ref={eatAudio} src="/bite.mp3" preload="auto" />
      <audio ref={melodyAudio} src="/melody.mp3" preload="auto" />
      <audio ref={moveAudio} src="/step.mp3" preload="auto" />
      <audio ref={crashAudio} src="/crash.mp3" preload="auto" />
      <h1>Snake Game</h1>
      {gameMode === null && !gameOver && (
        <div style={{ margin: '2rem' }}>
          <button style={{ fontSize: '1.2rem', margin: '1rem' }} onClick={() => setGameMode(1)}>1 Player</button>
          <button style={{ fontSize: '1.2rem', margin: '1rem' }} onClick={() => setGameMode(2)}>2 Players</button>
        </div>
      )}
      {gameMode !== null && (
        <>
          <div>Score: {snake1.score}{gameMode === 2 && <> | Player 2: {snake2.score}</>}</div>
          <div
            style={{
              background: '#222',
              margin: '1rem auto',
              border: '2px solid #555',
              padding: 0,
              width: (BOARD_SIZE * 20) + 'px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
                margin: 'auto',
              }}
            >
              {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, i) => {
                const x = i % BOARD_SIZE;
                const y = Math.floor(i / BOARD_SIZE);
                const isSnake = snake1.segments.some(seg => seg.x === x && seg.y === y);
                const isSnake2 = gameMode === 2 && snake2.segments.some(seg => seg.x === x && seg.y === y);
                const isFood = food.x === x && food.y === y;
                return (
                  <div
                    key={i}
                    style={{
                      width: 20,
                      height: 20,
                      background:
                        isSnake2 ? '#00f' : isSnake ? '#0f0' : isFood ? '#f00' : '#333',
                      border: '1px solid #222',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
      <div style={{ marginTop: '1rem', color: '#888' }}>
        {gameMode === 1 && 'Use arrow keys to control the snake.'}
        {gameMode === 2 && 'Player 1: Arrow keys | Player 2: W/A/S/D'}
      </div>
    </div>
  );
}

export default App;
