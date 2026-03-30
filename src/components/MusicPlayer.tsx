import { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, title: 'ERR_01: NEON_DREAMS', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'ERR_02: CYBER_PULSE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'ERR_03: DIGI_HORIZON', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) setProgress((current / duration) * 100);
    }
  };

  // Generate ASCII progress bar
  const totalBlocks = 20;
  const filledBlocks = Math.floor((progress / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const asciiProgress = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-[#0ff] font-digital text-2xl">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      <div className="mb-8 border-l-4 border-[#f0f] pl-4">
        <p className="text-[#f0f] mb-2">&gt;&gt; CURRENT_STREAM:</p>
        <h3 className="text-4xl glitch-text truncate">{currentTrack.title}</h3>
      </div>

      <div className="mb-8">
        <p className="text-[#f0f] mb-2">&gt;&gt; BUFFER_STATUS:</p>
        <div className="text-3xl tracking-widest text-[#0ff] break-all">
          [{asciiProgress}] {Math.floor(progress)}%
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-4">
        <button 
          onClick={prevTrack}
          className="border-2 border-[#0ff] py-2 hover:bg-[#0ff] hover:text-black transition-colors active:bg-[#f0f] active:border-[#f0f]"
        >
          [ &lt;&lt; PRV ]
        </button>
        
        <button 
          onClick={togglePlay}
          className="border-2 border-[#f0f] py-2 text-[#f0f] hover:bg-[#f0f] hover:text-black transition-colors glitch-text"
        >
          {isPlaying ? '[ || PAUSE ]' : '[ &gt; PLAY ]'}
        </button>

        <button 
          onClick={nextTrack}
          className="border-2 border-[#0ff] py-2 hover:bg-[#0ff] hover:text-black transition-colors active:bg-[#f0f] active:border-[#f0f]"
        >
          [ NXT &gt;&gt; ]
        </button>
      </div>
      
      <div className="mt-6 text-sm text-[#f0f] opacity-50">
        WARN: UNAUTHORIZED AUDIO INTERCEPT DETECTED.
      </div>
    </div>
  );
}
