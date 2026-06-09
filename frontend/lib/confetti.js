"use client";
import confetti from 'canvas-confetti';

export function fireConfetti() {
  // Fire from both sides
  const defaults = {
    spread: 60,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#FF6B00', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#ffffff'],
  };

  confetti({ ...defaults, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...defaults, angle: 120, origin: { x: 1, y: 0.7 } });
}

export function fireBigConfetti() {
  // Full celebratory burst
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FF6B00', '#22C55E', '#ffffff'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#FF6B00', '#22C55E', '#ffffff'],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
}
