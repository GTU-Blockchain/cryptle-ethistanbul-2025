import { useEffect } from "react";

export default function Confetti() {
  useEffect(() => {
    import("canvas-confetti").then((confetti) => {
      confetti.default({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
      });
    });
  }, []);
  return null;
}
