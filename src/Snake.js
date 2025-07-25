// Snake.js
// Encapsulates snake logic for the Snake game

export default class Snake {
  constructor(initialSegments, initialDirection) {
    this.segments = [...initialSegments];
    this.direction = { ...initialDirection };
    this.dead = false;
    this.score = 0;
  }

  setDirection(newDirection) {
    // Prevent reversing direction
    if (
      (this.direction.x === -newDirection.x && this.direction.x !== 0) ||
      (this.direction.y === -newDirection.y && this.direction.y !== 0)
    ) {
      return;
    }
    this.direction = { ...newDirection };
  }

  getHead() {
    return this.segments[0];
  }

  move(food, otherSnakes = []) {
    if (this.dead) return;
    const newHead = {
      x: this.segments[0].x + this.direction.x,
      y: this.segments[0].y + this.direction.y,
    };
    // Check wall collision
    if (
      newHead.x < 0 || newHead.x >= 20 ||
      newHead.y < 0 || newHead.y >= 20
    ) {
      this.dead = true;
      return;
    }
    // Check self collision
    // If not eating, ignore tail (it will move away)
    let selfCollisionSegments = this.segments;
    const willEat = (food.x === newHead.x && food.y === newHead.y);
    if (!willEat && this.segments.length > 1) {
      selfCollisionSegments = this.segments.slice(0, -1);
    }
    if (selfCollisionSegments.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.dead = true;
      return;
    }
    // Check collision with other snakes
    for (const other of otherSnakes) {
      if (other.segments.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        this.dead = true;
        return;
      }
    }
    // Move snake
    this.segments = [newHead, ...this.segments];
    // Check food
    if (food.x === newHead.x && food.y === newHead.y) {
      this.score++;
      return 'eat';
    } else {
      this.segments.pop();
      return 'move';
    }
  }

  reset(initialSegments, initialDirection) {
    this.segments = [...initialSegments];
    this.direction = { ...initialDirection };
    this.dead = false;
    this.score = 0;
  }
}
