"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, Shield, Users, Send, Settings, HelpCircle, CheckCircle2, Circle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Room, RoomPlayer, ChatMessage } from "../types";
import { audio } from "../utils/audio";

interface LobbyViewProps {
  room: Room;
  currentUsername: string;
  chatMessages: ChatMessage[];
  onToggleReady: () => void;
  onStartAuction: () => void;
  onKickPlayer: (name: string) => void;
  onSendMessage: (text: string) => void;
}

export default function LobbyView({
  room,
  currentUsername,
  chatMessages,
  onToggleReady,
  onStartAuction,
  onKickPlayer,
  onSendMessage,
}: LobbyViewProps) {
  const [inputText, setInputText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Find current user's profile
  const me = room.players.find((p) => p.name === currentUsername);
  const isHost = me?.is_host || false;
  
  // Format budget
  const formatMoney = (val: number) => {
    return `€${val / 1000000}M`;
  };

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
    audio.playClick();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.room_code);
    audio.playPop();
    alert(`Room Code ${room.room_code} copied to clipboard!`);
  };

  // Join link for QR Code
  const joinUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/?join=${room.room_code}` 
    : `https://gfa2026.com/join/${room.room_code}`;

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 flex flex-col lg:flex-row gap-6 relative z-10">
      
      {/* Left Sidebar: Lobby Info & Settings */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        
        {/* Lobby Details Box */}
        <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">Waiting Lobby</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">
            Lobby #{room.room_code}
          </h2>
          <p className="text-xs text-white/50 mb-6">{room.room_name}</p>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">Room Code</span>
            <div className="flex items-center justify-between bg-[#1A2129] border border-[rgba(255,255,255,0.08)] px-4 py-3 rounded-lg">
              <span className="text-sm font-bold tracking-wider text-white uppercase">{room.room_code}</span>
              <button 
                onClick={handleCopyCode}
                className="text-[rgba(255,255,255,0.4)] hover:text-[#00E676] transition-colors cursor-pointer"
                title="Copy Room Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-lg inline-block">
              <QRCodeSVG value={joinUrl} size={130} />
            </div>
            <span className="text-[10px] text-white/40 font-medium">Scan to join instantly</span>
          </div>

          {/* Action Trigger */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onToggleReady();
              }}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all cursor-pointer border ${
                me?.is_ready 
                  ? "bg-transparent border-[#00E676] text-[#00E676] hover:bg-[#00E676]/10" 
                  : "bg-transparent border-[rgba(255,255,255,0.15)] text-white hover:bg-white/5"
              }`}
            >
              {me?.is_ready ? "✓ Ready to Play" : "Mark as Ready"}
            </button>

            {isHost && (
              <button
                onClick={() => {
                  audio.playVictory();
                  onStartAuction();
                }}
                className="w-full py-3 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-extrabold rounded-lg shadow-lg hover:shadow-[#00E676]/25 transition-all text-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                🚀 Start Auction
              </button>
            )}
          </div>
        </div>

        {/* Match Settings Info */}
        <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80">
          <h3 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-4">⚙️ Match Settings</h3>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-2">
              <span className="text-white/40">Starting Budget</span>
              <span className="text-white font-semibold">{formatMoney(room.settings.budget)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-2">
              <span className="text-white/40">Player Pool</span>
              <span className="text-white font-semibold">Elite Nations (12)</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-2">
              <span className="text-white/40">Roster Target</span>
              <span className="text-white font-semibold">11 + 4 Subs</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-white/40">Timer per Bid</span>
              <span className="text-white font-semibold">{room.settings.timer_duration}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel: Joined Managers Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00E676]" /> Participants
            </h2>
            <span className="bg-[#1A2129] border border-[rgba(255,255,255,0.08)] text-[10px] font-bold text-[#00E676] px-3 py-1 rounded-full uppercase">
              {room.players.length} / {room.settings.max_players} Joined
            </span>
          </div>

          {/* Grid of Players */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {room.players.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-[#1A2129]/60 border border-[rgba(255,255,255,0.04)] rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-[#00E676]/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#141A21] flex items-center justify-center text-sm font-bold text-white uppercase select-none">
                    {p.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {p.name}
                      {p.is_host && <span title="Host"><Shield className="w-3.5 h-3.5 text-[#FFD700]" /></span>}
                      {p.name === currentUsername && <span className="text-[9px] text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded-full uppercase">You</span>}
                    </span>
                    <span className="text-[10px] text-white/40">Budget: {formatMoney(p.budget)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {p.is_ready ? (
                    <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-white/30 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                      <Circle className="w-3 h-3" /> Preparing
                    </span>
                  )}

                  {/* Kick Action */}
                  {isHost && !p.is_host && (
                    <button
                      onClick={() => {
                        audio.playHammer();
                        onKickPlayer(p.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded transition-all cursor-pointer"
                    >
                      Kick
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Waiting Slots */}
            {Array.from({ length: room.settings.max_players - room.players.length }).map((_, idx) => (
              <div 
                key={`empty-${idx}`}
                className="border border-dashed border-[rgba(255,255,255,0.06)] bg-transparent rounded-xl p-4 flex items-center justify-center text-center text-xs text-white/20 uppercase tracking-widest font-semibold"
              >
                + Waiting for player
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Chat System */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6 h-[550px] lg:h-[620px]">
        <div className="glass-panel p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,255,255,0.04)]">
            <Users className="w-4 h-4 text-[#FFD700]" />
            <span className="text-xs font-bold text-white uppercase">Live Chat & Feed</span>
          </div>

          {/* Chat Feed Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs pb-4"
          >
            {chatMessages.map((msg, idx) => {
              if (msg.sender === "System") {
                return (
                  <div key={idx} className="bg-[#1A2129]/40 border border-[rgba(255,255,255,0.03)] px-3 py-2 rounded-lg text-white/50 text-[11px] leading-relaxed italic text-center">
                    {msg.text}
                  </div>
                );
              }
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
            })}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-[rgba(255,255,255,0.04)]">
            <input
              type="text"
              placeholder="Quick Message..."
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

        {/* Footer Support Buttons */}
        <div className="flex gap-4 text-xs font-semibold text-white/40 px-2 justify-between">
          <button className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
          <button className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" /> Support
          </button>
        </div>
      </div>

    </div>
  );
}
