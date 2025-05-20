// src/components/ConfettiBurst.js
import React, { useEffect } from "react";
import confetti from "canvas-confetti";

const ConfettiBurst = () => {
  useEffect(() => {
    const duration = 10 * 1000;
    const animationEnd = Date.now() + duration;

    const defaults = {
      origin: { y: 0.6 },
      gravity: 0.9,
      spread: 120,
      startVelocity: 60,
      scalar: 1.1,
      zIndex: 1000,
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        ...defaults,
        particleCount: 100,
        angle: Math.random() * 60 + 60,
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default ConfettiBurst;
