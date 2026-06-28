"use client";

import React, { useEffect, useState, useRef } from "react";
import { Download, Trophy, Share2, Send, Check, RefreshCw, Home, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { audio } from "../utils/audio";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
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
  const exportCardRef = useRef<HTMLDivElement>(null);

  // Trigger victory sound and confetti upon loading
  useEffect(() => {
    audio.playVictory();
    audio.playCheer();
    
    if (leaderboard.length > 0) {
      setExpandedRow(leaderboard[0].name);
    }
    
    // Confetti loop
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#00E676", "#FFD700", "#ffffff", "#2979FF"]
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
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
    return `€${(val / 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}M`;
  };

  const toggleRow = (name: string) => {
    audio.playPop();
    setExpandedRow(expandedRow === name ? null : name);
  };

  // Find user details
  const me = room.players.find((p) => p.name === currentUsername);
  const rank = leaderboard.findIndex((e) => e.name === currentUsername) + 1;

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
  const bargain = squad.length > 0 ? squad.reduce((best, f) => {
    if (!best) return f;
    const ratioF = f.rating / Math.max(1, f.starting_price);
    const ratioBest = best.rating / Math.max(1, best.starting_price);
    return ratioF > ratioBest ? f : best;
  }, squad[0]) : null;

  // Local country emoji mapping to prevent cross-origin flag issues during downloads
  const getCountryEmoji = (countryName: string) => {
    const map: Record<string, string> = {
      Argentina: "🇦🇷",
      Brazil: "🇧🇷",
      France: "🇫🇷",
      Spain: "🇪🇸",
      Portugal: "🇵🇹",
      Germany: "🇩🇪",
      England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      Italy: "🇮🇹",
      Netherlands: "🇳🇱",
      Belgium: "🇧🇪",
      Croatia: "🇭🇷",
      Uruguay: "🇺🇾",
      Senegal: "🇸🇳",
      Morocco: "🇲🇦",
      Japan: "🇯🇵",
      USA: "🇺🇸",
    };
    return map[countryName] || "⚽";
  };

  // FUT badge tier helper styles
  const getTierBadgeStyles = (tier: string) => {
    if (tier.toLowerCase().includes("1") || tier.toLowerCase().includes("s")) {
      return {
        border: "2px solid #FFD700",
        color: "#FFD700",
        bg: "rgba(255, 215, 0, 0.1)",
        glow: "0 0 15px rgba(255, 215, 0, 0.25)"
      };
    }
    if (tier.toLowerCase().includes("2") || tier.toLowerCase().includes("a")) {
      return {
        border: "1px solid #00E676",
        color: "#00E676",
        bg: "rgba(0, 230, 118, 0.1)",
        glow: "0 0 10px rgba(0, 230, 118, 0.15)"
      };
    }
    return {
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#FFFFFF",
      bg: "rgba(255, 255, 255, 0.03)",
      glow: "none"
    };
  };

  // Mini vector player silhouette SVG for cards to bypass remote image loading taints
  const MiniPlayerSilhouette = ({ tierColor }: { tierColor: string }) => (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", opacity: 0.65 }}>
      <defs>
        <radialGradient id={`glow-${tierColor}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={tierColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="55" r="30" fill={`url(#glow-${tierColor})`} />
      <path 
        d="M50 22 A 10 10 0 1 0 50 42 A 10 10 0 1 0 50 22 Z M34 72 C 34 56, 66 56, 66 72 Z" 
        fill={tierColor} 
        opacity="0.8" 
      />
    </svg>
  );

  // Sorting 11 starting players dynamically by rating
  const startingXI = [...squad].sort((a, b) => b.rating - a.rating).slice(0, 11);

  // Handle high resolution PNG downloads
  const handleDownloadCard = async () => {
    if (!exportCardRef.current) return;
    audio.playClick();
    setIsGenerating(true);
    
    try {
      await document.fonts.ready;
      
      const dataUrl = await toPng(exportCardRef.current, {
        quality: 1.0,
        pixelRatio: 2.0, // 2x export resolution for crisp text (1080x1440)
        cacheBust: true,
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `BidBall_Squad_${currentUsername}.png`;
      link.click();
      audio.playCoin();
    } catch (err) {
      console.error("PNG export failed", err);
      alert("Error generating card image. Please screenshot your dashboard to share!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Native share sheet handler with file attachments
  const handleSystemShare = async () => {
    audio.playClick();
    if (!exportCardRef.current) return;
    
    try {
      setIsGenerating(true);
      await document.fonts.ready;
      
      const dataUrl = await toPng(exportCardRef.current, {
        quality: 0.95,
        pixelRatio: 1.5,
        cacheBust: true
      });
      
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `BidBall_Squad_${currentUsername}.png`, { type: "image/png" });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "BidBall Squad Challenge",
          text: `🏆 I just won the Bidball Football Auction! Think you can build a better squad? Play now: https://bidball.vercel.app`,
          url: "https://bidball.vercel.app"
        });
      } else {
        handleDownloadCard();
        handleCopyResultLink();
        alert("Downloaded your squad image card! Share it with the link on your feed.");
      }
    } catch (err) {
      console.error("System share failed, falling back", err);
      handleDownloadCard();
      handleCopyResultLink();
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy result sharing link
  const handleCopyResultLink = () => {
    audio.playPop();
    const shareText = `🏆 I just won the Bidball Football Auction! Can you build a better squad than mine? Play here: https://bidball.vercel.app`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Social sharing templates
  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🏆 I finished Rank #${rank} in Bidball Football Auction! Can you beat my squad? My stats: ${avgOvr} OVR, ${totalFantasy} PTS. Play now: `)}&url=${encodeURIComponent("https://bidball.vercel.app")}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(`🏆 I just won the Bidball Football Auction! Can you build a better squad than mine? Play here: https://bidball.vercel.app`)}`;

  // Custom social fallback routes (Downloads the image first and opens link)
  const handleSocialShareFallback = (url: string) => {
    audio.playClick();
    handleDownloadCard();
    setTimeout(() => {
      window.open(url, "_blank");
    }, 1500);
  };

  const instagramShareFallback = () => {
    handleSocialShareFallback("https://www.instagram.com");
  };

  const snapchatShareFallback = () => {
    handleSocialShareFallback("https://www.snapchat.com");
  };

  // Reusable 1080x1440 layout component
  const renderCardBody = () => (
    <div 
      style={{
        width: "1080px",
        height: "1440px",
        background: "linear-gradient(180deg, #0D121F 0%, #05070D 100%)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,800&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .font-barlow {
          font-family: 'Barlow Condensed', sans-serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .pitch-lines-bg {
          background-image: radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .gradient-gold-text {
          background: linear-gradient(135deg, #ffe088 0%, #e9c349 50%, #775e00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .premium-shield {
          clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
        }
      `}} />

      {/* Stadium Vector Shadows & Line Overlays */}
      <div className="pitch-lines-bg" style={{ position: "absolute", inset: 0, opacity: 0.25, pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", top: "-150px", left: "-150px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: "-150px", right: "-150px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 230, 118, 0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 2 }} />

      {/* 1. Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "42px", color: "#FFD700", fontVariationSettings: "'FILL' 1" }}>trophy</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="font-barlow" style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "2.5px", color: "#FFFFFF" }}>GLOBAL FOOTBALL AUCTION 2026</span>
            <span className="font-inter" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "4px", color: "#00E676", textTransform: "uppercase" }}>World Cup Edition</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "8px 18px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#FFD700", fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          <span className="font-barlow" style={{ fontSize: "14px", fontWeight: 900, color: "#ffe088", letterSpacing: "1.5px", textTransform: "uppercase" }}>Gold Champion</span>
        </div>
      </div>

      {/* 2. Manager Profile Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 10, marginTop: "16px" }}>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          <div className="premium-shield" style={{ width: "95px", height: "120px", background: "linear-gradient(135deg, #1C2230 0%, #0D111A 100%)", border: "2px solid #e9c349", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
            <span className="font-barlow" style={{ fontSize: "13px", fontWeight: 800, color: "#ffe088", lineHeight: 1 }}>OVR</span>
            <span className="font-barlow" style={{ fontSize: "44px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1, marginTop: "4px" }}>{avgOvr}</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", textTransform: "uppercase" }}>Championship Squad</span>
            <span className="font-barlow" style={{ fontSize: "48px", fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase", lineHeight: 1.0, marginTop: "6px", letterSpacing: "0.5px" }}>
              {room.room_name || `${currentUsername}'s FC`}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
              <span style={{ fontSize: "26px" }}>{getCountryEmoji(squad[0]?.country || "Argentina")}</span>
              <span className="font-inter" style={{ fontSize: "14px", fontWeight: 800, color: "#00E676" }}>Managed by {currentUsername}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.2)", padding: "8px 18px", borderRadius: "14px" }}>
            <span className="font-barlow" style={{ fontSize: "24px", fontWeight: 900, color: "#00E676", letterSpacing: "1px" }}>FINAL RANK #1</span>
          </div>
          <div className="gradient-gold-text font-barlow" style={{ fontSize: "76px", fontWeight: 900, fontStyle: "italic", lineHeight: 1, marginTop: "4px" }}>
            {totalFantasy} PTS
          </div>
        </div>
      </div>

      {/* 3. Stats Columns */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "26px 36px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", width: "100%", boxSizing: "border-box", zIndex: 10, marginTop: "16px" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>BUDGET SPENT</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF" }}>{formatMoney(moneySpent)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>REMAINING</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#00E676" }}>{formatMoney(me?.budget || 0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>SQUAD VALUE</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF" }}>{formatMoney(moneySpent + (me?.budget || 0))}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>AUCTION WINS</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF" }}>{squad.length} PLAYERS</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>AVERAGE BID</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF" }}>{formatMoney((room.settings.budget - (me?.budget || 0)) / Math.max(1, squad.length))}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>BOOSTS USED</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#adc7ff" }}>{me?.boosts_purchased.length || 0} ITEMS</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>BEST PICK</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#00E676", textTransform: "uppercase" }}>{bargain ? bargain.name.split(" ").pop() : "NONE"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>SQUAD MVP</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#FFD700", textTransform: "uppercase" }}>{mvp ? mvp.name.split(" ").pop() : "NONE"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.5px" }}>EFFICIENCY %</span>
            <span className="font-inter" style={{ fontSize: "13px", fontWeight: 800, color: "#00E676" }}>
              {Math.min(100, Math.round((Number(avgOvr) + (me?.chemistry_score || 0)) * 0.95))}%
            </span>
          </div>
        </div>

      </div>

      {/* 4. Starting XI 4x3 Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", width: "100%", zIndex: 10, marginTop: "16px" }}>
        {Array.from({ length: 11 }).map((_, idx) => {
          const p = startingXI[idx];
          if (!p) {
            // Render beautiful dashed Empty Card
            return (
              <div 
                key={`empty-${idx}`}
                style={{
                  height: "175px",
                  borderRadius: "18px",
                  border: "2px dashed rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.01)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  opacity: 0.35
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "rgba(255,255,255,0.4)" }}>add_circle</span>
                <span className="font-inter" style={{ fontSize: "9px", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: "6px", letterSpacing: "0.5px" }}>Empty Slot</span>
              </div>
            );
          }

          const tierClass = getTierBadgeStyles(p.tier);
          
          return (
            <div 
              key={idx}
              style={{
                height: "175px",
                borderRadius: "18px",
                border: tierClass.border,
                background: "rgba(13, 18, 31, 0.7)",
                backdropFilter: "blur(8px)",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                boxSizing: "border-box",
                overflow: "hidden",
                boxShadow: tierClass.glow
              }}
            >
              {/* Top Row: position and rating */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span className="font-barlow" style={{ fontSize: "16px", fontWeight: 900, color: tierClass.color }}>{p.rating}</span>
                <span className="font-inter" style={{ fontSize: "8px", fontWeight: 900, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "6px", textTransform: "uppercase" }}>{p.position}</span>
              </div>

              {/* Silhouette SVG */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "65px" }}>
                <div style={{ width: "65px", height: "65px" }}>
                  <MiniPlayerSilhouette tierColor={tierClass.color} />
                </div>
              </div>

              {/* Bottom Row: Name and Flag */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <span className="font-barlow" style={{ fontSize: "12px", fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", textAlign: "center" }}>
                  {p.name.split(" ").pop()}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                  <span style={{ fontSize: "14px" }}>{getCountryEmoji(p.country)}</span>
                  <span className="font-inter" style={{ fontSize: "8px", fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>{p.country.slice(0, 3).toUpperCase()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 12th Block: Professional QR Code & CTA Widget Card */}
        <div 
          style={{
            height: "175px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #0A2619 0%, #030F0A 100%)",
            border: "2px solid rgba(0, 230, 118, 0.2)",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box",
            textAlign: "center",
            boxShadow: "0 0 15px rgba(0, 230, 118, 0.15)"
          }}
        >
          <span className="font-inter" style={{ fontSize: "9px", fontWeight: 900, color: "#00E676", letterSpacing: "1px", textTransform: "uppercase" }}>Scan to Play</span>
          
          <div style={{ background: "#FFFFFF", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
            <QRCodeSVG 
              value="https://bidball.vercel.app" 
              size={85} 
              level="M" 
              includeMargin={false}
            />
          </div>
          
          <span className="font-inter" style={{ fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Think you can beat me?</span>
        </div>

      </div>

      {/* 5. Footer branding */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px", marginTop: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="font-barlow" style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "1px", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "#00E676", fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
            BIDBALL<span style={{ color: "#00E676" }}>.in</span>
          </span>
          <span className="font-inter" style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", marginTop: "4px" }}>
            © 2026 World Draft League • All Rights Reserved
          </span>
        </div>
        
        <div style={{ textAlign: "right" }}>
          <span className="font-inter" style={{ fontSize: "14px", fontWeight: 800, color: "#00E676", letterSpacing: "0.5px" }}>bidball.vercel.app</span>
          <p className="font-inter" style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "2px", fontWeight: 500 }}>Think you can beat my squad? Play now.</p>
        </div>
      </div>

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
              <span className="text-sm sm:text-base font-black text-[#FFD700] block truncate max-w-[120px]">{p1.name}</span>
              <span className="text-xs font-black text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.2)]">{p1.score} pts</span>
            </div>
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
              Tournament Share Card
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
            {/* On-Screen Card Preview (Scales down a 1080x1440 layout responsively) */}
            <div className="relative w-[280px] h-[373px] sm:w-[360px] sm:h-[480px] overflow-hidden rounded-[24px] border border-white/10 shadow-2xl flex-shrink-0 bg-[#05070D]">
              <div 
                className="absolute top-0 left-0 origin-top-left scale-[0.2592] sm:scale-[0.33333]" 
                style={{ width: "1080px", height: "1440px" }}
              >
                {renderCardBody()}
              </div>
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
                  📸 Instagram Story
                </button>
                <button 
                  onClick={snapchatShareFallback}
                  className="py-3 text-center bg-[#FFFC00] text-black hover:bg-[#e6e200] rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all"
                >
                  👻 Snapchat
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[9px]">
                <button 
                  onClick={() => handleSocialShareFallback(whatsappShare)}
                  className="py-3 text-center bg-[#25D366] text-[#0A0D10] hover:bg-[#20ba5a] rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center"
                >
                  💬 WhatsApp
                </button>
                <button 
                  onClick={() => handleSocialShareFallback(twitterShare)}
                  className="py-3 text-center bg-slate-900 border border-white/10 hover:border-white/20 text-white rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center"
                >
                  🐦 Share to X
                </button>
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

          {/* Absolute Off-Screen Container: Rendered at exactly 1080x1440 for html-to-image exports */}
          <div style={{ position: "fixed", top: "-9999px", left: "-9999px", pointerEvents: "none", zIndex: -100 }}>
            <div ref={exportCardRef}>
              {renderCardBody()}
            </div>
          </div>

        </div>
      )}

      {/* Standings Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 mb-10 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-lg font-black text-white uppercase tracking-tight font-headline-md font-barlow">Final Leaderboard Standings</h2>
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
          <table className="w-full text-left text-xs border-collapse font-inter">
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
                const playerAvgOvr = entry.squad_size > 0 ? (entry.total_rating / entry.squad_size).toFixed(1) : "0.0";
                
                return (
                  <React.Fragment key={entry.name}>
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

                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-950/40 border-b border-white/5 px-6 py-5">
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white/90 font-semibold"
                          >
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Team Summary</span>
                              <div className="my-2">
                                <span className="text-xl font-black text-white block">{playerAvgOvr} OVR</span>
                                <span className="text-[9px] text-white/40 font-bold">Average Squad Rating</span>
                              </div>
                              <span className="text-[9px] text-[#00E676] font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Base score: {entry.score} pts
                              </span>
                            </div>

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

                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Best Bargain</span>
                              <div className="my-2">
                                <span className="text-xs font-black text-white truncate block">{entry.best_purchase || "None"}</span>
                                <span className="text-[9px] text-[#00E676] font-bold block mt-0.5">High rating / low bid</span>
                              </div>
                              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Scouting report</span>
                            </div>

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
