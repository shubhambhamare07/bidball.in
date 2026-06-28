"use client";

import React, { useState } from "react";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { audio } from "../utils/audio";

interface CreateRoomViewProps {
  onBack: () => void;
  onCreateRoom: (data: {
    display_name: string;
    room_name: string;
    settings: {
      budget: number;
      timer_duration: number;
      boosts_enabled: boolean;
      transfers_enabled: boolean;
      auction_order: string;
    };
  }) => void;
}

export default function CreateRoomView({ onBack, onCreateRoom }: CreateRoomViewProps) {
  const [displayName, setDisplayName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [budget, setBudget] = useState(1000000000); // 1B Euros default
  const [timer, setTimer] = useState(30); // 30s default
  const [boostsEnabled, setBoostsEnabled] = useState(true);
  const [transfersEnabled, setTransfersEnabled] = useState(true);
  const [auctionOrder, setAuctionOrder] = useState("Random");
  const [poolSelection, setPoolSelection] = useState("Elite Nations (12)");

  const formatSliderValue = (val: number) => {
    if (val >= 1000000000) {
      return `€${(val / 1000000000).toFixed(1).replace(".0", "")}B`;
    }
    return `€${val / 1000000}M`;
  };

  const handleGenerate = () => {
    if (!displayName.trim()) {
      alert("Please enter a Display Name.");
      return;
    }
    audio.playClick();
    onCreateRoom({
      display_name: displayName,
      room_name: roomName || `${displayName}'s Tournament`,
      settings: {
        budget,
        timer_duration: timer,
        boosts_enabled: boostsEnabled,
        transfers_enabled: transfersEnabled,
        auction_order: auctionOrder,
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 relative z-10">
      <div className="glass-panel p-8 md:p-12 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#12161A]/80 shadow-2xl flex flex-col md:flex-row gap-10">
        
        {/* Left Form */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 uppercase tracking-tight">
              Host Your Tournament
            </h1>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">
              Configure the rules of engagement and generate your exclusive auction room.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
                👤 Display Name
              </label>
              <input
                type="text"
                placeholder="Manager_X"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-4 py-3 rounded-lg text-sm transition-all"
              />
            </div>

            {/* Room Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
                🏰 Room Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Champions Draft 2026"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-4 py-3 rounded-lg text-sm transition-all"
              />
            </div>
          </div>

          {/* Player Pool Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
              ⚽ Player Pool Selection
            </label>
            <select
              value={poolSelection}
              onChange={(e) => setPoolSelection(e.target.value)}
              className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-4 py-3 rounded-lg text-sm transition-all cursor-pointer"
            >
              <option value="Elite Nations (12)">Elite Nations (12 Nations - 180 Players)</option>
              <option value="Top Nations (24)">Top Nations (24 Nations)</option>
            </select>
          </div>

          {/* Starting Budget */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
                💰 Starting Budget
              </label>
              <span className="text-white font-extrabold">{formatSliderValue(budget)}</span>
            </div>
            <input
              type="range"
              min="500000000"
              max="2000000000"
              step="50000000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#00E676] bg-[#1A2129] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[rgba(255,255,255,0.3)]">
              <span>€500M</span>
              <span>€2B</span>
            </div>
          </div>

          {/* Auction Timer & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Auction Timer */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
                ⏱️ Auction Timer
              </label>
              <div className="flex gap-2">
                {[15, 30, 60].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setTimer(t);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      timer === t
                        ? "bg-[#00E676] border-[#00E676] text-[#0A0D10]"
                        : "bg-[#1A2129] border-[rgba(255,255,255,0.08)] text-white/70 hover:text-white"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Auction Order */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
                🔄 Auction Order
              </label>
              <div className="flex gap-2">
                {["Random", "Position"].map((order) => (
                  <button
                    key={order}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setAuctionOrder(order === "Position" ? "Position Wise" : "Random");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      (order === "Position" ? "Position Wise" : "Random") === auctionOrder
                        ? "bg-[#00E676] border-[#00E676] text-[#0A0D10]"
                        : "bg-[#1A2129] border-[rgba(255,255,255,0.08)] text-white/70 hover:text-white"
                    }`}
                  >
                    {order}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Boost Cards Toggle */}
          <div className="flex items-center justify-between bg-[#1A2129]/60 p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white uppercase tracking-tight">⚡ Allow Boost Cards</span>
              <span className="text-[10px] text-[rgba(255,255,255,0.4)]">Enable tactical bonuses like Captain, Playmaker</span>
            </div>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setBoostsEnabled(!boostsEnabled);
              }}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                boostsEnabled ? "bg-[#00E676]" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  boostsEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={handleGenerate}
              className="flex-1 py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-extrabold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" /> Generate Room
            </button>
            <button
              onClick={() => {
                audio.playClick();
                onBack();
              }}
              className="py-4 px-6 border border-[rgba(255,255,255,0.08)] bg-[#1A2129]/50 hover:bg-[#1A2129] text-white font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[1px] bg-[rgba(255,255,255,0.06)]" />

        {/* Right Access Code View */}
        <div className="w-full md:w-[300px] flex flex-col items-center justify-center gap-6">
          <span className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
            Room Access Code
          </span>
          
          <div className="w-full bg-[#1A2129] border-2 border-dashed border-[rgba(255,255,255,0.15)] rounded-xl py-6 flex items-center justify-center">
            <span className="text-4xl font-extrabold tracking-widest text-[#00E676] text-glow-green uppercase">
              Awaiting
            </span>
          </div>

          {/* QR Code Placeholder */}
          <div className="w-48 h-48 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2129]/50 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="w-10 h-10 border-2 border-dashed border-white/20 rounded flex items-center justify-center text-white/20">
              QR
            </div>
            <span className="text-[10px] text-white/30 font-medium leading-tight">
              Awaiting Generation
            </span>
          </div>
          
          <span className="text-[10px] text-[rgba(255,255,255,0.3)] text-center leading-normal">
            🔒 End-to-end encrypted lobby. No login required.
          </span>
        </div>

      </div>
    </div>
  );
}
