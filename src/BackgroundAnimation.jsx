import React, { useRef, useEffect } from 'react';
import Snake from './Snake';

const BOARD_SIZE = 20;
const CELL_SIZE = 20;
const SNAKE_COLORS = ['#0f0', '#00f'];
const SNAKE_HEAD_COLORS = ['#3f3', '#33f'];
const FOOD_COLOR = '#f00';

function getRandomDirection() {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

// Predefined demo scenarios (longer, snakes eat at least twice)
const DEMO_SCENARIOS = [
  // Scenario 1: Single snake, classic start, long
  () => [
    new Snake([
      { x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }, { x: 10, y: 13 }, { x: 10, y: 14 }, { x: 10, y: 15 }
    ], { x: 0, y: -1 })
  ],
  // Scenario 2: Two snakes, head-to-head, longer
  () => [
    new Snake([
      { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }, { x: 5, y: 8 }, { x: 5, y: 9 }
    ], { x: 0, y: -1 }),
    new Snake([
      { x: 15, y: 15 }, { x: 15, y: 16 }, { x: 15, y: 17 }, { x: 15, y: 18 }, { x: 15, y: 19 }
    ], { x: 0, y: -1 })
  ],
  // Scenario 3: Two snakes, crossing paths, longer
  () => [
    new Snake([
      { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }
    ], { x: 1, y: 0 }),
    new Snake([
      { x: 12, y: 12 }, { x: 12, y: 13 }, { x: 12, y: 14 }, { x: 12, y: 15 }, { x: 12, y: 16 }
    ], { x: -1, y: 0 })
  ],
  // Scenario 4: Snake chasing food in corner, longer
  () => [
    new Snake([
      { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 2, y: 6 }
    ], { x: 1, y: 0 })
  ],
  // Scenario 5: Two snakes, one long, one short, both eat
  () => [
    new Snake([
      { x: 3, y: 17 }, { x: 4, y: 17 }, { x: 5, y: 17 }, { x: 6, y: 17 }, { x: 7, y: 17 }, { x: 8, y: 17 }, { x: 9, y: 17 }, { x: 10, y: 17 }
    ], { x: 1, y: 0 }),
    new Snake([
      { x: 17, y: 3 }, { x: 17, y: 4 }, { x: 17, y: 5 }, { x: 17, y: 6 }, { x: 17, y: 7 }
    ], { x: 0, y: 1 })
  ],
  // Scenario 6: Two snakes, close to collision, longer
  () => [
    new Snake([
      { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 }, { x: 10, y: 9 }
    ], { x: 0, y: 1 }),
    new Snake([
      { x: 11, y: 7 }, { x: 11, y: 8 }, { x: 11, y: 9 }, { x: 11, y: 10 }, { x: 11, y: 11 }
    ], { x: 0, y: -1 })
  ],
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

export default function BackgroundAnimation() {
  const canvasRef = useRef(null);
  const snakesRef = useRef([]);
  const foodRef = useRef(null);
  const tickRef = useRef(0);
  const musicRef = useRef(null);
  const scenarioRef = useRef(0);

  // Play music on mount (try autoplay)
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.loop = true;
      musicRef.current.volume = 0.3;
      musicRef.current.currentTime = 0;
      // Try to play immediately
      musicRef.current.play().catch(() => {});
    }
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }
    };
  }, []);

  // Initialize first scenario
  useEffect(() => {
    scenarioRef.current = 0;
    const snakes = DEMO_SCENARIOS[scenarioRef.current % DEMO_SCENARIOS.length]();
    snakesRef.current = snakes;
    foodRef.current = getRandomFood(snakes);
    tickRef.current = 0;
  }, []);

  // Animation loop (slower, constant, demo scenarios)
  useEffect(() => {
    let running = true;
    let lastTime = 0;
    function animate(ts) {
      if (!running) return;
      // Slow down animation: only update every ~60ms
      if (ts - lastTime < 60) {
        requestAnimationFrame(animate);
        return;
      }
      lastTime = ts;
      // Move snakes
      snakesRef.current.forEach(snake => {
        if (!snake.dead) {
          // 10% chance to change direction
          if (Math.random() < 0.1) {
            snake.setDirection(getRandomDirection());
          }
          const result = snake.move(foodRef.current, snakesRef.current.filter(s => s !== snake));
          if (result === 'eat') {
            foodRef.current = getRandomFood(snakesRef.current);
          }
        }
      });
      draw();
      tickRef.current++;
      // When all snakes are dead, immediately start next scenario
      if (snakesRef.current.every(snake => snake.dead)) {
        scenarioRef.current = (scenarioRef.current + 1) % DEMO_SCENARIOS.length;
        const snakes = DEMO_SCENARIOS[scenarioRef.current]();
        snakesRef.current = snakes;
        foodRef.current = getRandomFood(snakes);
        tickRef.current = 0;
      }
      requestAnimationFrame(animate);
    }
    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw board background
      ctx.fillStyle = '#222';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.7;
      // Draw food (circle)
      if (foodRef.current) {
        ctx.fillStyle = FOOD_COLOR;
        ctx.beginPath();
        ctx.arc(
          foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
          foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2.5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
      // Draw snakes (head different color)
      snakesRef.current.forEach((snake, idx) => {
        snake.segments.forEach((seg, i) => {
          ctx.globalAlpha = i === 0 ? 0.9 : 0.6;
          ctx.fillStyle = i === 0 ? SNAKE_HEAD_COLORS[idx % SNAKE_HEAD_COLORS.length] : SNAKE_COLORS[idx % SNAKE_COLORS.length];
          ctx.fillRect(seg.x * CELL_SIZE, seg.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
      });
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(animate);
    return () => { running = false; };
  }, []);

  return (
    <>
      <audio ref={musicRef} src="/melody.mp3" preload="auto" autoPlay />
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE * CELL_SIZE}
        height={BOARD_SIZE * CELL_SIZE}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          opacity: 0.5,
          pointerEvents: 'none',
          borderRadius: '12px',
        }}
      />
    </>
  );
}
