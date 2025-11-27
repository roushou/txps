import type { Lane } from "./types";

export class Particle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  color = "";
  size = 0;
  laneIndex = 0;
  active = false;
  screenWidth = 0;
  screenHeight = 0;

  reset(laneIndex: number, lanes: Lane[], width: number, height: number): void {
    this.laneIndex = laneIndex;
    this.active = true;
    this.screenWidth = width;
    this.screenHeight = height;
    const lane = lanes[laneIndex];

    if (lane.orientation === "vertical") {
      this.x = lane.x + Math.random() * lane.w;
      this.y = height + 10;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -(lane.chain.speed + Math.random() * 2);
    } else {
      this.x = -10;
      this.y = lane.y + Math.random() * lane.h;
      this.vx = lane.chain.speed + Math.random() * 2;
      this.vy = (Math.random() - 0.5) * 0.5;
    }

    this.color = lane.chain.color;
    this.size = Math.random() * 2 + 1;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  isDead(): boolean {
    if (this.y < -10 || this.x < -10) {
      this.active = false;
      return true;
    }
    return false;
  }
}
