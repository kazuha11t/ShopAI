// src/hooks/useCountdown.ts
// Chương 3: Custom Hook đếm ngược — tách logic setInterval khỏi UI

import { useState, useEffect, useCallback, useRef } from 'react';

export function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Functional update tránh Closure Trap (Chương 2.5)
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const reset = useCallback((seconds: number = initialSeconds) => {
    setTimeLeft(seconds);
  }, [initialSeconds]);

  const isFinished = timeLeft <= 0;

  const formatted = (() => {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  })();

  return { timeLeft, formatted, isFinished, reset };
}
