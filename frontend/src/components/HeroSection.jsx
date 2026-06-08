import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";

const themes = [
  {
    bg: "#CC3D3D",
    text: "#FAF8F3",
    pieces: [
      {
        // 1. Queen — Upper accent, top-right, floating high
        src: "/chess-08.png",
        top: "50%",
        right: "70%",
        size: 170,        // Was 150 → now 170
        depth: 2,
        rotate: 10,
        duration: 7,
        zIndex: 50,
      },
      {
        // 2. King — Dominant centerpiece, large and tilted
        src: "/chess-04.png",
        top: "25%",
        right: "30%",
        size: 140,        // Was 120 → now 140
        depth: 1.3,
        rotate: -30,
        duration: 6,
        zIndex: 30,
      },
      {
        // 3. Knight — Foreground lower-right
        src: "/chess-07.png",
        top: "65%",
        right: "45%",
        size: 120,        // Was 280 → now 320
        depth: 1.7,
        rotate: -12,
        duration: 8,
        zIndex: 40,
      },
    ],
  },
  {
    bg: "#D4D0C8",
    text: "#1A1A1A",
    pieces: [
      {
        src: "/chess-01.png",
        top: "50%",
        right: "70%",
        size: 170,
        depth: 2,
        rotate: 35,
        duration: 7,
        zIndex: 50,
      },
      {
        src: "/chess-07.png",
        top: "40%",
        right: "25%",
        size: 140,
        depth: 1.3,
        rotate: -22,
        duration: 6,
        zIndex: 30,
      },
      {
        src: "/chess-02.png",   // Symbol badge — kept small intentionally
        top: "25%",
        right: "70%",
        size: 150,
        depth: 1.7,
        rotate: 15,
        duration: 8,
        zIndex: 40,
      },
      {
        src: "/chess-06.png",   // Broken crown — kept small as accent
        top: "75%",
        right: "45%",
        size: 180,
        depth: 2,
        rotate: 35,
        duration: 7,
        zIndex: 50,
      },
    ],
  },
  {
    bg: "#1A1A1A",
    text: "#FAF8F3",
    pieces: [
      {
        src: "/chess-05.png",
        top: "20%",
        right: "18%",
        size: 540,
        depth: 1.3,
        rotate: -22,
        duration: 6,
        zIndex: 30,
      },
      {
        src: "/chess-03.png",   // Brilliant sign — small badge
        top: "68%",
        right: "80%",
        size: 150,
        depth: 1.7,
        rotate: -15,
        duration: 8,
        zIndex: 40,
      },
    ],
  },
];

function FloatingObject({
  src,
  top,
  right,
  size,
  depth,
  rotate,
  duration,
  zIndex,
  mouseX,
  mouseY,
}) {
  const xOffset = useTransform(
    mouseX,
    [-0.5, 0.5],
    [-40 * depth, 40 * depth]
  );

  const yOffset = useTransform(
    mouseY,
    [-0.5, 0.5],
    [-40 * depth, 40 * depth]
  );

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top,
        right,
        x: xOffset,
        y: yOffset,
        zIndex: zIndex || 10,
      }}
    >
      <motion.img
        src={src}
        alt=""
        className="max-w-none"
        style={{
          width: size,
          filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.4))",
        }}
        initial={{ rotate }}
        animate={{
          y: [0, -15, 0],
          rotate: [rotate, rotate + 2, rotate],
        }}
        transition={{
          duration: duration || 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

export default function HeroSection() {
  const [currentTheme, setCurrentTheme] = useState(0);

  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, {
    stiffness: 50,
    damping: 20,
  });

  const smoothMouseY = useSpring(mouseY, {
    stiffness: 50,
    damping: 20,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % themes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const theme = themes[currentTheme];

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      animate={{ backgroundColor: theme.bg, color: theme.text }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="relative min-h-screen overflow-hidden"
    >
      <div className="mx-auto max-w-7xl min-h-screen flex items-center px-6 md:px-8 lg:px-12 relative z-20 pt-24">
        <div className="w-full md:max-w-[55%] lg:max-w-[50%]">

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
            Play.
            <br />
            Learn.
            <br />
            Dominate.
          </h1>

          <p className="mt-6 text-base md:text-xl opacity-80 leading-relaxed max-w-xl">
            Play chess against real opponents,
            improve your strategy, and become unstoppable.
          </p>

          <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl border border-current font-semibold hover:scale-105 transition text-sm md:text-base"
            >
              Start Playing
            </Link>

            <Link
              to="/learn"
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl border border-current font-semibold hover:scale-105 transition text-sm md:text-base"
            >
              Learn Chess
            </Link>
          </div>
        </div>
      </div>

      {/* Floating pieces — visible md+ */}
      <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 z-10 overflow-visible pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full relative"
          >
            {theme.pieces.map((piece, index) => (
              <FloatingObject
                key={`${currentTheme}-${index}`}
                {...piece}
                mouseX={smoothMouseX}
                mouseY={smoothMouseY}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}