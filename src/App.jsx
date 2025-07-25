import React, { useState, useEffect, useRef } from 'react';


// Snake Game implemented in React
// - Arrow keys control the snake
// - Eat food to grow and score points
// - Game ends if the snake hits the wall or itself
// - Press Restart to play again


// Size of the board (20x20 grid)
const BOARD_SIZE = 20;
// Initial snake position (center of the board)
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
];
// Initial movement direction (up)
const INITIAL_DIRECTION = { x: 0, y: -1 };


// Generate a random food position not occupied by the snake
function getRandomFood(snake) {
  let food;
  while (true) {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    // Ensure food does not spawn on the snake
    if (!snake.some(seg => seg.x === food.x && seg.y === food.y)) break;
  }
  return food;
}


function App() {
  // Sound effects
  const eatAudio = useRef(null);
  const melodyAudio = useRef(null);
  const moveAudio = useRef(null);
  const crashAudio = useRef(null);
  // Unlock audio playback on first user interaction
  const audioUnlocked = useRef(false);
  // Game mode: null (not started), 1 (single player), 2 (two players)
  const [gameMode, setGameMode] = useState(null);
  // State for snake segments (array of {x, y} objects)
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  // State for current movement direction
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  // State for second snake (2-player mode)
  const [snake2, setSnake2] = useState([{ x: 5, y: 5 }]);
  const [direction2, setDirection2] = useState({ x: 0, y: 1 });
  // State for food position
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  // State for game over flags
  const [gameOver, setGameOver] = useState(false);
  const [snake1Dead, setSnake1Dead] = useState(false);
  const [snake2Dead, setSnake2Dead] = useState(false);
  // State for score
  const [score, setScore] = useState(0);
  const [score2, setScore2] = useState(0);
  // Ref to keep track of direction between renders
  const moveRef = useRef(direction);
  const moveRef2 = useRef(direction2);

  // Update moveRef whenever direction changes
  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);
  useEffect(() => {
    moveRef2.current = direction2;
  }, [direction2]);

  // Listen for key presses to change direction (supports 2 players)
  useEffect(() => {
    if (gameOver || !gameMode) return;
    // Unlock audio on first user interaction
    const unlockAudio = () => {
      if (!audioUnlocked.current) {
        // Play a silent sound to unlock audio
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
    };
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });

    const handleKey = (e) => {
      let played = false;
      // Player 1: Arrow keys
      switch (e.key) {
        case 'ArrowUp':
          if (moveRef.current.y !== 1) {
            setDirection({ x: 0, y: -1 });
            played = true;
          }
          break;
        case 'ArrowDown':
          if (moveRef.current.y !== -1) {
            setDirection({ x: 0, y: 1 });
            played = true;
          }
          break;
        case 'ArrowLeft':
          if (moveRef.current.x !== 1) {
            setDirection({ x: -1, y: 0 });
            played = true;
          }
          break;
        case 'ArrowRight':
          if (moveRef.current.x !== -1) {
            setDirection({ x: 1, y: 0 });
            played = true;
          }
          break;
        default:
          break;
      }
      // Player 2: W/A/S/D
      if (gameMode === 2) {
        switch (e.key.toLowerCase()) {
          case 'w':
            if (moveRef2.current.y !== 1) {
              setDirection2({ x: 0, y: -1 });
              played = true;
            }
            break;
          case 's':
            if (moveRef2.current.y !== -1) {
              setDirection2({ x: 0, y: 1 });
              played = true;
            }
            break;
          case 'a':
            if (moveRef2.current.x !== 1) {
              setDirection2({ x: -1, y: 0 });
              played = true;
            }
            break;
          case 'd':
            if (moveRef2.current.x !== -1) {
              setDirection2({ x: 1, y: 0 });
              played = true;
            }
            break;
          default:
            break;
        }
      }
      if (played && moveAudio.current) {
        moveAudio.current.currentTime = 0;
        moveAudio.current.play();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keydown', unlockAudio, { once: true });
      window.removeEventListener('click', unlockAudio, { once: true });
    };
  }, [gameOver, gameMode]);

  // Main game loop: moves the snake every 120ms
  useEffect(() => {
    if (gameOver || !gameMode) return;
    const interval = setInterval(() => {
      // Player 1
      if (!snake1Dead) {
        setSnake(prev => {
          const newHead = {
            x: prev[0].x + direction.x,
            y: prev[0].y + direction.y,
          };
          if (
            newHead.x < 0 || newHead.x >= BOARD_SIZE ||
            newHead.y < 0 || newHead.y >= BOARD_SIZE ||
            prev.some(seg => seg.x === newHead.x && seg.y === newHead.y) ||
            (gameMode === 2 && snake2.some(seg => seg.x === newHead.x && seg.y === newHead.y))
          ) {
            setSnake1Dead(true);
            return prev;
          }
          let newSnake = [newHead, ...prev];
          if (newHead.x === food.x && newHead.y === food.y) {
            setFood(getRandomFood(gameMode === 2 ? [...newSnake, ...snake2] : newSnake));
            setScore(s => s + 1);
            if (eatAudio.current) {
              eatAudio.current.currentTime = 0;
              eatAudio.current.play();
              setTimeout(() => {
                eatAudio.current.pause();
                eatAudio.current.currentTime = 0;
              }, 1000);
            }
          } else {
            newSnake.pop();
          }
          return newSnake;
        });
      }
      // Player 2
      if (gameMode === 2 && !snake2Dead) {
        setSnake2(prev => {
          const newHead = {
            x: prev[0].x + direction2.x,
            y: prev[0].y + direction2.y,
          };
          if (
            newHead.x < 0 || newHead.x >= BOARD_SIZE ||
            newHead.y < 0 || newHead.y >= BOARD_SIZE ||
            prev.some(seg => seg.x === newHead.x && seg.y === newHead.y) ||
            snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
          ) {
            setSnake2Dead(true);
            return prev;
          }
          let newSnake = [newHead, ...prev];
          if (newHead.x === food.x && newHead.y === food.y) {
            setFood(getRandomFood([...snake, ...newSnake]));
            setScore2(s => s + 1);
            if (eatAudio.current) {
              eatAudio.current.currentTime = 0;
              eatAudio.current.play();
              setTimeout(() => {
                eatAudio.current.pause();
                eatAudio.current.currentTime = 0;
              }, 1000);
            }
          } else {
            newSnake.pop();
          }
          return newSnake;
        });
      }
      // End game only if both are dead
      if ((gameMode === 2 && snake1Dead && snake2Dead) || (gameMode === 1 && snake1Dead)) {
        setGameOver(true);
      }
    }, 120);
    return () => {
      clearInterval(interval);
    };
  }, [direction, direction2, food, gameOver, gameMode, snake2, snake, snake1Dead, snake2Dead]);

  // Play melody in loop only once per game session
  useEffect(() => {
    if (!gameOver && melodyAudio.current) {
      melodyAudio.current.loop = true;
      melodyAudio.current.volume = 0.3;
      // Only play if not already playing
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
    // No cleanup needed
  }, [gameOver]);

  // Restart the game to initial state
  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setSnake2([{ x: 5, y: 5 }]);
    setDirection2({ x: 0, y: 1 });
    setFood(getRandomFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setScore2(0);
    setGameMode(null);
    setSnake1Dead(false);
    setSnake2Dead(false);
  };

  // Render the game board and UI
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
      {/* Sound effects (local files in public folder) */}
      <audio ref={eatAudio} src="/bite.mp3" preload="auto" />
      <audio ref={melodyAudio} src="/melody.mp3" preload="auto" />
      <audio ref={moveAudio} src="/step.mp3" preload="auto" />
      <audio ref={crashAudio} src="/crash.mp3" preload="auto" />
      <h1>Snake Game</h1>
      {/* Start screen */}
      {gameMode === null && !gameOver && (
        <div style={{ margin: '2rem' }}>
          <button style={{ fontSize: '1.2rem', margin: '1rem' }} onClick={() => setGameMode(1)}>1 Player</button>
          <button style={{ fontSize: '1.2rem', margin: '1rem' }} onClick={() => setGameMode(2)}>2 Players</button>
        </div>
      )}
      {/* Game board and scores */}
      {gameMode !== null && (
        <>
          <div>Score: {score}{gameMode === 2 && <> | Player 2: {score2}</>}</div>
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
              {/* Render each cell of the board */}
              {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, i) => {
                const x = i % BOARD_SIZE;
                const y = Math.floor(i / BOARD_SIZE);
                // Check if cell is part of the snake
                const isSnake = snake.some(seg => seg.x === x && seg.y === y);
                const isSnake2 = gameMode === 2 && snake2.some(seg => seg.x === x && seg.y === y);
                // Check if cell is food
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
      {/* Show Game Over and Restart button if game is over */}
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
