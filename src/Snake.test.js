import { describe, it, expect } from 'vitest';
import Snake from './Snake';

describe('Snake class', () => {
  it('initializes with correct segments and direction', () => {
    const initial = [{ x: 2, y: 2 }];
    const dir = { x: 1, y: 0 };
    const snake = new Snake(initial, dir);
    expect(snake.segments).toEqual(initial);
    expect(snake.direction).toEqual(dir);
    expect(snake.dead).toBe(false);
    expect(snake.score).toBe(0);
  });

  it('moves in the correct direction', () => {
    const snake = new Snake([{ x: 2, y: 2 }], { x: 1, y: 0 });
    snake.move({ x: 10, y: 10 }, []);
    expect(snake.segments[0]).toEqual({ x: 3, y: 2 });
  });

  it('grows when eating food', () => {
    const snake = new Snake([{ x: 2, y: 2 }], { x: 1, y: 0 });
    const result = snake.move({ x: 3, y: 2 }, []);
    expect(result).toBe('eat');
    expect(snake.segments.length).toBe(2);
    expect(snake.score).toBe(1);
  });

  it('dies when colliding with itself', () => {
    // Snake forms a square, head at (2,2), direction down, will move into (2,3) which is part of its body
    const snake = new Snake([
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ], { x: 0, y: 1 });
    // Move into itself with food at (2,3) so tail does not move away
    snake.move({ x: 2, y: 3 }, []);
    expect(snake.dead).toBe(true);
  });

  it('resets to initial state', () => {
    const initial = [{ x: 2, y: 2 }];
    const dir = { x: 1, y: 0 };
    const snake = new Snake(initial, dir);
    snake.move({ x: 10, y: 10 }, []);
    snake.reset(initial, dir);
    expect(snake.segments).toEqual(initial);
    expect(snake.direction).toEqual(dir);
    expect(snake.dead).toBe(false);
    expect(snake.score).toBe(0);
  });
});
