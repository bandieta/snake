import React, { useEffect, useRef, useState } from 'react';
import Snake from './Snake';

const BOARD_SIZE = 20;

// Helper to create a snake of length N
function makeSnake(start, dir, len) {
  const arr = [];
  for (let i = 0; i < len; ++i) {
    arr.push({ x: start.x - dir.x * i, y: start.y - dir.y * i });
  }
  return arr;
}




// Improved, long, smoothly looping scenarios
const DEMO_SCENARIOS = [
  // Scenario 1: snake1 zig-zags, snake2 circles edge, both eat 8x, loop
  {
    snake1: { segments: makeSnake({ x: 10, y: 15 }, { x: 0, y: -1 }, 8), dir: { x: 0, y: -1 } },
    snake2: { segments: makeSnake({ x: 2, y: 2 }, { x: 1, y: 0 }, 7), dir: { x: 1, y: 0 } },
    moves: [
      { food: { x: 10, y: 12 }, dir1: { x: 0, y: -1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 11, y: 12 }, dir1: { x: 1, y: 0 }, dir2: { x: 1, y: 0 } },
      { food: { x: 12, y: 12 }, dir1: { x: 1, y: 0 }, dir2: { x: 0, y: 1 } },
      { food: { x: 12, y: 13 }, dir1: { x: 0, y: 1 }, dir2: { x: 0, y: 1 } },
      { food: { x: 12, y: 14 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 13, y: 14 }, dir1: { x: 1, y: 0 }, dir2: { x: 1, y: 0 } },
      { food: { x: 14, y: 14 }, dir1: { x: 1, y: 0 }, dir2: { x: 0, y: -1 } },
      { food: { x: 14, y: 13 }, dir1: { x: 0, y: -1 }, dir2: { x: 0, y: -1 } },
      { food: { x: 14, y: 12 }, dir1: { x: 0, y: -1 }, dir2: { x: -1, y: 0 } },
      { food: { x: 13, y: 12 }, dir1: { x: -1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 12, y: 12 }, dir1: { x: -1, y: 0 }, dir2: { x: 0, y: 1 } },
      { food: { x: 12, y: 13 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 13, y: 13 }, dir1: { x: 1, y: 0 }, dir2: { x: 1, y: 0 } },
      { food: { x: 14, y: 13 }, dir1: { x: 1, y: 0 }, dir2: { x: 0, y: -1 } },
      { food: { x: 14, y: 12 }, dir1: { x: 0, y: -1 }, dir2: { x: -1, y: 0 } },
      { food: { x: 13, y: 12 }, dir1: { x: -1, y: 0 }, dir2: { x: -1, y: 0 } },
    ],
  },
  // Scenario 2: snake1 and snake2 race, eat, loop
  {
    snake1: { segments: makeSnake({ x: 5, y: 10 }, { x: 1, y: 0 }, 7), dir: { x: 1, y: 0 } },
    snake2: { segments: makeSnake({ x: 15, y: 10 }, { x: -1, y: 0 }, 7), dir: { x: -1, y: 0 } },
    moves: [
      { food: { x: 8, y: 10 }, dir1: { x: 1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 11, y: 10 }, dir1: { x: 1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 12, y: 11 }, dir1: { x: 0, y: 1 }, dir2: { x: 0, y: 1 } },
      { food: { x: 12, y: 13 }, dir1: { x: 0, y: 1 }, dir2: { x: 0, y: 1 } },
      { food: { x: 13, y: 13 }, dir1: { x: 1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 10, y: 13 }, dir1: { x: -1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 7, y: 13 }, dir1: { x: -1, y: 0 }, dir2: { x: 0, y: -1 } },
      { food: { x: 7, y: 10 }, dir1: { x: 0, y: -1 }, dir2: { x: 0, y: -1 } },
      { food: { x: 8, y: 10 }, dir1: { x: 1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 11, y: 10 }, dir1: { x: 1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 12, y: 11 }, dir1: { x: 0, y: 1 }, dir2: { x: 0, y: 1 } },
      { food: { x: 12, y: 13 }, dir1: { x: 0, y: 1 }, dir2: { x: 0, y: 1 } },
    ],
  },
  // Scenario 3: snake1 spirals, snake2 follows, eat, loop
  {
    snake1: { segments: makeSnake({ x: 10, y: 10 }, { x: 0, y: 1 }, 8), dir: { x: 0, y: 1 } },
    snake2: { segments: makeSnake({ x: 5, y: 5 }, { x: 1, y: 0 }, 7), dir: { x: 1, y: 0 } },
    moves: [
      { food: { x: 10, y: 13 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 13, y: 13 }, dir1: { x: 1, y: 0 }, dir2: { x: 1, y: 0 } },
      { food: { x: 13, y: 10 }, dir1: { x: 0, y: -1 }, dir2: { x: 0, y: -1 } },
      { food: { x: 10, y: 10 }, dir1: { x: -1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 7, y: 10 }, dir1: { x: -1, y: 0 }, dir2: { x: 0, y: 1 } },
      { food: { x: 7, y: 13 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 10, y: 13 }, dir1: { x: 1, y: 0 }, dir2: { x: 1, y: 0 } },
      { food: { x: 13, y: 13 }, dir1: { x: 1, y: 0 }, dir2: { x: 0, y: -1 } },
      { food: { x: 13, y: 10 }, dir1: { x: 0, y: -1 }, dir2: { x: -1, y: 0 } },
      { food: { x: 10, y: 10 }, dir1: { x: -1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 7, y: 10 }, dir1: { x: -1, y: 0 }, dir2: { x: 0, y: 1 } },
      { food: { x: 7, y: 13 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
    ],
  },
  // Scenario 4: snake1 and snake2 cross, eat, loop
  {
    snake1: { segments: makeSnake({ x: 8, y: 8 }, { x: 1, y: 0 }, 7), dir: { x: 1, y: 0 } },
    snake2: { segments: makeSnake({ x: 12, y: 12 }, { x: -1, y: 0 }, 7), dir: { x: -1, y: 0 } },
    moves: [
      { food: { x: 10, y: 8 }, dir1: { x: 1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 10, y: 10 }, dir1: { x: 0, y: 1 }, dir2: { x: 0, y: -1 } },
      { food: { x: 8, y: 10 }, dir1: { x: -1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 8, y: 12 }, dir1: { x: 0, y: 1 }, dir2: { x: 0, y: 1 } },
      { food: { x: 10, y: 12 }, dir1: { x: 1, y: 0 }, dir2: { x: 1, y: 0 } },
      { food: { x: 12, y: 12 }, dir1: { x: 1, y: 0 }, dir2: { x: 0, y: -1 } },
      { food: { x: 12, y: 10 }, dir1: { x: 0, y: -1 }, dir2: { x: -1, y: 0 } },
      { food: { x: 10, y: 10 }, dir1: { x: -1, y: 0 }, dir2: { x: -1, y: 0 } },
      { food: { x: 8, y: 8 }, dir1: { x: 0, y: -1 }, dir2: { x: 0, y: -1 } },
      { food: { x: 8, y: 10 }, dir1: { x: 1, y: 0 }, dir2: { x: 1, y: 0 } },
    ],
  },
  // Scenario 5: snake1 and snake2 chase, eat, loop
  {
    snake1: { segments: makeSnake({ x: 18, y: 2 }, { x: 0, y: 1 }, 7), dir: { x: 0, y: 1 } },
    snake2: { segments: makeSnake({ x: 2, y: 18 }, { x: 1, y: 0 }, 7), dir: { x: 1, y: 0 } },
    moves: [
      { food: { x: 18, y: 5 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 15, y: 5 }, dir1: { x: -1, y: 0 }, dir2: { x: 0, y: -1 } },
      { food: { x: 15, y: 2 }, dir1: { x: 0, y: -1 }, dir2: { x: -1, y: 0 } },
      { food: { x: 12, y: 2 }, dir1: { x: -1, y: 0 }, dir2: { x: 0, y: 1 } },
      { food: { x: 12, y: 5 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 15, y: 5 }, dir1: { x: 1, y: 0 }, dir2: { x: 0, y: -1 } },
      { food: { x: 15, y: 8 }, dir1: { x: 0, y: 1 }, dir2: { x: 1, y: 0 } },
      { food: { x: 18, y: 8 }, dir1: { x: 1, y: 0 }, dir2: { x: 0, y: 1 } },
      { food: { x: 18, y: 5 }, dir1: { x: 0, y: -1 }, dir2: { x: -1, y: 0 } },
      { food: { x: 15, y: 5 }, dir1: { x: -1, y: 0 }, dir2: { x: 0, y: -1 } },
    ],
  },
];

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

export default function DemoAnimation() {

  // Cycle through all scenarios in order
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = DEMO_SCENARIOS[scenarioIdx];
  const [step, setStep] = useState(0);
  const snake1Ref = useRef();
  const snake2Ref = useRef();
  const [food, setFood] = useState(scenario.moves[0].food);

  // Reset snakes at the start of each scenario
  useEffect(() => {
    snake1Ref.current = new Snake(
      scenario.snake1.segments.map(seg => ({ ...seg })),
      { ...scenario.snake1.dir }
    );
    snake2Ref.current = new Snake(
      scenario.snake2.segments.map(seg => ({ ...seg })),
      { ...scenario.snake2.dir }
    );
    setFood(scenario.moves[0].food);
    setStep(0);
  }, [scenarioIdx]);

  useEffect(() => {
    const interval = setInterval(() => {
      const moveIdx = step % scenario.moves.length;
      const move = scenario.moves[moveIdx];
      // Defensive: if refs not set, reset them
      if (!snake1Ref.current || !snake2Ref.current) {
        snake1Ref.current = new Snake(
          scenario.snake1.segments.map(seg => ({ ...seg })),
          { ...scenario.snake1.dir }
        );
        snake2Ref.current = new Snake(
          scenario.snake2.segments.map(seg => ({ ...seg })),
          { ...scenario.snake2.dir }
        );
      }
      snake1Ref.current.setDirection(move.dir1);
      snake2Ref.current.setDirection(move.dir2);
      // Move snakes
      const result1 = snake1Ref.current.move(food, [snake2Ref.current]);
      const result2 = snake2Ref.current.move(food, [snake1Ref.current]);
      // If either eats, advance food
      if (result1 === 'eat' || result2 === 'eat') {
        setFood(scenario.moves[(moveIdx + 1) % scenario.moves.length].food);
      }
      // If finished scenario, go to next
      if (moveIdx === scenario.moves.length - 1) {
        setTimeout(() => {
          setScenarioIdx(idx => (idx + 1) % DEMO_SCENARIOS.length);
        }, 120); // short delay before next scenario
      } else {
        setStep(s => s + 1);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [step, scenario, food]);

  // Render board
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        opacity: 0.5,
      }}
    >
      <div
        style={{
          background: '#222',
          border: '2px solid #555',
          width: BOARD_SIZE * 20,
          height: BOARD_SIZE * 20,
          display: 'grid',
          gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
        }}
      >
        {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, i) => {
          const x = i % BOARD_SIZE;
          const y = Math.floor(i / BOARD_SIZE);
          const isSnake = snake1Ref.current && snake1Ref.current.segments.some(seg => seg.x === x && seg.y === y);
          const isSnake2 = snake2Ref.current && snake2Ref.current.segments.some(seg => seg.x === x && seg.y === y);
          const isFood = food.x === x && food.y === y;
          // Head and body same color
          const snakeColor = 'rgba(51,255,51,0.7)';
          const snake2Color = 'rgba(51,51,255,0.7)';
          return (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                background: isFood
                  ? 'transparent'
                  : isSnake2
                  ? snake2Color
                  : isSnake
                  ? snakeColor
                  : 'rgba(51,51,51,0.2)',
                border: '1px solid #222',
                position: 'relative',
              }}
            >
              {isFood ? (
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: 'rgba(255,0,0,0.7)',
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    borderRadius: '50%',
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
