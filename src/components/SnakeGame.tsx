import { useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = 400;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use refs for game state to access inside requestAnimationFrame without dependency issues
  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 0, y: -1 },
    nextDirection: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false,
    isStarted: false,
    lastMoveTime: 0,
    particles: [] as Particle[],
    shakeTime: 0
  });

  const generateFood = (currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      state.current.particles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: Math.random() * 20 + 10,
        color
      });
    }
  };

  const resetGame = () => {
    state.current = {
      ...state.current,
      snake: [{ x: 10, y: 10 }],
      direction: { x: 0, y: -1 },
      nextDirection: { x: 0, y: -1 },
      food: generateFood([{ x: 10, y: 10 }]),
      score: 0,
      gameOver: false,
      isStarted: true,
      lastMoveTime: performance.now(),
      particles: [],
      shakeTime: 0
    };
    onScoreChange(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const { isStarted, gameOver, direction } = state.current;

      if (!isStarted && e.key === ' ') {
        resetGame();
        return;
      }

      if (gameOver && e.key === ' ') {
        resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) state.current.nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) state.current.nextDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) state.current.nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) state.current.nextDirection = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (time: number) => {
      const s = state.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) return;

      // Handle logic updates
      if (s.isStarted && !s.gameOver) {
        const speed = Math.max(40, 120 - Math.floor(s.score / 50) * 10);
        
        if (time - s.lastMoveTime > speed) {
          s.direction = s.nextDirection;
          const head = s.snake[0];
          const newHead = {
            x: head.x + s.direction.x,
            y: head.y + s.direction.y,
          };

          // Wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            s.gameOver = true;
            s.shakeTime = 20;
            createParticles(head.x, head.y, '#0ff');
          } 
          // Self collision
          else if (s.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            s.gameOver = true;
            s.shakeTime = 20;
            createParticles(head.x, head.y, '#0ff');
          } 
          else {
            const newSnake = [newHead, ...s.snake];

            // Food collision
            if (newHead.x === s.food.x && newHead.y === s.food.y) {
              s.score += 10;
              onScoreChange(s.score);
              s.food = generateFood(newSnake);
              s.shakeTime = 5;
              createParticles(newHead.x, newHead.y, '#f0f');
            } else {
              newSnake.pop();
            }
            s.snake = newSnake;
          }
          s.lastMoveTime = time;
        }
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) s.particles.splice(i, 1);
      }

      // Render
      ctx.save();
      
      // Screen shake
      if (s.shakeTime > 0) {
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        ctx.translate(dx, dy);
        s.shakeTime--;
      }

      // Clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw Grid
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#f0f';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f0f';
      ctx.fillRect(s.food.x * CELL_SIZE + 2, s.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

      // Draw Snake
      s.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#fff' : '#0ff';
        ctx.shadowBlur = index === 0 ? 20 : 10;
        ctx.shadowColor = '#0ff';
        ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });

      // Draw Particles
      ctx.shadowBlur = 0;
      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - (p.life / p.maxLife);
        ctx.fillRect(p.x, p.y, 4, 4);
      });
      ctx.globalAlpha = 1;

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onScoreChange]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-[400px]">
      <div className="relative border-4 border-[#0ff] bg-black p-1 w-full aspect-square">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full bg-black block"
        />
        
        {(!state.current.isStarted || state.current.gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center border-2 border-[#f0f] p-6 bg-black">
              <h2 className="text-5xl font-bold mb-4 glitch-text text-[#f0f]">
                {state.current.gameOver ? 'FATAL_ERR' : 'INIT_SEQ'}
              </h2>
              {state.current.gameOver && (
                <p className="text-[#0ff] mb-6 text-3xl">DATA_LOST: {state.current.score}</p>
              )}
              <p className="text-[#0ff] text-2xl animate-pulse">
                &gt; PRESS [SPACE] TO EXECUTE
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="w-full mt-4 text-[#f0f] text-xl flex justify-between">
        <span>&gt; INPUT: W_A_S_D</span>
        <span>&gt; OBJ: ASSIMILATE</span>
      </div>
    </div>
  );
}
