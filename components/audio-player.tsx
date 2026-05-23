'use client';
import { useRef, useState } from 'react';

export function AudioPlayer({ src, label }: { src: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} />
      <button
        onClick={toggle}
        style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#3b82f6', color: 'white', border: 'none',
          cursor: 'pointer', fontSize: '18px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <span style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '500' }}>{label}</span>
    </div>
  );
}
