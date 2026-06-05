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
    bg: "#FAF8F3",
    text: "#1A1A1A",
    pieces: [
      {
        src: "/assets/hero/king.svg",
        top: "12%",
        right: "20%",
        size: 240,
        depth: 1,
      },
      {
        src: "/assets/hero/queen.svg",
        top: "42%",
        right: "5%",
        size: 280,
        depth: 1.5,
      },
      {
        src: "/assets/hero/knight.svg",
        top: "65%",
        right: "30%",
        size: 180,
        depth: 2,
      },
    ],
  },

  {
    bg: "#D4D0C8",
    text: "#1A1A1A",
    pieces: [
      {
        src: "/assets/hero/trophy.svg",
        top: "18%",
        right: "15%",
        size: 220,
        depth: 1,
      },
      {
        src: "/assets/hero/clock.svg",
        top: "50%",
        right: "20%",
        size: 260,
        depth: 1.5,
      },
    ],
  },

  {
    bg: "#CC3D3D",
    text: "#FAF8F3",
    pieces: [
      {
        src: "/assets/hero/king.svg",
        top: "10%",
        right: "18%",
        size: 220,
        depth: 1,
      },
      {
        src: "/assets/hero/trophy.svg",
        top: "42%",
        right: "3%",
        size: 260,
        depth: 1.5,
      },
      {
        src: "/assets/hero/queen.svg",
        top: "70%",
        right: "28%",
        size: 180,
        depth: 2,
      },
    ],
  },

  {
    bg: "#1A1A1A",
    text: "#FAF8F3",
    pieces: [
      {
        src: "/assets/hero/knight.svg",
        top: "12%",
        right: "20%",
        size: 260,
        depth: 1,
      },
      {
        src: "/assets/hero/clock.svg",
        top: "48%",
        right: "8%",
        size: 220,
        depth: 1.5,
      },
      {
        src: "/assets/hero/king.svg",
        top: "72%",
        right: "28%",
        size: 180,
        depth: 2,
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
      }}
    >
      <motion.img
        src={src}
        alt=""
        className="drop-shadow-2xl"
        style={{
          width: size,
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 8 + depth * 2,
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
      animate={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
      transition={{
        duration: 1.2,
        ease: "easeInOut",
      }}
      className="relative h-screen overflow-hidden"
    >
      {/* giant background knight */}
      <motion.img
        src="/assets/hero/knight.svg"
        alt=""
        className="absolute right-[-200px] top-1/2 w-[800px] opacity-[0.05] blur-[2px]"
        animate={{
          rotate: [0, 6, 0, -6, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* content */}
      <div className="mx-auto max-w-7xl h-full flex items-center px-8 relative z-20">
        <div className="max-w-2xl">

          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Play.
            <br />
            Learn.
            <br />
            Dominate.
          </h1>

          <p className="mt-6 text-xl opacity-80 leading-relaxed max-w-xl">
            Play chess against real opponents,
            improve your strategy, and become unstoppable.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-xl bg-[#CC3D3D] text-white font-semibold hover:scale-105 transition"
            >
              Start Playing
            </Link>

            <Link
              to="/learn"
              className="px-8 py-4 rounded-xl border border-current font-semibold hover:scale-105 transition"
            >
              Learn Chess
            </Link>
          </div>

          <div className="mt-14 flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xl">
                  ★
                </span>
              ))}
            </div>

            <span className="opacity-70">
              Trusted by thousands of chess players
            </span>
          </div>
        </div>
      </div>

      {/* floating pieces */}
      <div className="hidden md:block absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
            }}
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