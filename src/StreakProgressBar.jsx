import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const MAX_STREAK = 17;

export default function StreakProgressBar({ streak, triggerCelebration, onResetStreak }) {
  const percentage = Math.min((streak / MAX_STREAK) * 100, 100);
  const isFull = streak === MAX_STREAK;

  useEffect(() => {
    if (isFull) {
      // 🎉 First burst
      confetti({
        particleCount: 500,
        startVelocity: 60,         // 🚀 shoot higher
        spread: 90,
        angle: 90,
        gravity: 0.5,
        origin: { y: 1.2 },        // 🎯 launch from below screen
      });
  
      // 🎉 Second burst after delay
      setTimeout(() => {
        confetti({
          particleCount: 500,
          startVelocity: 60,
          spread: 90,
          angle: 90,
          gravity: 0.5,
          origin: { y: 1.2 },
        });
      }, 500);
    }
  }, [isFull]);
  
  

  return (
    <div className="streak-wrapper">
      <div className="streak-bar-background">
        <motion.div
          className="streak-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4 }}
        />
        <div className="streak-bar-content">
          <span className="streak-text">17 Richtige Antworten</span>
          {isFull && (
            <button className="streak-reset-inline" onClick={onResetStreak}>
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
