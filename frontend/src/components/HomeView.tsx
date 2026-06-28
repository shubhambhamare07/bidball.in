"use client";

import React from "react";
import { ArrowRight, Trophy, Users, Zap, Play, Settings, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { audio } from "../utils/audio";

interface HomeViewProps {
  onCreateRoomClick: () => void;
  onJoinRoomClick: () => void;
}

export default function HomeView({ onCreateRoomClick, onJoinRoomClick }: HomeViewProps) {
  const triggerClick = (cb: () => void) => {
    audio.playClick();
    cb();
  };

  return (
    <div className="w-full min-h-[90vh] flex flex-col items-center justify-center py-16 px-4 md:px-8 relative overflow-hidden pitch-grid bg-[#090C0F]">
      
      {/* Stadium Spotlight Beams */}
      <div className="stadium-spotlight-left" />
      <div className="stadium-spotlight-right" />

      {/* Cinematic Stadium atmosphere overlays */}
      <div className="stadium-lens-flare" />
      <div className="stadium-fog-layer" />
      
      {/* Cinematic Flying Football with Motion Blur */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute animate-football-fly w-full h-full">
          <span className="absolute text-5xl select-none" style={{ left: 0, top: 0 }}>⚽</span>
        </div>
      </div>

      {/* Floating Animated World Cup Flags (3D Wavy Images) */}
      <img src="https://flagcdn.com/w160/ar.png" alt="Argentina" className="absolute top-20 left-[8%] animate-float-slow w-20 h-12 wavy-flag-3d opacity-20 select-none pointer-events-none filter blur-[1px]" />
      <img src="https://flagcdn.com/w160/br.png" alt="Brazil" className="absolute top-44 right-[10%] animate-float-reverse w-24 h-14 wavy-flag-3d opacity-25 select-none pointer-events-none filter blur-[0.5px]" />
      <img src="https://flagcdn.com/w160/fr.png" alt="France" className="absolute bottom-36 left-[6%] animate-float-reverse w-20 h-12 wavy-flag-3d opacity-20 select-none pointer-events-none filter blur-[1.5px]" />
      <img src="https://flagcdn.com/w160/es.png" alt="Spain" className="absolute bottom-48 right-[12%] animate-float-slow w-24 h-14 wavy-flag-3d opacity-20 select-none pointer-events-none filter blur-[1px]" />
      <img src="https://flagcdn.com/w160/pt.png" alt="Portugal" className="absolute top-28 right-[25%] animate-float-slow w-18 h-11 wavy-flag-3d opacity-15 select-none pointer-events-none filter blur-[2px]" />
      <img src="https://flagcdn.com/w160/it.png" alt="Italy" className="absolute bottom-20 left-[26%] animate-float-slow w-18 h-11 wavy-flag-3d opacity-15 select-none pointer-events-none filter blur-[2px]" />
      <img src="https://flagcdn.com/w160/de.png" alt="Germany" className="absolute top-64 left-[18%] animate-float-reverse w-16 h-10 wavy-flag-3d opacity-12 select-none pointer-events-none filter blur-[2.5px]" />
      <img src="https://flagcdn.com/w160/nl.png" alt="Netherlands" className="absolute bottom-60 right-[22%] animate-float-slow w-16 h-10 wavy-flag-3d opacity-12 select-none pointer-events-none filter blur-[2.5px]" />

      {/* Animated Football Light Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#00E676]/25 rounded-full animate-particle"
            style={{
              left: `${(i * 5.7 + 13) % 100}%`,
              bottom: `-${(i * 12) % 25}%`,
              animationDelay: `${(i * 0.35) % 5}s`,
              animationDuration: `${5 + (i % 4)}s`
            }}
          />
        ))}
      </div>

      {/* Glow Ambient behind Hero */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#00E676]/10 to-[#FFD700]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section Container */}
      <div className="max-w-5xl text-center z-10 flex flex-col items-center mb-20 px-4">
        {/* Title tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-white/70 uppercase tracking-widest mb-6 flex items-center gap-2 backdrop-blur-md shadow-lg"
        >
          <Trophy className="w-3.5 h-3.5 text-[#FFD700] animate-bounce" /> World Cup 2026 Edition
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-white mb-6 uppercase leading-[0.9] select-none"
        >
          Build Your Dream Team.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00E676] to-[#FFD700] drop-shadow-[0_0_30px_rgba(0,230,118,0.2)]">
            Win The Auction.
          </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl leading-relaxed mb-12 font-medium"
        >
          The ultimate real-time multiplayer draft auction experience. Scout world-class 
          footballers, manage your tactical budget, and outbid your rival managers in sub-second bidding wars.
        </motion.p>

        {/* Hero Actions (CTA Buttons) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-5 w-full justify-center max-w-lg"
        >
          {/* Create button */}
          <button
            onClick={() => triggerClick(onCreateRoomClick)}
            className="w-full sm:w-auto px-10 py-5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(0,230,118,0.35)] hover:shadow-[0_12px_35px_rgba(0,230,118,0.5)] transition-all duration-300 scale-100 hover:scale-[1.04] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group"
          >
            {/* Button Shine sweep */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -left-1/2 group-hover:animate-[shine-sweep_1s_ease-out]" />
            <Play className="w-5 h-5 fill-current" /> Host Tournament
          </button>

          {/* Join button */}
          <button
            onClick={() => triggerClick(onJoinRoomClick)}
            className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-wider rounded-xl hover:border-white/25 transition-all duration-300 scale-100 hover:scale-[1.04] active:scale-95 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <Users className="w-5 h-5" /> Join Lobby
          </button>
        </motion.div>
        
        {/* Scroll link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <a
            href="#how-to-play"
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest cursor-pointer"
            onClick={() => audio.playClick()}
          >
            How To Play Rules <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-6xl z-10 px-4 mt-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-[2px] w-8 bg-[#00E676]" />
          <h2 className="text-sm font-black text-[#00E676] uppercase tracking-widest">
            Game Features
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-5 border border-white/5 relative overflow-hidden group hover:border-[#00E676]/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00E676]/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-xl bg-[#00E676]/10 flex items-center justify-center text-[#00E676] shadow-inner border border-[#00E676]/10">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-wide mb-2">Real-time Bidding</h3>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Experience sub-second bidding updates synced via WebSockets. Counter-bid in real-time as the timer ticks down to secure S-tier stars.
              </p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-5 border border-white/5 relative overflow-hidden group hover:border-[#FFD700]/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FFD700]/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shadow-inner border border-[#FFD700]/10">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-wide mb-2">Dynamic Chemistry</h3>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Draft players strategically. Assemble matching nations or tactical lines to generate Chemistry boosts, multiplying your fantasy total.
              </p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-5 border border-white/5 relative overflow-hidden group hover:border-[#2979FF]/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#2979FF]/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-xl bg-[#2979FF]/10 flex items-center justify-center text-[#2979FF] shadow-inner border border-[#2979FF]/10">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-wide mb-2">Tactical Boost Center</h3>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Use your remaining budget to buy tactical boost cards (e.g. Captain, Playmaker, SuperSub) to give selected players custom OVR boosts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned How to Play Card */}
      <div 
        id="how-to-play" 
        className="w-full max-w-6xl mt-24 z-10 glass-card p-8 sm:p-10 rounded-2xl border border-white/5 bg-[#10141A]/50 relative overflow-hidden"
      >
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-[#00E676]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
        
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-8 flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#00E676]" /> How The Auction Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-white/60">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#00E676]/10 text-[#00E676] flex items-center justify-center font-black flex-shrink-0 border border-[#00E676]/15">1</div>
            <div>
              <h4 className="font-extrabold text-white uppercase tracking-wide mb-2">1. Setup & Budget</h4>
              <p className="leading-relaxed">Host a lobby, adjust options, and share the code. Each manager starts with an equal starting budget (up to €2 Billion).</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#00E676]/10 text-[#00E676] flex items-center justify-center font-black flex-shrink-0 border border-[#00E676]/15">2</div>
            <div>
              <h4 className="font-extrabold text-white uppercase tracking-wide mb-2">2. Live Bidding Wars</h4>
              <p className="leading-relaxed">Players are drawn one-by-one. Place increments or custom bids. The highest bidder secures the player when the timer hits zero.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#00E676]/10 text-[#00E676] flex items-center justify-center font-black flex-shrink-0 border border-[#00E676]/15">3</div>
            <div>
              <h4 className="font-extrabold text-white uppercase tracking-wide mb-2">3. Trades, Boosts & Glory</h4>
              <p className="leading-relaxed">After the draft, negotiate direct trades, purchase boosts to multiply ratings, and climb the final fantasy rating standings to win the cup!</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
