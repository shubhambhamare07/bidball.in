"use client";

import React, { useEffect, useState, useRef } from "react";
import { Download, Award, Flame, Tag, RefreshCw, Home, ChevronDown, ChevronUp, Sparkles, Coins, TrendingUp, Trophy, Share2, Send, Check } from "lucide-react";
import { audio } from "../utils/audio";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Room } from "../types";

interface LeaderboardEntry {
  name: string;
  score: number;
  budget: number;
  total_rating: number;
  captain: string | null;
  squad_size: number;
  boosts_used?: string[];
  best_purchase?: string;
  most_expensive?: string;
  highest_rated?: string;
}

interface FinalizedViewProps {
  leaderboard: LeaderboardEntry[];
  winnerName: string | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
  currentUsername: string;
  room: Room;
}

export default function FinalizedView({
  leaderboard,
  winnerName,
  onPlayAgain,
  onGoHome,
  currentUsername,
  room,
}: FinalizedViewProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Trigger victory sound and confetti upon loading
  useEffect(() => {
    audio.playVictory();
    audio.playCheer();
    
    // Auto-expand champion row by default
    if (leaderboard.length > 0) {
      setExpandedRow(leaderboard[0].name);
    }
    
    // Trigger confetti explosions
    const duration = 6 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ["#00E676", "#FFD700", "#ffffff", "#2979FF"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ["#00E676", "#FFD700", "#ffffff", "#2979FF"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, [leaderboard]);

  const formatMoney = (val: number) => {
    return `€${(val / 1000000).toLocaleString()}M`;
  };

  const toggleRow = (name: string) => {
    audio.playPop();
    setExpandedRow(expandedRow === name ? null : name);
  };

  // Find user details
  const me = room.players.find((p) => p.name === currentUsername);
  const rank = leaderboard.findIndex((e) => e.name === currentUsername) + 1;
  const isWinner = rank === 1;

  // Extract top 3 for podium
  const p1 = leaderboard[0];
  const p2 = leaderboard[1];
  const p3 = leaderboard[2];

  // Helper stats for share card
  const squad = me?.squad || [];
  const totalFantasy = squad.reduce((sum, f) => sum + f.fantasy_score, 0) + (me?.chemistry_score || 0);
  const avgOvr = squad.length > 0 ? (squad.reduce((sum, f) => sum + f.rating, 0) / squad.length).toFixed(0) : "0";
  const moneySpent = me ? (room.settings.budget - me.budget) : 0;
  
  // Highlight calculations
  const mvp = squad.length > 0 ? squad.reduce((best, f) => f.rating > best.rating ? f : best, squad[0]) : null;
  const marquee = squad.length > 0 ? squad.reduce((best, f) => f.starting_price > best.starting_price ? f : best, squad[0]) : null;
  
  // Best Bargain
  const bargain = squad.length > 0 ? squad.reduce((best, f) => {
    if (!best) return f;
    const ratioF = f.rating / Math.max(1, f.starting_price);
    const ratioBest = best.rating / Math.max(1, best.starting_price);
    return ratioF > ratioBest ? f : best;
  }, squad[0]) : null;

  // Fallback avatars for starting XI tiles matching template styling
  const fallbackAvatars = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB23f1mDHIu_u4Yi01qOSZOe5d1nVdeWBclcjug-0Ob37ffRw36dMQfsY9NXWeyQsJiSBPpxMwhyzRqjn4YGnhO87PADaJtaCdV3xh6FPgtINb14f1qbzR2Z9RmByZy9H1syRKC4yya9o---Ydg1cbJtAkoU_G4Fi3im4KaEwD6RuRi0wbeJmP2WXTWhDcwMkEGBLkVsHXC1Xb527ZMs360hmDdJW0BPwrQYb359TLKXsSP9IRDZJK19H-YLpkORMBGRXrM50XpBK0",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBzh3rdVnMJMT7186-8v6_5zipdLzSURN7fuLopFT07DTEzogri5KzRo2zHPgL62JnzYtMwpHKPWunWZVq3lkwPe7LZKqHOeP-7CvQyvUir1iU4QrUKQNk2VNFMBx7kEJucAZ1rdC9QEp5yJfKPdkkFEc5epeHQRPPYUhpC9dfgrZjNghMCGdhhSppYrHxHwHYkgJUjpLLG1DJPmUTD0_ZqQ1_gC0zQMO5wU0SZ14xMRMYvxChtdlcA9WmijkSXkTSubs0uxk0lj8c",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBlCdkZ_3WKRn20IY1XWWKPzpWJlvSK15lGEqCI8cYT11IwurgZNhlguiA4dQ7CNeqcwEu40Akc1eM9SvDRD20mGj-7X9xzkF1r5i0BAJlEUJWNvreUCBzEYP9ROL5su-GqwaGOP-f4JHZqmW36UTJfJB4B0VTbC0tQGJut0ZJkjfQWqeOdWEd_dZeHeIAnqDkqfR7j4YXo2fW_45q5Yv5eaiXUyKYHOHZ_NK7du6rgmlQDZwvV9xOY8Rsmit4ncEKParNQrKE-_PA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0szj4OaAdTMbCVnj8yXE9aK2x5KMpdnnASXQmwRVWBAndy58Vh-DmqizUaRcuvV6JjBlph09y2CNDPeW8JyiJ63TeKVWwJ_ZmUoe0pqUUnSytObEWL-5xOUJcJHi6cS-ymvQgAKEFgQLS1_-prvQaTzW72Ptg8woeHsB94eMS118iCzfUc68UPyWqsJbqRWkNQdOWcAldNcPYb24LxXUsTX9a-L7qKxjYAAvsOKExYIfnKxYfFO7RRYYKKwd_J4293DlSY1tJ7pA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA3iNztNWJ4RY-uS4by5FUp7j2C9n4HuZxQRaMi4cBmD401SGUh_NcyybXTjm1EDwUzRLaY0p4jqWS6Dr_MYoqsSqUgec_MT0cehwo1OKd433i1eBpsLdgUD797npMLkj-s0UKPi7xg7Eq5KD1CXEgTgqOSAGvagfyYm0w6TJCLyauCj660k44dLjHTV5QIUy7Z_jbyXuzZ5lpP032ZPUPBMHYUK95-o3vVMYJWraVKaAVBnn7aTg-aNTu6fEDiJibqar1h1xTpbWk",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB3YGQwKoA5KwbuCkA6EvRezN_uDu2w-2lLvzYTQr_42vFow9UPUW3P_iGfFrwLmFbFY6lReHxxJ75T36GeqHwUkvM-vM_xtYjPqSFTFZoW5pDNPq76m9ck3VqCTJ7L1GeQX0wEDukk8WpobXNia20XdSP0GnC_0dPjIyoJRBBc0Oa3VNmDZ21RsXmATP-HFFDwy9aK5ysof5T2uI1wVmDNsyXJXzhs3jPVvcD2idcC9bcrvfG45q4L3FYGGnErwykTvkibpzQOoUg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB0J_TBRZLS74UmT0vRB9k1xrryjh5ieUsf_uqc9DodYypRhvDj-08qfuCxAonOjHthFBqIYMNO4MYxZEjsjGIrNqMgWe_n6XK-cZnRICHBLcIYdipP6oWch8HQA7x9veNrd37M_qfSa_P1jMUYTa9PbAHiaEmDZ3iIFtkL58-fTlMTaLx0t4HVGp9kRJAY2Gn53WDezceKWn_MnuH4-WUw3w8JdCtWG34U8sE-c7l2FPfYUOYI7tvi8pk30p2FVbkJ3vuPnGb9uyA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBRbyGjTln1BYu8yRpsSgg-S2QJc5K391VV9v3o4jl8V3GcE25GoWUT3KIbp7j5YWXseZCFpeySJP0QcfL8MuDxOsKZMPKC8Iy2H-jR7K0BeiTU0tUH3-f2g3UMeUvtW9BkGhKJM1COcxtjK26kesmLgosvQZXhkW2ZJ9dS0wjVPsXRw7Lo5oOhbAix7ITVvIPxTznEk2nGgcSxF47FNQhKxlC65wglNguEdzR6ZPksXNZSHg1B2tdCy0JIKMkgL-sw6qyESOOfFxM"
  ];

  // Top 8 players sorted by rating descending
  const top8Players = [...squad].sort((a, b) => b.rating - a.rating).slice(0, 8);

  // Handle Download Image (html2canvas on hidden perfect size container to ensure no responsive compression or clippings)
  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;
    audio.playClick();
    setIsGenerating(true);
    
    try {
      await new Promise(r => setTimeout(r, 200));
      
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#101419",
        scale: 2, // Perfect scale for high-res 1080x1440 export
        logging: false
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `GFA2026_${currentUsername}_SquadCard.png`;
      a.click();
      audio.playCoin();
    } catch (err) {
      console.error("Failed to generate image share card", err);
      alert("Error generating card image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy result sharing text
  const handleCopyResultLink = () => {
    audio.playPop();
    const shareText = `🏆 I just won the Bidball Football Auction! Can you build a better squad than mine? Play here: https://bidball.vercel.app`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Social sharing links
  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🏆 I finished Rank #${rank} in Bidball Football Auction! Can you beat my squad? My stats: ${avgOvr} OVR, ${totalFantasy} PTS. Play now: `)}&url=${encodeURIComponent("https://bidball.vercel.app")}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(`🏆 I just won the Bidball Football Auction! Can you build a better squad than mine? Play here: https://bidball.vercel.app`)}`;

  // System Share Sheet API
  const handleSystemShare = async () => {
    audio.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bidball - Football Auction",
          text: `🏆 I placed Rank #${rank} in Bidball Football Auction! Can you beat my squad?`,
          url: "https://bidball.vercel.app"
        });
      } catch (err) {
        console.log("System share failed, calling copy link", err);
        handleCopyResultLink();
      }
    } else {
      handleCopyResultLink();
    }
  };

  const instagramShareFallback = () => {
    audio.playClick();
    handleDownloadCard();
    // Redirect to instagram
    setTimeout(() => {
      window.open("https://www.instagram.com", "_blank");
    }, 1500);
  };

  const snapchatShareFallback = () => {
    audio.playClick();
    handleDownloadCard();
    setTimeout(() => {
      window.open("https://www.snapchat.com", "_blank");
    }, 1500);
  };

  // Share Card Content Component - reusable for on-screen scaled down preview and off-screen full-res export
  const renderShareCardContent = (isExport: boolean) => (
    <div 
      className={`relative bg-[#101419] rounded-[32px] overflow-hidden flex flex-col border border-white/10 select-none ${
        isExport ? "w-[1080px] h-[1440px] p-12" : "w-full aspect-[3/4] p-6 max-w-[540px]"
      }`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-60" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkB7q7uuDT3LqCwC-1f0i6m21RxCm3EfbMBNDFCgvEnpsMNxtuLaZCPGgaJkHW-BF9Lerlth_Q2xx4wM3nSZuoqIspGbT9isYdMrt37sLJitkah5MVPSP_cQ-7hVtKiPebFAqK_1BxrBxoOivuUOfwoJ0RTgU9pb_wtx9rl2mN6OjvelUmjy1bCNVcAGxdu3VUufm4n5p_vuKLOJ5NJadAuGZ8qMChauIIQLPlih52N0bRcc_JmMr-ZZmIz_u8uNm5fIbjl7LHu0s" 
          alt="Atmosphere"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101419]/80 via-transparent to-[#101419]"></div>
        <div className="absolute inset-0 pitch-lines opacity-20"></div>
      </div>

      {/* Atmospheric Effects */}
      <div className="particles absolute inset-0 z-10">
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-[#ffe088] rounded-full blur-[1px] animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 bg-[#e9c349] rounded-full blur-[2px] animate-bounce opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-[#ffe088] rounded-full blur-[1px] animate-pulse"></div>
      </div>
      <div className="flare w-96 h-96 -top-20 -left-20 z-10"></div>
      <div className="flare w-64 h-64 top-1/2 right-0 z-10 translate-x-1/2"></div>

      {/* Header Section */}
      <header className={`relative z-20 flex justify-between items-start ${isExport ? "pt-6 mb-8" : "mb-4"}`}>
        <div className="flex flex-col gap-1">
          <h1 className={`font-black tracking-widest gold-glow flex items-center gap-2 text-white leading-none ${isExport ? "text-[26px]" : "text-[16px]"}`}>
            <span className="material-symbols-outlined text-[#00e55b] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            GLOBAL FOOTBALL AUCTION 2026
          </h1>
          <p className={`font-bold text-[#b9ccb5]/80 tracking-[0.2em] uppercase ${isExport ? "text-[10px]" : "text-[8px]"}`}>
            FINAL TOURNAMENT RESULTS
          </p>
        </div>

        {/* Champion badge */}
        <div className="glass-tier-2 px-3 py-1.5 rounded-xl flex flex-col items-center justify-center border-[#00ff66]/20">
          <span className="material-symbols-outlined text-[#e9c349]" style={{ fontVariationSettings: "'FILL' 1", fontSize: isExport ? "24px" : "18px" }}>workspace_premium</span>
          <span className="font-bold text-[#ffe088] uppercase tracking-wider" style={{ fontSize: isExport ? "8px" : "6px" }}>GOLD CHAMPION</span>
        </div>
      </header>

      {/* Centerpiece Team Info */}
      <section className="relative z-20 flex flex-col items-center text-center px-4 my-2">
        <div className="relative">
          <h2 className={`font-black text-white tracking-tighter drop-shadow-2xl uppercase ${isExport ? "text-[52px]" : "text-[28px]"} leading-none`}>
            {room.room_name || "GALÁCTICOS FC"}
          </h2>
          <div className={`absolute -top-3 -right-10 fut-badge flex flex-col items-center justify-center shadow-2xl ${isExport ? "w-14 h-20 border-2" : "w-10 h-14 border"}`}>
            <span className="text-[#ffe088] font-bold uppercase leading-none" style={{ fontSize: isExport ? "9px" : "7px" }}>OVR</span>
            <span className="font-black text-white leading-none mt-0.5" style={{ fontSize: isExport ? "24px" : "16px" }}>{avgOvr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 glass-tier-1 px-4 py-1.5 rounded-full">
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-[#00e55b]" style={{ fontSize: "14px" }}>person</span>
          </div>
          <p className="text-white text-[10px] uppercase font-bold tracking-wide">
            Managed by <span className="font-black text-[#6bff83]">{currentUsername}</span>
          </p>
        </div>

        <div className={`font-black gold-gradient leading-none ${isExport ? "text-[64px] mt-6" : "text-[36px] mt-3"}`}>
          {totalFantasy} PTS
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="relative z-20 grid grid-cols-12 gap-4 flex-1 my-2 min-h-0">
        
        {/* Left Side: Starting XI */}
        <div className="col-span-8 flex flex-col justify-between">
          <div className="glass-tier-2 rounded-2xl p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#b9ccb5] uppercase tracking-wider text-[8px]">STARTING XI — 4-3-3 ATTACK</h3>
              <span className="material-symbols-outlined text-[#b9ccb5]" style={{ fontSize: "12px" }}>sports_soccer</span>
            </div>

            {/* Tiles Grid */}
            <div className="grid grid-cols-4 gap-2.5 my-1">
              {top8Players.map((p, idx) => (
                <div 
                  key={idx}
                  className="glass-tier-1 p-1 rounded-xl border-white/5 flex flex-col items-center transition-transform"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#31353b]/40 mb-1 overflow-hidden border border-white/10 relative flex items-center justify-center">
                    <img className="w-full h-full object-cover opacity-60" src={fallbackAvatars[idx % fallbackAvatars.length]} alt={p.name} />
                    <div className="absolute top-0 right-0 bg-[#e9c349] text-black font-black text-[8px] px-1 rounded-bl leading-none py-0.5">{p.rating}</div>
                  </div>
                  <span className="font-mono text-[8px] text-white truncate w-full text-center uppercase font-black tracking-wide leading-tight">
                    {p.name.split(" ").pop()}
                  </span>
                </div>
              ))}
              
              {/* Empty Slots */}
              {Array.from({ length: Math.max(0, 8 - top8Players.length) }).map((_, idx) => (
                <div 
                  key={`empty-${idx}`}
                  className="glass-tier-1 p-1 rounded-xl border-dashed border-white/10 flex flex-col items-center justify-center h-20 text-center opacity-30"
                >
                  <span className="text-[7px] font-black uppercase text-white/50 tracking-wider">Empty</span>
                </div>
              ))}
            </div>

            {/* Bottom Indicators */}
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-center gap-4 opacity-50 text-[7px] font-black">
              <div className="flex flex-col items-center">
                <span>ATTACK</span>
                <div className="w-8 h-[2px] bg-[#6bff83] rounded-full mt-0.5"></div>
              </div>
              <div className="flex flex-col items-center">
                <span>MIDFIELD</span>
                <div className="w-8 h-[2px] bg-[#adc7ff] rounded-full mt-0.5"></div>
              </div>
              <div className="flex flex-col items-center">
                <span>DEFENSE</span>
                <div className="w-8 h-[2px] bg-[#849581] rounded-full mt-0.5"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Stats & MVP */}
        <div className="col-span-4 flex flex-col gap-3.5">
          {/* Stats Card */}
          <div className="glass-tier-2 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-[#6bff83] font-bold" style={{ fontSize: "14px" }}>analytics</span>
              <h3 className="font-bold text-white uppercase tracking-wider text-[8px]">SEASON STATS</h3>
            </div>
            
            <div className="flex flex-col gap-1.5 text-[9px] font-semibold text-white/80">
              <div className="flex justify-between items-center">
                <span className="text-white/40">Efficiency</span>
                <span className="font-bold text-[#6bff83]">98%</span>
              </div>
              <div className="w-full h-1 bg-[#1c2025] rounded-full overflow-hidden">
                <div className="h-full bg-[#00e55b] w-[98%] shadow-[0_0_8px_rgba(0,229,91,0.5)]"></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-white/40">Total Value</span>
                <span className="font-black text-white">{formatMoney(moneySpent)}</span>
              </div>
              <div className="flex justify-between items-center leading-none">
                <span className="text-white/40">Bargain</span>
                <span className="font-black text-[#ffe088] truncate max-w-[60px] text-right">
                  {bargain ? bargain.name.split(" ").pop() : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* MVP Section */}
          <div className="relative glass-tier-2 rounded-2xl p-4 flex-1 flex flex-col items-center justify-center text-center overflow-hidden border-[#e9c349]/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#775e00]/10 to-transparent opacity-50 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center h-full justify-between">
              <span className="text-[7px] font-bold text-[#ffe088] bg-[#775e00]/40 px-2 py-0.5 rounded-full border border-[#e9c349]/30 leading-none">
                SQUAD MVP
              </span>
              
              <div className="my-3 w-16 h-16 rounded-full border-2 border-[#e9c349] p-0.5 shadow-[0_0_20px_rgba(233,195,73,0.3)] bg-slate-900 overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-[#e9c349] text-3xl font-bold">person_celebrate</span>
              </div>

              <div>
                <h4 className="font-black text-[11px] text-white truncate max-w-[80px] leading-tight">
                  {mvp ? mvp.name.split(" ").pop() : "None"}
                </h4>
                <p className="text-[7px] text-white/40 uppercase tracking-widest font-black mt-0.5">
                  PRO • {mvp ? mvp.rating : "0"} OVR
                </p>
              </div>

              <div className="mt-2.5 flex gap-1 text-[8px] font-black uppercase text-white/60">
                <div className="glass-tier-1 px-2 py-0.5 rounded border border-[#e9c349]/10">PAC 99</div>
                <div className="glass-tier-1 px-2 py-0.5 rounded border border-[#e9c349]/10">SHO 97</div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Area */}
      <footer className="relative z-20 py-4 border-t border-white/10 flex justify-between items-center mt-3">
        <div className="flex flex-col">
          <p className="font-bold text-[#6bff83] tracking-tight text-[9px]">bidball.vercel.app</p>
          <p className="text-[7px] text-white/30 font-black uppercase mt-0.5 tracking-wider">
            © 2026 WORLD DRAFT LEAGUE PRO • ALL RIGHTS RESERVED
          </p>
        </div>

        {/* QR Code */}
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white rounded shadow-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[#101419] font-black text-2xl">qr_code_2</span>
          </div>
          <div className="text-right">
            <p className="text-white/40 font-black text-[7px] uppercase tracking-wider leading-none">SCAN TO VIEW</p>
            <p className="text-white font-black text-[9px] uppercase tracking-wide leading-none mt-1">FULL SQUAD</p>
          </div>
        </div>
      </footer>

    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 relative z-10 select-none">
      
      {/* Title */}
      <div className="text-center mb-16">
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 text-[9px] font-black text-[#FFD700] uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full animate-pulse shadow-md"
        >
          🏆 Tournament Championship Hall of Fame
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-none mt-4 select-none"
        >
          Draft Finalized
        </motion.h1>
        <p className="text-sm text-white/50 mt-2 font-medium">
          The bidding wars have concluded. All squads are verified. Presenting your Champions.
        </p>
      </div>

      {/* 3D Podium for Top 3 */}
      <div className="flex flex-row items-end justify-center gap-4 sm:gap-6 mb-20 max-w-3xl mx-auto h-[260px] sm:h-[300px]">
        {/* 2nd Place */}
        {p2 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-300 bg-slate-800 flex items-center justify-center text-lg font-black text-white mb-2 uppercase shadow-lg select-none">
              {p2.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-xs sm:text-sm font-black text-white block truncate max-w-[100px]">{p2.name}</span>
              <span className="text-[10px] text-white/50 font-bold">{p2.score} pts</span>
            </div>
            {/* Metallic Silver gradient podium block */}
            <div className="w-full h-24 bg-gradient-to-t from-slate-700 via-slate-500 to-slate-400 border-t-2 border-slate-300 shadow-[0_0_20px_rgba(156,163,175,0.2)] rounded-t-2xl flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-100">2</span>
              <span className="text-[8px] font-black text-slate-200/50 uppercase tracking-widest mt-1">Silver</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Championship Center) */}
        {p1 && (
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="flex-1 flex flex-col items-center relative"
          >
            {/* Floating Gold Crown/Trophy above avatar */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute -top-12 z-20"
            >
              <Trophy className="w-9 h-9 text-[#FFD700] fill-[#FFD700]/10 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </motion.div>

            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-[#FFD700] bg-slate-800 flex items-center justify-center text-xl sm:text-2xl font-black text-white mb-2 uppercase shadow-[0_0_30px_rgba(255,215,0,0.35)] select-none relative z-10">
              {p1.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-sm sm:text-base font-black text-[#FFD700] text-glow-gold block truncate max-w-[120px]">{p1.name}</span>
              <span className="text-xs font-black text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.2)]">{p1.score} pts</span>
            </div>
            {/* Metallic Gold gradient podium block */}
            <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-yellow-600 via-amber-500 to-yellow-400 border-t-2 border-yellow-200 shadow-[0_0_30px_rgba(251,191,36,0.3)] rounded-t-2xl flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">1</span>
              <span className="text-[9px] font-black text-yellow-100/50 uppercase tracking-widest mt-1">Champion</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {p3 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-600 bg-slate-800 flex items-center justify-center text-base font-black text-white mb-2 uppercase shadow-lg select-none">
              {p3.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-xs sm:text-sm font-black text-white block truncate max-w-[100px]">{p3.name}</span>
              <span className="text-[10px] text-white/50 font-bold">{p3.score} pts</span>
            </div>
            {/* Metallic Bronze gradient podium block */}
            <div className="w-full h-20 bg-gradient-to-t from-amber-800 via-amber-700 to-amber-500 border-t-2 border-amber-400 shadow-[0_0_15px_rgba(180,83,9,0.15)] rounded-t-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-amber-100">3</span>
              <span className="text-[8px] font-black text-amber-200/50 uppercase tracking-widest mt-0.5">Bronze</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Share Card Section with Preview Box */}
      {me && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-6 bg-[#00E676]" />
            <h2 className="text-sm font-black text-[#00E676] uppercase tracking-widest">
              Shareable Squad Card
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
            {/* On-Screen Card Preview (Responsive aspect-ratio) */}
            <div className="p-4 bg-[#101419] rounded-[36px] border border-white/10 shadow-2xl relative max-w-[360px] w-full flex justify-center items-center overflow-hidden">
              {renderShareCardContent(false)}
            </div>

            {/* Sharing CTA Actions */}
            <div className="flex flex-col gap-4 w-full md:w-80 font-bold uppercase text-[10px]">
              <span className="text-[10px] font-black text-[#b9ccb5] uppercase tracking-widest leading-none">Share & Download Center</span>
              
              <button 
                onClick={handleDownloadCard}
                disabled={isGenerating}
                className="w-full py-4.5 bg-[#00e55b] hover:bg-[#00c853] text-[#001a41] font-black uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(0,229,91,0.25)] hover:scale-102 active:scale-98 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4.5 h-4.5" /> 
                {isGenerating ? "Generating PNG..." : "Download High-Res PNG"}
              </button>

              <button 
                onClick={handleSystemShare}
                className="w-full py-4 bg-slate-900 border border-white/10 hover:border-white/20 text-white font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                <Share2 className="w-4.5 h-4.5" />
                Share via System Share Sheet
              </button>

              <div className="h-[1px] bg-white/5 my-1" />

              <div className="grid grid-cols-2 gap-3 text-[9px]">
                <button 
                  onClick={instagramShareFallback}
                  className="py-3 text-center bg-[#E1306C] text-white hover:bg-[#d0255b] rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all"
                >
                  📸 Instagram
                </button>
                <button 
                  onClick={snapchatShareFallback}
                  className="py-3 text-center bg-[#FFFC00] text-black hover:bg-[#e6e200] rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all"
                >
                  👻 Snapchat
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[9px]">
                <a 
                  href={whatsappShare} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => audio.playClick()}
                  className="py-3 text-center bg-[#25D366] text-[#0A0D10] hover:bg-[#20ba5a] rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center"
                >
                  💬 WhatsApp
                </a>
                <a 
                  href={twitterShare} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => audio.playClick()}
                  className="py-3 text-center bg-slate-900 border border-white/10 hover:border-white/20 text-white rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center"
                >
                  🐦 Share to X
                </a>
              </div>

              <button 
                onClick={handleCopyResultLink}
                className="w-full py-3.5 bg-slate-900 border border-white/5 hover:border-[#00e55b]/20 text-[#e0e2ea] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#00e55b]" /> : <Send className="w-4 h-4" />}
                {copiedLink ? "Link Copied!" : "📋 Copy Sharing Link"}
              </button>
            </div>
          </div>

          {/* Absolute Off-Screen Container: Rendered at exactly 1080x1440 for html2canvas export */}
          <div className="absolute top-[-9999px] left-[-9999px] z-50 pointer-events-none select-none overflow-hidden">
            <div ref={shareCardRef}>
              {renderShareCardContent(true)}
            </div>
          </div>

        </div>
      )}

      {/* Standings Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 mb-10 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-lg font-black text-white uppercase tracking-tight font-headline-md">Final Leaderboard Standings</h2>
          <button 
            onClick={() => {
              audio.playClick();
              alert("Tournament results exported successfully!");
            }}
            className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-white/30 uppercase font-black tracking-widest border-b border-white/5 pb-3.5 text-[9px] font-label-caps">
                <th className="pb-3 w-12 text-center">Rank</th>
                <th className="pb-3">Club Manager</th>
                <th className="pb-3 text-center">Squad Size</th>
                <th className="pb-3 text-center">Leftover Budget</th>
                <th className="pb-3 text-right">Final Standing</th>
                <th className="pb-3 w-12 text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isExpanded = expandedRow === entry.name;
                const avgOvr = entry.squad_size > 0 ? (entry.total_rating / entry.squad_size).toFixed(1) : "0.0";
                
                return (
                  <React.Fragment key={entry.name}>
                    {/* Primary Row */}
                    <tr 
                      onClick={() => toggleRow(entry.name)}
                      className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-all ${
                        idx === 0 ? "bg-[#00E676]/5 text-[#00E676]" : "text-white/80"
                      }`}
                    >
                      <td className="py-4.5 text-center font-black">#{idx + 1}</td>
                      <td className="py-4.5 font-black text-sm flex items-center gap-2">
                        {entry.name}
                        {idx === 0 && <span className="text-[8px] bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded-md font-black border border-yellow-500/20 tracking-wider">WINNER</span>}
                      </td>
                      <td className="py-4.5 text-center font-bold">{entry.squad_size} / 15 players</td>
                      <td className="py-4.5 text-center font-bold">{formatMoney(entry.budget)}</td>
                      <td className="py-4.5 text-right font-black text-sm pr-1">{entry.score} pts</td>
                      <td className="py-4.5 text-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40 inline" /> : <ChevronDown className="w-4 h-4 text-white/40 inline" />}
                      </td>
                    </tr>

                    {/* Expanding details cards row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-950/40 border-b border-white/5 px-6 py-5">
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white/90 font-semibold"
                          >
                            
                            {/* Card 1: Team General stats */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Team Summary</span>
                              <div className="my-2">
                                <span className="text-xl font-black text-white block">{avgOvr} OVR</span>
                                <span className="text-[9px] text-white/40 font-bold">Average Squad Rating</span>
                              </div>
                              <span className="text-[9px] text-[#00E676] font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Base score: {entry.score - (entry.boosts_used?.filter(b => b === "Team Chemistry").length || 0) * 5} pts
                              </span>
                            </div>

                            {/* Card 2: Boosts Purchased */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Boosts Used</span>
                              <div className="my-2 flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                                {(!entry.boosts_used || entry.boosts_used.length === 0) ? (
                                  <span className="text-xs text-white/20">No boosts purchased</span>
                                ) : (
                                  entry.boosts_used.map((b, i) => (
                                    <span key={i} className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-black px-2 py-0.5 rounded-md">
                                      ⚡ {b.split(" (")[0]}
                                    </span>
                                  ))
                                )}
                              </div>
                              <span className="text-[9px] text-purple-400 font-bold">Total items: {entry.boosts_used?.length || 0}</span>
                            </div>

                            {/* Card 3: Best Steal Card */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Best Bargain</span>
                              <div className="my-2">
                                <span className="text-xs font-black text-white truncate block">{entry.best_purchase || "None"}</span>
                                <span className="text-[9px] text-[#00E676] font-bold block mt-0.5">High rating / low bid</span>
                              </div>
                              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Scouting report</span>
                            </div>

                            {/* Card 4: Most Expensive Card */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Crown Jewel Signing</span>
                              <div className="my-2">
                                <span className="text-xs font-black text-[#FFD700] truncate block">{entry.most_expensive || "None"}</span>
                                <span className="text-[9px] text-white/40 block mt-0.5 font-bold">Highest bid purchase</span>
                              </div>
                              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Marquee player</span>
                            </div>

                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => {
            audio.playClick();
            onPlayAgain();
          }}
          className="px-8 py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black rounded-xl shadow-[0_6px_20px_rgba(0,230,118,0.25)] hover:shadow-[0_10px_25px_rgba(0,230,118,0.4)] transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" /> Host New Tournament
        </button>
        <button
          onClick={() => {
            audio.playClick();
            onGoHome();
          }}
          className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98"
        >
          <Home className="w-4 h-4" /> Exit to Home
        </button>
      </div>

    </div>
  );
}
