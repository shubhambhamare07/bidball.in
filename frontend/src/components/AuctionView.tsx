"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, User, ChevronRight, MessageSquare, History, ShieldAlert } from "lucide-react";
import { Player, RoomPlayer, ChatMessage } from "../types";
import { audio } from "../utils/audio";

interface AuctionViewProps {
  player: Player | null;
  timeRemaining: number;
  highestBid: number;
  highestBidder: string | null;
  playersList: RoomPlayer[];
  currentUsername: string;
  chatMessages: ChatMessage[];
  onBid: (amount: number) => void;
  onSendMessage: (text: string) => void;
  onSkipPlayer: () => void;
  onForceEndAuction: () => void;
}

// Dynamically map country to flag theme gradients and details
const getCountryCardStyles = (country: string = "") => {
  const c = country.trim().toLowerCase();
  switch (c) {
    case "argentina":
      return {
        gradient: "linear-gradient(135deg, #75AADB 0%, #FFFFFF 50%, #75AADB 100%)",
        borderAccent: "#75AADB",
        flag: "🇦🇷",
        textColor: "text-[#0F172A]"
      };
    case "brazil":
      return {
        gradient: "linear-gradient(135deg, #009B3A 0%, #FEDF00 50%, #002776 100%)",
        borderAccent: "#FEDF00",
        flag: "🇧🇷",
        textColor: "text-white"
      };
    case "france":
      return {
        gradient: "linear-gradient(135deg, #002395 0%, #FFFFFF 50%, #ED2939 100%)",
        borderAccent: "#ED2939",
        flag: "🇫🇷",
        textColor: "text-white"
      };
    case "spain":
      return {
        gradient: "linear-gradient(135deg, #C11B17 0%, #F4D03F 50%, #C11B17 100%)",
        borderAccent: "#F4D03F",
        flag: "🇪🇸",
        textColor: "text-white"
      };
    case "portugal":
      return {
        gradient: "linear-gradient(135deg, #046A38 0%, #DA291C 70%, #151515 100%)",
        borderAccent: "#DA291C",
        flag: "🇵🇹",
        textColor: "text-white"
      };
    case "germany":
      return {
        gradient: "linear-gradient(135deg, #151515 0%, #D00F2F 50%, #FFCC00 100%)",
        borderAccent: "#FFCC00",
        flag: "🇩🇪",
        textColor: "text-white"
      };
    case "england":
      return {
        gradient: "linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 80%, #DA291C 100%)",
        borderAccent: "#DA291C",
        flag: "🏴",
        textColor: "text-slate-900"
      };
    case "italy":
      return {
        gradient: "linear-gradient(135deg, #008C45 0%, #FFFFFF 50%, #CD212A 100%)",
        borderAccent: "#CD212A",
        flag: "🇮🇹",
        textColor: "text-white"
      };
    case "netherlands":
      return {
        gradient: "linear-gradient(135deg, #FF4F00 0%, #1A2E40 60%, #0F1A24 100%)",
        borderAccent: "#FF4F00",
        flag: "🇳🇱",
        textColor: "text-white"
      };
    case "belgium":
      return {
        gradient: "linear-gradient(135deg, #151515 0%, #FDDA24 50%, #EF3340 100%)",
        borderAccent: "#FDDA24",
        flag: "🇧🇪",
        textColor: "text-white"
      };
    case "croatia":
      return {
        gradient: "linear-gradient(135deg, #C8102E 0%, #FFFFFF 50%, #003D80 100%)",
        borderAccent: "#C8102E",
        flag: "🇭🇷",
        textColor: "text-white"
      };
    case "uruguay":
      return {
        gradient: "linear-gradient(135deg, #75AADB 0%, #FFFFFF 50%, #FCD116 100%)",
        borderAccent: "#FCD116",
        flag: "🇺🇾",
        textColor: "text-slate-900"
      };
    case "morocco":
      return {
        gradient: "linear-gradient(135deg, #C1272D 0%, #006233 60%, #C1272D 100%)",
        borderAccent: "#006233",
        flag: "🇲🇦",
        textColor: "text-white"
      };
    case "usa":
      return {
        gradient: "linear-gradient(135deg, #0A3161 0%, #FFFFFF 50%, #B31942 100%)",
        borderAccent: "#0A3161",
        flag: "🇺🇸",
        textColor: "text-white"
      };
    case "mexico":
      return {
        gradient: "linear-gradient(135deg, #006847 0%, #FFFFFF 50%, #CE1126 100%)",
        borderAccent: "#006847",
        flag: "🇲🇽",
        textColor: "text-white"
      };
    case "japan":
      return {
        gradient: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 70%, #BC002D 100%)",
        borderAccent: "#BC002D",
        flag: "🇯🇵",
        textColor: "text-slate-900"
      };
    case "south korea":
    case "korea":
      return {
        gradient: "linear-gradient(135deg, #FFFFFF 0%, #0A1826 65%, #CD2E3A 100%)",
        borderAccent: "#CD2E3A",
        flag: "🇰🇷",
        textColor: "text-white"
      };
    case "canada":
      return {
        gradient: "linear-gradient(135deg, #FF0000 0%, #FFFFFF 50%, #FF0000 100%)",
        borderAccent: "#FF0000",
        flag: "🇨🇦",
        textColor: "text-slate-900"
      };
    case "australia":
      return {
        gradient: "linear-gradient(135deg, #0A1C2A 0%, #FFCD00 60%, #008A4B 100%)",
        borderAccent: "#FFCD00",
        flag: "🇦🇺",
        textColor: "text-white"
      };
    case "switzerland":
      return {
        gradient: "linear-gradient(135deg, #D52B1E 0%, #FFFFFF 50%, #D52B1E 100%)",
        borderAccent: "#FFFFFF",
        flag: "🇨🇭",
        textColor: "text-white"
      };
    default:
      return {
        gradient: "linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)",
        borderAccent: "rgba(255, 255, 255, 0.08)",
        flag: "🏳️",
        textColor: "text-white"
      };
  }
};

const getCardTierClass = (tier: string = "") => {
  const t = tier.toUpperCase();
  if (t.includes("S")) {
    return {
      border: "border-tier-s",
      glow: "shadow-[0_0_35px_rgba(255,215,0,0.15)]",
      badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black",
      color: "#FFD700"
    };
  }
  if (t.includes("A")) {
    return {
      border: "border-tier-a",
      glow: "shadow-[0_0_30px_rgba(147,51,234,0.15)]",
      badgeBg: "bg-purple-600 text-white font-extrabold",
      color: "#A855F7"
    };
  }
  if (t.includes("B")) {
    return {
      border: "border-tier-b",
      glow: "shadow-[0_0_25px_rgba(59,130,246,0.15)]",
      badgeBg: "bg-blue-600 text-white font-extrabold",
      color: "#3B82F6"
    };
  }
  return {
    border: "border-tier-c",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.15)]",
    badgeBg: "bg-slate-500 text-slate-950 font-bold",
    color: "#94A3B8"
  };
};

const PlayerSilhouette = ({ tierColor = "white", countryAccent = "white" }) => {
  return (
    <svg className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="playerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={countryAccent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={countryAccent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="silhouetteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      
      <circle cx="50" cy="50" r="45" fill="url(#playerGlow)" />
      
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-20" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" className="opacity-10" />

      <circle cx="50" cy="32" r="12.5" fill="url(#silhouetteGrad)" stroke="currentColor" strokeWidth="1" className="opacity-80" />
      
      <path d="M18 80 C18 61, 30 52, 50 52 C70 52, 82 61, 82 80 C82 82, 80 84, 78 84 L22 84 C20 84, 18 82, 18 80 Z" fill="url(#silhouetteGrad)" stroke="currentColor" strokeWidth="1" className="opacity-80" />
      
      <path d="M42 52 L50 63 L58 52" stroke={tierColor} strokeWidth="1.5" strokeLinecap="round" className="opacity-80" />
      
      <path d="M24 75 C28 65, 38 56, 50 56" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
      <path d="M76 75 C72 65, 62 56, 50 56" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
    </svg>
  );
};

export default function AuctionView({
  player,
  timeRemaining,
  highestBid,
  highestBidder,
  playersList,
  currentUsername,
  chatMessages,
  onBid,
  onSendMessage,
  onSkipPlayer,
  onForceEndAuction,
}: AuctionViewProps) {
  const [activeTab, setActiveTab] = useState<"bids" | "chat">("bids");
  const [inputText, setInputText] = useState("");
  const feedContainerRef = useRef<HTMLDivElement>(null);
  
  // Find current user profile
  const me = playersList.find((p) => p.name === currentUsername);
  
  // Find current card styling
  const countryStyles = player ? getCountryCardStyles(player.country) : null;
  const tierStyles = player ? getCardTierClass(player.tier) : null;
  
  // Format money amounts
  const formatMoney = (val: number) => {
    return "€" + (val / 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + "M";
  };

  const handleIncrement = (inc: number) => {
    audio.playClick();
    onBid(highestBid + inc);
  };

  const handleCustomBid = () => {
    audio.playClick();
    onBid(highestBid + 1000000); // Default bid increments by 1M
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
    audio.playClick();
  };

  // Play ticking sound when countdown is low
  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      audio.playTick();
    }
  }, [timeRemaining]);

  // Scroll bids/chat log
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight;
    }
  }, [chatMessages, highestBid, activeTab]);

  // Filter bid messages
  const bidMessages = chatMessages.filter(m => m.type === "bid" || m.sender === "System");



  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 flex flex-col lg:flex-row gap-6 relative z-10">
      
      {/* Left Sidebar: Top Managers & My Roster View */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        
        {/* Top Managers Mini Leaderboard */}
        <div className="glass-panel p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            📊 Top Managers
          </h3>
          <div className="flex flex-col gap-3">
            {playersList
              .map((p) => {
                const score = sumFantasyScore(p.squad);
                return { name: p.name, score, budget: p.budget };
              })
              .sort((a, b) => b.score - a.score || b.budget - a.budget)
              .slice(0, 5)
              .map((p, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-[rgba(255,255,255,0.04)] pb-2 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-white/80 flex items-center gap-1">
                    <span className="text-[10px] text-white/30">{idx + 1}.</span> {p.name}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#00E676]">{p.score} pts</span>
                    <div className="text-[9px] text-white/30">{formatMoney(p.budget)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* My Team View Slots */}
        <div className="glass-panel p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 flex-1">
          <h3 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-4">
            🛡️ My Roster ({me?.squad.length || 0}/15)
          </h3>
          
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {me?.squad.map((f, idx) => (
              <div key={idx} className="bg-[#1A2129] border border-[rgba(255,255,255,0.08)] p-2 rounded-lg text-center flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold text-white truncate">{f.name}</span>
                <div className="flex justify-between items-center text-[9px] text-white/50 px-1">
                  <span>{f.position}</span>
                  <span className="text-[#00E676] font-bold">OVR {f.rating}</span>
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 6 - (me?.squad.length || 0)) }).map((_, idx) => (
              <div 
                key={`empty-slot-${idx}`}
                className="border border-dashed border-[rgba(255,255,255,0.06)] bg-transparent rounded-lg py-4 flex items-center justify-center text-[10px] text-white/10 font-bold uppercase tracking-wider"
              >
                Empty
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Center Panel: Timer, Card, Bid Controls */}
      <div className="flex-1 flex flex-col items-center justify-center">
        
        {/* Timer Countdown Display */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#00E676"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - timeRemaining / 15)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="flex flex-col items-center select-none z-10">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Time Remaining</span>
            <span className="text-4xl font-extrabold text-white tabular-nums tracking-tight">
              00:{timeRemaining.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Player Card Container */}
        {player && countryStyles && tierStyles ? (
          <div 
            key={player.name}
            style={{ background: countryStyles.gradient }}
            className={`w-80 h-[480px] rounded-3xl p-6 ${tierStyles.border} ${tierStyles.glow} ${countryStyles.textColor} premium-collectible-card animate-card-entrance flex flex-col relative overflow-hidden group select-none`}
          >
            {/* Card Glassmorphic Shell */}
            <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[2.5px] z-1" />
            
            {/* Card Shards polygonal overlay */}
            <div className="card-shards-overlay z-2" />
            
            {/* Card Shine sweep hover effect */}
            <div className="card-shine-overlay z-5" />

            {/* Dynamic spotlight shadow ring */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-3xl z-1 pointer-events-none" />

            {/* Card Content Wrapper */}
            <div className="relative z-10 flex-1 flex flex-col justify-between h-full">
              
              {/* Top Header: Rating, Position, Flag, Tier Shield */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black tracking-tight leading-none drop-shadow-md">
                    {player.rating}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest mt-1.5 opacity-90 px-2 py-0.5 bg-black/40 rounded-md text-white border border-white/5">
                    {player.position}
                  </span>
                </div>
                
                {/* Flag and Tier Badge */}
                <div className="flex items-center gap-2 bg-black/35 px-2.5 py-1.5 rounded-xl border border-white/10 shadow-inner">
                  <span className="text-2xl filter drop-shadow-sm leading-none" title={player.country}>
                    {countryStyles.flag}
                  </span>
                  <div className="w-[1px] h-4 bg-white/15" />
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${tierStyles.badgeBg}`}>
                    {player.tier.replace("Tier ", "")}
                  </span>
                </div>
              </div>

              {/* Center: Stylized Player Silhouette */}
              <div className="w-full h-40 flex items-center justify-center my-1 relative">
                <div className="w-36 h-36 relative">
                  <PlayerSilhouette tierColor={tierStyles.color} countryAccent={countryStyles.borderAccent} />
                </div>
              </div>

              {/* Player Name */}
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-wider uppercase truncate drop-shadow-lg leading-none py-1">
                  {player.name}
                </h2>
                <span className="text-[9px] font-bold tracking-widest uppercase opacity-60">
                  {player.country}
                </span>
              </div>

              {/* Attribute Stats Grid */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center my-1.5">
                <div>
                  <span className="text-[8px] font-bold opacity-50 uppercase block">OVR</span>
                  <span className="text-xs font-extrabold">{player.rating}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold opacity-50 uppercase block">Fantasy</span>
                  <span className="text-xs font-extrabold text-[#FFD700] drop-shadow-sm">{player.fantasy_score} pts</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold opacity-50 uppercase block">Starting</span>
                  <span className="text-xs font-extrabold text-white/95">{formatMoney(player.starting_price)}</span>
                </div>
              </div>

              {/* Dynamic Live Auction Status Box */}
              <div className="bg-black/65 border border-white/10 rounded-2xl p-3 flex items-center justify-between mt-0.5">
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-wide">Current Bid</span>
                  <span className="text-sm font-black text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.25)]">
                    {formatMoney(highestBid)}
                  </span>
                  <span className="text-[8px] text-white/50 truncate max-w-[120px] font-medium mt-0.5">
                    by {highestBidder || "No Bids"}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-wide">Time Left</span>
                  <span className={`text-sm font-black tabular-nums tracking-wide ${
                    timeRemaining <= 5 
                      ? "text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.35)]" 
                      : "text-white"
                  }`}>
                    00:{timeRemaining.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="w-80 h-[480px] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 bg-[#12161A]/50 relative overflow-hidden animate-pulse">
            {/* Spotlight cone graphic inside empty card */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
            <ShieldAlert className="w-12 h-12 text-white/10 mb-4 relative z-10" />
            <span className="text-xs font-extrabold text-white/20 uppercase tracking-widest relative z-10">
              Awaiting Next Draw
            </span>
          </div>
        )}

        {/* Current Highest Bid Section */}
        <div className="w-full max-w-md bg-[#141A21] border border-[rgba(255,255,255,0.06)] rounded-xl py-4 px-6 text-center mt-8">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Current Highest Bid</span>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
            {formatMoney(highestBid)}
          </div>
          <div className="text-xs text-[#00E676] font-semibold mt-0.5">
            by {highestBidder || "No Bids Placed"}
          </div>
        </div>

        {/* Bidding Actions */}
        <div className="w-full max-w-md flex flex-col gap-3 mt-4">
          <div className="flex gap-2">
            {[1000000, 5000000, 10000000].map((inc) => (
              <button
                key={inc}
                onClick={() => handleIncrement(inc)}
                className="flex-1 py-2.5 bg-[#1A2129] hover:bg-[#202933] border border-[rgba(255,255,255,0.08)] text-white/90 hover:text-white font-extrabold rounded-lg text-xs transition-all cursor-pointer"
              >
                +{inc / 1000000}M
              </button>
            ))}
          </div>
          <button
            onClick={handleCustomBid}
            className="w-full py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-extrabold rounded-lg shadow-lg hover:shadow-[#00E676]/20 transition-all text-sm uppercase tracking-wider cursor-pointer"
          >
            Place Bid (+1M)
          </button>
        </div>

        {/* Host controls */}
        {me?.is_host && (
          <div className="w-full max-w-md bg-[#161D24] border border-[rgba(255,215,0,0.15)] rounded-xl p-4 mt-6 text-center shadow-[0_0_15px_rgba(255,215,0,0.05)]">
            <span className="text-[10px] font-extrabold text-[#FFD700] uppercase tracking-wider block mb-3">🛠️ Host Tournament Controls</span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  audio.playClick();
                  onSkipPlayer();
                }}
                className="flex-1 py-2.5 bg-[#1F2937] hover:bg-[#374151] border border-white/10 text-white font-extrabold rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer"
              >
                ⏩ Skip Player
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  if (confirm("Are you sure you want to end the auction round?")) {
                    onForceEndAuction();
                  }
                }}
                className="flex-1 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-400 font-extrabold rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer"
              >
                🛑 End Round
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Right Sidebar: Chat / Bids History */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6 h-[550px] lg:h-[620px]">
        <div className="glass-panel p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 flex-1 flex flex-col overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-[rgba(255,255,255,0.04)] mb-4">
            <button
              onClick={() => {
                audio.playClick();
                setActiveTab("bids");
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "bids" ? "text-[#00E676] border-b-2 border-[#00E676]" : "text-white/40"
              }`}
            >
              <History className="w-3.5 h-3.5" /> Bids Feed
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setActiveTab("chat");
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "chat" ? "text-[#00E676] border-b-2 border-[#00E676]" : "text-white/40"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
          </div>

          {/* Feed Contents */}
          <div 
            ref={feedContainerRef}
            className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs pb-4"
          >
            {activeTab === "bids" ? (
              bidMessages.map((msg, idx) => (
                <div key={idx} className="bg-[#1A2129]/40 border border-[rgba(255,255,255,0.03)] px-3 py-2 rounded-lg text-white/50 text-[11px] leading-relaxed text-center">
                  {msg.text}
                </div>
              ))
            ) : (
              chatMessages
                .filter(m => m.type === "chat")
                .map((msg, idx) => {
                  const isMe = msg.sender === currentUsername;
                  return (
                    <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                      <span className="text-[10px] text-white/40 px-1 font-semibold">{msg.sender}</span>
                      <div className={`px-3.5 py-2.5 rounded-2xl leading-normal ${
                        isMe 
                          ? "bg-[#00E676] text-[#0A0D10] font-medium rounded-tr-none" 
                          : "bg-[#1A2129] border border-[rgba(255,255,255,0.06)] text-white rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-[rgba(255,255,255,0.04)]">
            <input
              type="text"
              placeholder={activeTab === "bids" ? "Send reaction..." : "Type chat message..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-3.5 py-2.5 rounded-lg text-xs transition-all"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] rounded-lg transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

// Helper Utilities
function sumFantasyScore(squad: Player[] = []): number {
  return squad.reduce((total, p) => total + p.fantasy_score, 0);
}
