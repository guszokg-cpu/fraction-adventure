"use client";

import { useEffect, useState } from "react";

const COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#22d3ee"];

type Piece = {
  id: number;
  left: number;   // % offset from center
  x: number;      // px horizontal drift
  y: number;      // px vertical fall
  r: number;      // deg rotation
  color: string;
  delay: number;  // ms
};

/**
 * แสดงกระดาษเศษฉลองหนึ่งชุดทุกครั้งที่ค่า `trigger` เปลี่ยน (มากกว่า 0)
 * ใช้ CSS ล้วน ไม่พึ่ง library ภายนอก
 */
export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const next: Piece[] = Array.from({ length: 40 }, (_, i) => {
      const angle = (Math.random() - 0.5) * Math.PI; // -90°..90°
      const dist = 90 + Math.random() * 140;
      return {
        id: trigger * 100 + i,
        left: 50 + (Math.random() - 0.5) * 30,
        x: Math.sin(angle) * dist,
        y: 60 + Math.cos(angle) * dist + Math.random() * 80,
        r: (Math.random() - 0.5) * 720,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 120,
      };
    });
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1300);
    return () => clearTimeout(t);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="fa-confetti-piece"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              animationDelay: `${p.delay}ms`,
              "--fa-x": `${p.x}px`,
              "--fa-y": `${p.y}px`,
              "--fa-r": `${p.r}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
