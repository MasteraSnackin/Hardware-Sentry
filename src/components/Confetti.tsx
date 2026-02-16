'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

export function triggerConfetti() {
  window.dispatchEvent(new CustomEvent('triggerConfetti'));
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const handleTrigger = () => {
      const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];
      const newPieces: ConfettiPiece[] = [];

      // Create 30 confetti pieces
      for (let i = 0; i < 30; i++) {
        newPieces.push({
          id: Date.now() + i,
          x: Math.random() * window.innerWidth,
          y: -20,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        });
      }

      setPieces(newPieces);

      // Clear after animation
      setTimeout(() => {
        setPieces([]);
      }, 3000);
    };

    window.addEventListener('triggerConfetti', handleTrigger);
    return () => window.removeEventListener('triggerConfetti', handleTrigger);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              scale: piece.scale,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: piece.rotation + 360,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random(),
              ease: 'easeIn',
            }}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: piece.color,
              borderRadius: '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
