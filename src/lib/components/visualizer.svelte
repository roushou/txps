<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Particle } from "../particle";
  import { CHAINS } from "../constants";
  import type { Lane } from "../types";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let width = $state(0);
  let height = $state(0);
  let isMobile = $state(false);
  let scaleFactor = $state(1);
  let particles: Particle[] = [];
  let particlePool: Particle[] = [];
  let lanes: Lane[] = $state([]);
  let animationId: number;
  let lastTime = performance.now();

  function getParticle(laneIndex: number): Particle {
    let p = particlePool.pop();
    if (!p) {
      p = new Particle();
    }
    p.reset(laneIndex, lanes, width, height);
    return p;
  }

  function initLanes() {
    lanes = CHAINS.filter((chain) => chain.enabled).map((chain) => ({
      chain,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      orientation: "vertical" as const,
      accumulator: 0,
      totalTx: 0,
    }));
  }

  function calculateLaneDimensions() {
    const laneCount = lanes.length;

    if (isMobile) {
      lanes.forEach((lane, i) => {
        lane.x = 0;
        lane.y = (height / laneCount) * i;
        lane.w = width;
        lane.h = height / laneCount;
        lane.orientation = "horizontal";
      });
    } else {
      const laneWidth = width / laneCount;
      lanes.forEach((lane, i) => {
        lane.x = laneWidth * i;
        lane.y = 0;
        lane.w = laneWidth;
        lane.h = height;
        lane.orientation = "vertical";
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
    isMobile = width <= 768;
    calculateLaneDimensions();
  }

  function setScale(val: number) {
    scaleFactor = val;
    particlePool.push(...particles);
    particles = [];
  }

  function loop(timestamp: number) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Clear with trail effect
    ctx.fillStyle = "rgba(5, 5, 5, 0.3)";
    ctx.fillRect(0, 0, width, height);

    // Draw lane dividers
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    lanes.forEach((lane) => {
      if (lane.orientation === "vertical") {
        ctx.moveTo(lane.x + lane.w, 0);
        ctx.lineTo(lane.x + lane.w, height);
      } else {
        ctx.moveTo(0, lane.y + lane.h);
        ctx.lineTo(width, lane.y + lane.h);
      }
    });
    ctx.stroke();

    // Spawn particles & update counters
    lanes.forEach((lane, index) => {
      const adjustedTps = lane.chain.tps / scaleFactor;

      if (dt < 1) {
        lane.accumulator += adjustedTps * dt;
      }

      const toSpawn = Math.floor(lane.accumulator);
      if (toSpawn > 0) {
        lane.accumulator -= toSpawn;
        lane.totalTx += toSpawn * scaleFactor;

        const visualSpawn = Math.min(toSpawn, 50);
        for (let i = 0; i < visualSpawn; i++) {
          particles.push(getParticle(index));
        }
      }
    });

    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }

    // Swap-remove dead particles and return to pool
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].isDead()) {
        particlePool.push(particles[i]);
        particles[i] = particles[particles.length - 1];
        particles.pop();
      }
    }

    animationId = requestAnimationFrame(loop);
  }

  onMount(() => {
    initLanes();
    ctx = canvas.getContext("2d", { alpha: false })!;
    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(loop);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    }
  });
</script>

<div class="container">
  <!-- Canvas Layer -->
  <div id="canvas-container">
    <canvas bind:this={canvas}></canvas>
  </div>

  <!-- UI Layer -->
  <div id="ui-layer">
    <header>
      <h1>Live Throughput</h1>
      <p class="subtitle">
        Real-time visualization of blockchain transaction speeds. Each dot represents a single
        transaction.
      </p>
    </header>

    <div class="controls">
      <button class:active={scaleFactor === 1} onclick={() => setScale(1)}> 1:1 Scale </button>
      <button class:active={scaleFactor === 10} onclick={() => setScale(10)}> 1:10 Scale </button>
    </div>

    <div class="lane-headers">
      {#each lanes as lane}
        <div class="lane-info">
          <div class="lane-content">
            <div class="chain-name" style:color={lane.chain.color}>{lane.chain.name}</div>
            <div class="chain-tps">{lane.chain.tps.toLocaleString()} TPS</div>
          </div>
          <div class="tx-counter" style:color={lane.chain.color}>
            {Math.floor(lane.totalTx).toLocaleString()}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .container {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
  }

  #ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    display: flex;
    justify-content: space-between;
  }

  header {
    position: absolute;
    top: 20px;
    left: 30px;
    pointer-events: auto;
  }

  h1 {
    font-size: 1.2rem;
    font-weight: 400;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  .subtitle {
    font-size: 0.8rem;
    opacity: 0.5;
    max-width: 450px;
    line-height: 1.4;
  }

  .lane-headers {
    display: flex;
    width: 100%;
    height: 100%;
    padding-top: 100px;
  }

  .lane-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid var(--lane-border);
    position: relative;
  }

  .lane-info:last-child {
    border-right: none;
  }

  .lane-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .chain-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 5px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  }

  .chain-tps {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-bottom: 15px;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .tx-counter {
    font-size: 2.5rem;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    margin-top: auto;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  #canvas-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  canvas {
    display: block;
  }

  .controls {
    position: absolute;
    top: 20px;
    right: 30px;
    pointer-events: auto;
    display: flex;
    gap: 10px;
  }

  button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 16px;
    cursor: pointer;
    font-family: var(--font-main);
    font-size: 0.8rem;
    transition: all 0.2s;
    text-transform: uppercase;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }

  button.active {
    background: white;
    color: black;
  }

  @media (max-width: 768px) {
    .lane-headers {
      flex-direction: column;
      padding-top: 80px;
    }

    .lane-info {
      flex-direction: row;
      justify-content: space-between;
      padding: 0 20px;
      border-right: none;
      border-bottom: 1px solid var(--lane-border);
    }

    .tx-counter {
      margin: 0;
      font-size: 1.2rem;
    }

    .chain-name {
      font-size: 1rem;
    }

    .chain-tps {
      font-size: 0.7rem;
      margin-bottom: 0;
      margin-left: 10px;
    }

    header {
      left: 20px;
      top: 15px;
    }

    .controls {
      display: none;
    }
  }
</style>
