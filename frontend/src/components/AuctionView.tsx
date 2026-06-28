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
  
  // Format money amounts
  const formatMoney = (val: number) => {
    return (val / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " M";
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

  // Get star player card outline classes based on Tier
  const getCardBorderClass = (tier: string) => {
    if (tier === "Tier S") return "border-[#FFD700] border-2 shadow-[0_0_25px_rgba(255,215,0,0.25)] bg-gradient-to-b from-[#1E190E] to-[#12161A]";
    if (tier === "Tier A") return "border-[#2979FF] border shadow-[0_0_20px_rgba(41,121,255,0.2)] bg-gradient-to-b from-[#0F1523] to-[#12161A]";
    if (tier === "Tier B") return "border-slate-400 border bg-gradient-to-b from-[#181C21] to-[#12161A]";
    return "border-amber-700 border bg-gradient-to-b from-[#1B1714] to-[#12161A]";
  };

  const getTierBadgeColor = (tier: string) => {
    if (tier === "Tier S") return "bg-[#FFD700] text-[#0A0D10] font-extrabold";
    if (tier === "Tier A") return "bg-[#2979FF] text-white font-extrabold";
    if (tier === "Tier B") return "bg-slate-400 text-slate-950 font-bold";
    return "bg-amber-700 text-white font-bold";
  };

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
        {player ? (
          <div className={`w-72 rounded-2xl p-6 ${getCardBorderClass(player.tier)} flex flex-col relative overflow-hidden group`}>
            
            {/* Country Flag / CM Position */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <span className="text-5xl font-extrabold tracking-tight text-white leading-none">
                  {player.rating}
                </span>
                <span className="text-xs font-bold text-white/60 tracking-wider mt-1">
                  {player.position}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xl" title={player.country}>🏳️</span>
                <span className="text-[9px] font-bold text-white/40">{player.country}</span>
              </div>
            </div>

            {/* Star Image / Avatar representation */}
            <div className="w-full h-32 flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-white/10 flex items-center justify-center text-white/30 text-3xl font-extrabold shadow-inner select-none uppercase">
                {player.name[0]}
              </div>
            </div>

            {/* Name and Metadata */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-extrabold text-white tracking-tight truncate uppercase leading-none">
                {player.name}
              </h2>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${getTierBadgeColor(player.tier)}`}>
                {player.tier}
              </span>
            </div>

            {/* Attribute Stats Grid */}
            <div className="grid grid-cols-3 gap-y-2 gap-x-1 border-t border-[rgba(255,255,255,0.06)] pt-4 text-center">
              <div>
                <span className="text-[9px] font-bold text-white/30 uppercase block">Rating</span>
                <span className="text-xs font-bold text-white">{player.rating}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-white/30 uppercase block">Fantasy</span>
                <span className="text-xs font-bold text-[#FFD700]">{player.fantasy_score} pts</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-white/30 uppercase block">Starting</span>
                <span className="text-xs font-bold text-white/80">{formatMoney(player.starting_price)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-72 h-96 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 bg-[#12161A]/50">
            <ShieldAlert className="w-10 h-10 text-white/20 mb-3" />
            <span className="text-sm font-bold text-white/30 uppercase tracking-widest">
              Awaiting Next Player
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
