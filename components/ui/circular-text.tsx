"use client";
import { useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: "speedUp" | "slowDown" | "pause" | "goBonkers" | null;
  className?: string;
}

const CircularText = ({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
}: CircularTextProps) => {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: {
        duration: spinDuration,
        ease: "linear",
        repeat: Infinity,
      },
    });
  }, [spinDuration, text, onHover, controls, rotation]);

  const handleHoverStart = () => {
    const start = rotation.get();
    if (!onHover) return;

    let duration = spinDuration;
    let scaleVal = 1;

    switch (onHover) {
      case "slowDown":
        duration = spinDuration * 2;
        break;
      case "speedUp":
        duration = spinDuration / 4;
        break;
      case "pause":
        duration = 0;
        break;
      case "goBonkers":
        duration = spinDuration / 20;
        scaleVal = 0.8;
        break;
      default:
        duration = spinDuration;
    }

    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: {
        duration,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  const handleHoverEnd = () => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: {
        duration: spinDuration,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  return (
    <motion.div
      className={`m-0 mx-auto rounded-full w-[200px] h-[200px] relative text-[#201e36] font-montserrat font-bold text-center cursor-pointer origin-center ${className}`}
      style={{ rotate: rotation }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const factor = Math.PI / letters.length;
        const x = factor * i;
        const y = factor * i;
        const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

        return (
          <span
            key={i}
            className="absolute inline-block inset-0 text-2xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
            style={{ transform, WebkitTransform: transform }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
};

export default CircularText;
