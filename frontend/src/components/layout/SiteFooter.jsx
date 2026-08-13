import React from "react";
import { Link } from "react-router-dom";
import { Globe, Heart, Shield, Zap, Sparkles, Code, ExternalLink } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-[#121214] text-[#FAF8F3] border-t border-white/10 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-amber-500/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">

          {/* Brand & Status Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary text-cream flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                ♔
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Pixel<span className="text-primary">64</span>
              </span>
            </Link>

            <p className="text-xs text-white/60 leading-relaxed">
              Real-time multiplayer chess experience with voice controls, rated matchmaking, and instant sync.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/home" className="text-white/70 hover:text-white transition-colors">
                  Play Online
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-white/70 hover:text-white transition-colors">
                  Learn Chess
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-white/70 hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-white/70 hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Connect</h4>
            <p className="text-xs text-white/60">
              Open-source chess project built with passion. Connect & contribute.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/PrasenShinde/Chess"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-110"
                title="GitHub"
              >
                <Code size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-110"
                title="Portfolio"
              >
                <Globe size={16} />
              </a>
              <a
                href="https://prasenshinde.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-110"
                title="Contact"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar — Dev By Prasen Shinde */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-medium">
          <div>
            © {new Date().getFullYear()} Pixel64. All rights reserved.
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-amber-400/40 transition-colors group cursor-default">
            <span>Crafted with</span>
            <Heart size={13} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <span className="text-white font-bold tracking-wide group-hover:text-amber-400 transition-colors">
              Prasen S Shinde
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
