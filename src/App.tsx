import { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-black text-[#0ff] font-digital selection:bg-[#f0f] selection:text-black overflow-hidden relative flex flex-col uppercase">
      {/* CRT Overlays */}
      <div className="absolute inset-0 static-noise z-50"></div>
      <div className="absolute inset-0 scanlines z-40"></div>
      
      {/* Header */}
      <header className="w-full p-4 border-b-4 border-[#f0f] flex justify-between items-end z-10 bg-black screen-tear">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter glitch-text text-[#0ff] leading-none">
            SYS.OP.SYNTH_SNAKE
          </h1>
          <p className="text-[#f0f] text-lg md:text-2xl tracking-widest mt-2">
            STATUS: ONLINE // DIRECTIVE: CONSUME // AWAITING INPUT...
          </p>
        </div>
        
        <div className="px-4 py-1 border-4 border-[#0ff] bg-black">
          <span className="text-[#f0f] font-digital text-4xl md:text-6xl tracking-widest glitch-text">
            DATA:{score.toString().padStart(4, '0')}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-stretch justify-center gap-8 p-8 z-10">
        
        {/* Audio Module */}
        <div className="w-full lg:w-1/3 flex flex-col border-4 border-[#0ff] p-1 relative screen-tear bg-black" style={{animationDelay: '1.2s'}}>
          <div className="bg-[#f0f] text-black px-2 py-1 font-bold text-2xl mb-4 flex justify-between">
            <span>MODULE.AUDIO_STREAM</span>
            <span className="animate-pulse">REC</span>
          </div>
          <MusicPlayer />
        </div>

        {/* Game Module */}
        <div className="flex-1 flex flex-col border-4 border-[#f0f] p-1 relative screen-tear bg-black" style={{animationDelay: '2.5s'}}>
          <div className="bg-[#0ff] text-black px-2 py-1 font-bold text-2xl mb-4 flex justify-between">
            <span>MODULE.ORGANISM_CONTROL</span>
            <span>V 1.0.4</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden p-4">
            <SnakeGame onScoreChange={setScore} />
          </div>
        </div>

      </main>
    </div>
  );
}
