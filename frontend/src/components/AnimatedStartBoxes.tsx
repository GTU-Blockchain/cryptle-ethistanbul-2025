import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface AnimatedStartBoxesProps {
  show: boolean;
  onAnimationComplete: () => void;
}

const letters = ["S", "T", "A", "R", "T"];

export const AnimatedStartBoxes: React.FC<AnimatedStartBoxesProps> = ({ show, onAnimationComplete }) => {
  return (
    <div className="flex justify-center gap-3 mt-8 min-h-[64px]">
      {letters.map((letter, i) => (
        <div key={i} className="w-16 h-16 bg-slate-900/80 border-2 border-cyan-500/30 rounded-xl flex items-center justify-center text-2xl font-bold text-cyan-300 shadow-lg overflow-hidden">
          <AnimatePresence>
            {show && (
              <motion.span
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5, type: "spring" }}
                onAnimationComplete={i === letters.length - 1 ? onAnimationComplete : undefined}
                className="block"
              >
                {letter}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
