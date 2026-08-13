import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import { Zap, Shield, Mic, Globe, Trophy, Clock, Users, ChevronDown } from "lucide-react";

/* ─────────────────────────────── Hero Themes ─────────────────────────────── */
const themes = [
  {
    bg: "#CC3D3D",
    text: "#FAF8F3",
    pieces: [
      { src: "/chess-08.png", top: "50%", right: "70%", size: 170, depth: 2, rotate: 10, duration: 7, zIndex: 50 },
      { src: "/chess-04.png", top: "25%", right: "30%", size: 140, depth: 1.3, rotate: -30, duration: 6, zIndex: 30 },
      { src: "/chess-07.png", top: "65%", right: "45%", size: 120, depth: 1.7, rotate: -12, duration: 8, zIndex: 40 },
    ],
  },
  {
    bg: "#D4D0C8",
    text: "#1A1A1A",
    pieces: [
      { src: "/chess-01.png", top: "50%", right: "70%", size: 170, depth: 2, rotate: 35, duration: 7, zIndex: 50 },
      { src: "/chess-07.png", top: "40%", right: "25%", size: 140, depth: 1.3, rotate: -22, duration: 6, zIndex: 30 },
      { src: "/chess-02.png", top: "25%", right: "70%", size: 150, depth: 1.7, rotate: 15, duration: 8, zIndex: 40 },
      { src: "/chess-06.png", top: "75%", right: "45%", size: 180, depth: 2, rotate: 35, duration: 7, zIndex: 50 },
    ],
  },
  {
    bg: "#1A1A1A",
    text: "#FAF8F3",
    pieces: [
      { src: "/chess-05.png", top: "20%", right: "18%", size: 540, depth: 1.3, rotate: -22, duration: 6, zIndex: 30 },
      { src: "/chess-03.png", top: "68%", right: "80%", size: 150, depth: 1.7, rotate: -15, duration: 8, zIndex: 40 },
    ],
  },
];

function FloatingObject({ src, top, right, size, depth, rotate, duration, zIndex, mouseX, mouseY }) {
  const xOffset = useTransform(mouseX, [-0.5, 0.5], [-40 * depth, 40 * depth]);
  const yOffset = useTransform(mouseY, [-0.5, 0.5], [-40 * depth, 40 * depth]);
  return (
    <motion.div className="absolute pointer-events-none" style={{ top, right, x: xOffset, y: yOffset, zIndex: zIndex || 10 }}>
      <motion.img
        src={src}
        alt=""
        className="max-w-none"
        style={{ width: size, filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.4))" }}
        initial={{ rotate }}
        animate={{ y: [0, -15, 0], rotate: [rotate, rotate + 2, rotate] }}
        transition={{ duration: duration || 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}


/* ─────────────────────────────── Features ─────────────────────────────── */
const FEATURES = [
  {
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    title: "Instant Matchmaking",
    desc: "Get paired with a real opponent in seconds. Zero waiting, pure chess.",
  },
  {
    icon: Mic,
    color: "from-violet-500 to-purple-600",
    title: "Voice Commands",
    desc: "Say 'Knight to f3' or 'Castle Kingside' — your board responds instantly.",
  },
  {
    icon: Shield,
    color: "from-emerald-400 to-teal-600",
    title: "Validated Moves",
    desc: "Every move is verified by chess.js. No illegal moves, ever. Fair play guaranteed.",
  },
  {
    icon: Globe,
    color: "from-sky-400 to-blue-600",
    title: "Real-Time Sync",
    desc: "Moves sync instantly to both players via WebSockets. No refresh needed.",
  },
  {
    icon: Trophy,
    color: "from-rose-400 to-pink-600",
    title: "Rated Games",
    desc: "Win games, climb ratings. Your progress is tracked with every match.",
  },
  {
    icon: Clock,
    color: "from-lime-400 to-green-600",
    title: "Time Controls",
    desc: "Choose your pace — Bullet, Blitz, or Rapid. Built-in countdown timers.",
  },
];

/* ─────────────────────────────── How to Play ─────────────────────────────── */
const HOW_TO_STEPS = [
  { step: "01", title: "Create Account", desc: "Sign up for free in under 30 seconds. No credit card required." },
  { step: "02", title: "Find a Match", desc: "Click Find Match and get paired with a real opponent instantly." },
  { step: "03", title: "Play Chess", desc: "Drag pieces, click squares, or use Voice Move to speak your moves." },
  { step: "04", title: "Level Up", desc: "Win games, gain rating points, and climb the leaderboard." },
];


/* ─────────────────────────────── Component ─────────────────────────────── */
export default function Landing() {
  const [currentTheme, setCurrentTheme] = useState(0);
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

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
    <div className="font-sans overflow-x-hidden">

      {/* ──────────────── HERO SECTION ──────────────── */}
      <motion.section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        animate={{ backgroundColor: theme.bg, color: theme.text }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="relative min-h-screen overflow-hidden"
      >
        <SiteHeader />
        <div className="mx-auto max-w-7xl min-h-screen flex items-center px-6 md:px-8 lg:px-12 relative z-20 pt-24">
          <div className="w-full md:max-w-[55%] lg:max-w-[50%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                Play.<br />Learn.<br />Dominate.
              </h1>
              <p className="mt-6 text-base md:text-xl opacity-80 leading-relaxed max-w-xl">
                Real-time multiplayer chess with voice commands, instant matchmaking, and rated games. Your next opponent is waiting.
              </p>
              <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 rounded-xl border border-current font-semibold hover:scale-105 transition text-sm md:text-base opacity-80"
                >
                  Start Playing Free →
                </Link>
                <Link
                  to="/learn"
                  className="px-8 py-4 rounded-xl border border-current font-semibold hover:scale-105 transition text-sm md:text-base opacity-80"
                >
                  Learn Chess
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating pieces */}
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

        {/* Scroll arrow */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-60"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </motion.section>


      {/* ──────────────── FEATURES GRID ──────────────── */}
      <section className="bg-[#FAF8F3] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">What Makes Us Different</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-ink leading-tight">
              Built for serious players.
            </h2>
            <p className="mt-4 text-ink/60 max-w-xl mx-auto text-base">
              Every feature is carefully crafted for a seamless, competitive chess experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative bg-white border border-accent/30 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{desc}</p>
                <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── VOICE MOVE HIGHLIGHT ──────────────── */}
      <section className="relative bg-[#1A1A1A] py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-amber-900/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
              <Mic size={12} /> New Feature
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              Move with<br />
              <span className="text-violet-400">your voice.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-6 max-w-md">
              The world's first chess platform with built-in voice move recognition. No extensions. No paid APIs. Pure browser magic.
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              {['"Pawn to e4"', '"Knight takes e5"', '"Castle Kingside"', '"Promote to Queen"'].map((cmd) => (
                <li key={cmd} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <code className="font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-violet-200">{cmd}</code>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 w-full max-w-sm"
          >
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 text-center shadow-2xl shadow-violet-900/20">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30"
              >
                <Mic size={34} className="text-white" />
              </motion.div>
              <div className="text-white/40 text-xs uppercase tracking-widest mb-3">You said:</div>
              <div className="text-white font-mono text-lg font-bold mb-5">"Knight to f3"</div>
              <div className="h-px bg-white/10 mb-5" />
              <div className="text-white/40 text-xs uppercase tracking-widest mb-3">Move played:</div>
              <div className="text-violet-300 font-mono text-lg font-bold">g1 → f3</div>
              <div className="mt-5 flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Move confirmed ✓
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────── HOW TO PLAY ──────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">Get Started Fast</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-ink">From zero to playing in 60 seconds.</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_TO_STEPS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                {i < HOW_TO_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%+0.75rem)] w-full h-px border-t-2 border-dashed border-accent/30 z-0" />
                )}
                <div className="relative z-10 bg-[#FAF8F3] border border-accent/20 rounded-2xl p-6 h-full">
                  <div className="text-5xl font-black text-primary/10 mb-3 leading-none">{step}</div>
                  <h3 className="text-base font-bold text-ink mb-2">{title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── CTA SECTION ──────────────── */}
      <section className="relative bg-primary py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#fff_0%,_transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <div className="text-6xl mb-4">♟️</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-cream mb-4">
            Your opponent is waiting.
          </h2>
          <p className="text-cream/80 text-lg mb-8 max-w-md mx-auto">
            Join thousands of players competing right now. Free, fast, and fun.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-xl bg-cream text-primary font-bold text-base hover:scale-105 transition shadow-lg shadow-black/20"
            >
              Create Free Account →
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border-2 border-cream/50 text-cream font-semibold text-base hover:border-cream hover:scale-105 transition"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
