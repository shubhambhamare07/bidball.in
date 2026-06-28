"use client";

import React, { useState, useEffect } from "react";
import { getSocket } from "../utils/socket";
import { audio } from "../utils/audio";
import { Room, RoomPlayer, Player, ChatMessage, LiveBid } from "../types";
import Header from "../components/Header";
import HomeView from "../components/HomeView";
import CreateRoomView from "../components/CreateRoomView";
import JoinRoomView from "../components/JoinRoomView";
import LobbyView from "../components/LobbyView";
import AuctionView from "../components/AuctionView";
import TransferView from "../components/TransferView";
import BoostView from "../components/BoostView";
import PitchView from "../components/PitchView";
import FinalizedView from "../components/FinalizedView";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const [currentView, setCurrentView] = useState<
    "home" | "create" | "join" | "lobby" | "auction" | "transfers" | "boosts" | "pitch" | "completed"
  >("home");
  
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [muteState, setMuteState] = useState(false);

  // Live auction states
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [proposals, setProposals] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const [initialJoinCode, setInitialJoinCode] = useState("");

  const socket = getSocket();

  // Handle URL query parameters for quick joining
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get("join");
      if (joinCode) {
        setInitialJoinCode(joinCode.toUpperCase());
        setCurrentView("join");
      }
    }
  }, []);

  // Set up socket listeners
  useEffect(() => {
    socket.on("create_room_response", (res: any) => {
      if (res.success) {
        setRoom(res.room);
        setUsername(res.room.host_name);
        setCurrentView("lobby");
      } else {
        alert("Failed to create room.");
      }
    });

    socket.on("join_room_response", (res: any) => {
      if (res.success) {
        setRoom(res.room);
        setCurrentView("lobby");
      } else {
        alert(res.reason || "Failed to join room.");
        setCurrentView("home");
      }
    });

    socket.on("room_update", (data: any) => {
      setRoom(data.room);
      // Sync client budget
      const me = data.room.players.find((p: any) => p.name === username);
      if (me) {
        // Budget sync
      }
    });

    socket.on("room_status_change", (data: any) => {
      if (data.status === "auction") {
        setCurrentView("auction");
        audio.playVictory(); // Kickoff sound
      } else if (data.status === "transfers") {
        setCurrentView("transfers");
        audio.playPop();
      } else if (data.status === "boosts") {
        setCurrentView("boosts");
        audio.playPop();
      } else if (data.status === "completed") {
        setCurrentView("completed");
      }
    });

    socket.on("new_player", (data: any) => {
      setCurrentPlayer(data.player);
      setHighestBid(data.starting_price);
      setHighestBidder(null);
      setTimeRemaining(data.time_remaining);
      audio.playWhistle();
      if (data.player && data.player.tier === "Tier S") {
        setTimeout(() => {
          audio.playCheer();
        }, 300);
      }
    });

    socket.on("timer_tick", (data: any) => {
      setTimeRemaining(data.time_remaining);
    });

    socket.on("bid_update", (data: any) => {
      setHighestBid(data.current_bid);
      setHighestBidder(data.highest_bidder);
      setTimeRemaining(data.time_remaining);
      audio.playCoin();
    });

    socket.on("player_sold", (data: any) => {
      audio.playHammer();
      audio.playCheer();
      // Update roster list
      const messageText = `SOLD! ${data.player.name} purchased by ${data.winner} for ${formatMoney(data.price)}`;
      appendSystemMessage(messageText, "bid");
    });

    socket.on("player_unsold", (data: any) => {
      if (!data.skipped) {
        audio.playHammer();
      }
      const messageText = data.skipped 
        ? `SKIPPED: ${data.player.name} was skipped by the host.`
        : `UNSOLD: ${data.player.name} went without any bids.`;
      appendSystemMessage(messageText, "bid");
    });

    socket.on("new_message", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on("new_transfer_offer", (proposal: any) => {
      setProposals((prev) => [...prev, proposal]);
      audio.playPop();
    });

    socket.on("transfer_resolved", (data: any) => {
      setProposals((prev) =>
        prev.map((p) => (p.id === data.proposal_id ? { ...p, status: data.status } : p))
      );
      if (data.status === "accepted") {
        audio.playCoin();
      }
    });

    socket.on("boost_resolved", (data: any) => {
      audio.playCoin();
    });

    socket.on("boost_error", (data: any) => {
      alert(data.reason);
    });

    socket.on("match_ended", (data: any) => {
      setLeaderboard(data.leaderboard);
      setCurrentView("completed");
    });

    socket.on("kicked", (data: any) => {
      alert(data.reason);
      setRoom(null);
      setCurrentView("home");
    });

    return () => {
      socket.off("create_room_response");
      socket.off("join_room_response");
      socket.off("room_update");
      socket.off("room_status_change");
      socket.off("new_player");
      socket.off("timer_tick");
      socket.off("bid_update");
      socket.off("player_sold");
      socket.off("player_unsold");
      socket.off("new_message");
      socket.off("new_transfer_offer");
      socket.off("transfer_resolved");
      socket.off("boost_resolved");
      socket.off("boost_error");
      socket.off("match_ended");
      socket.off("kicked");
    };
  }, [username]);

  const appendSystemMessage = (text: string, type: any = "chat") => {
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "System",
        text,
        type,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleCreateRoom = (data: any) => {
    setUsername(data.display_name);
    if (!socket.connected) {
      socket.connect();
      socket.once("connect", () => {
        socket.emit("create_room", data);
      });
    } else {
      socket.emit("create_room", data);
    }
  };

  const handleJoinRoom = (displayName: string, roomCode: string) => {
    setUsername(displayName);
    if (!socket.connected) {
      socket.connect();
      socket.once("connect", () => {
        socket.emit("join_room", { display_name: displayName, room_code: roomCode });
      });
    } else {
      socket.emit("join_room", { display_name: displayName, room_code: roomCode });
    }
  };

  const handleToggleReady = () => {
    socket.emit("toggle_ready", {});
  };

  const handleStartAuction = () => {
    if (room) {
      socket.emit("start_auction", { room_code: room.room_code });
    }
  };

  const handleKickPlayer = (name: string) => {
    if (room) {
      socket.emit("kick_player", { room_code: room.room_code, target_name: name });
    }
  };

  const handlePlaceBid = (amount: number) => {
    if (room) {
      socket.emit("place_bid", { room_code: room.room_code, amount });
    }
  };

  const handleSkipPlayer = () => {
    if (room) {
      socket.emit("skip_player", {});
    }
  };

  const handleForceEndAuction = () => {
    if (room) {
      socket.emit("force_end_auction", {});
    }
  };

  const handleSendMessage = (text: string) => {
    if (room) {
      socket.emit("chat_message", { room_code: room.room_code, text });
    }
  };

  const handleProposeTransfer = (data: any) => {
    if (room) {
      socket.emit("propose_transfer", {
        room_code: room.room_code,
        receiver: data.receiver,
        send_player: data.send_player,
        receive_player: data.receive_player,
        cash: data.cash,
      });
    }
  };

  const handleResolveOffer = (proposalId: string, action: "accept" | "reject") => {
    if (room) {
      socket.emit("resolve_transfer", {
        room_code: room.room_code,
        proposal_id: proposalId,
        action,
      });
    }
  };

  const handlePurchaseBoost = (boostName: string, footballerName?: string) => {
    if (room) {
      socket.emit("purchase_boost", {
        room_code: room.room_code,
        boost_name: boostName,
        footballer_name: footballerName,
      });
    }
  };

  const handleFinishBoosts = () => {
    if (room) {
      socket.emit("finish_boosts", {});
    }
  };

  const handleFinishWindow = () => {
    if (room) {
      socket.emit("finish_window", { room_code: room.room_code });
    }
  };

  const handlePlayAgain = () => {
    audio.playClick();
    if (room) {
      // Re-create the lobby room
      socket.emit("create_room", {
        display_name: username,
        room_name: room.room_name,
        settings: room.settings,
      });
    }
  };

  const handleGoHome = () => {
    audio.playClick();
    socket.disconnect();
    setRoom(null);
    setChatMessages([]);
    setCurrentView("home");
  };

  const handleToggleMute = () => {
    const isMuted = audio.toggleMute();
    setMuteState(isMuted);
  };

  const formatMoney = (val: number) => {
    return (val / 1000000).toLocaleString() + "M Euros";
  };

  // Get current user's profile to display budget in header
  const myProfile = room?.players.find((p) => p.name === username);

  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (isMaintenance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0F12] text-white p-6 relative overflow-hidden select-none">
        {/* Background Atmosphere */}
        <div style={{ position: "absolute", top: "-150px", left: "-150px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 215, 0, 0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: "-150px", right: "-150px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 230, 118, 0.03) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
        <div className="pitch-lines" style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none", zIndex: 1 }} />

        <div className="relative z-10 text-center max-w-md flex flex-col items-center">
          <span className="material-symbols-outlined text-[#FFD700] text-6xl font-bold mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-4">
            STADIUM CLOSED
          </h1>
          <p className="text-[#00E676] text-xs font-black tracking-widest uppercase mb-6">
            Pitch Maintenance in Progress
          </p>
          
          <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
            We are currently rolling the grass and checking the spotlights to make sure the next tournament draft runs smoothly. BidBall will be back online shortly.
          </p>

          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[#00E676] animate-spin">autorenew</span>
            <span className="text-[10px] text-white/50 font-black uppercase tracking-wider">
              Auto-checking stadium status...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0F12]">
      {/* Header */}
      <Header
        username={username || undefined}
        budget={myProfile?.budget}
        muteState={muteState}
        onToggleMute={handleToggleMute}
        currentView={currentView}
        onNavigate={(v: any) => {
          if (v === "home") handleGoHome();
          else setCurrentView(v);
        }}
      />

      {/* Main View Transition Frame */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full flex justify-center"
          >
            {currentView === "home" && (
              <HomeView
                onCreateRoomClick={() => {
                  setCurrentView("create");
                  if (!socket.connected) socket.connect();
                }}
                onJoinRoomClick={() => {
                  setCurrentView("join");
                  if (!socket.connected) socket.connect();
                }}
              />
            )}

            {currentView === "create" && (
              <CreateRoomView
                onBack={() => setCurrentView("home")}
                onCreateRoom={handleCreateRoom}
              />
            )}

            {currentView === "join" && (
              <JoinRoomView
                onBack={() => setCurrentView("home")}
                onJoinRoom={handleJoinRoom}
                initialRoomCode={initialJoinCode}
              />
            )}

            {currentView === "lobby" && room && (
              <LobbyView
                room={room}
                currentUsername={username}
                chatMessages={chatMessages}
                onToggleReady={handleToggleReady}
                onStartAuction={handleStartAuction}
                onKickPlayer={handleKickPlayer}
                onSendMessage={handleSendMessage}
              />
            )}

            {currentView === "auction" && room && (
              <AuctionView
                player={currentPlayer}
                timeRemaining={timeRemaining}
                highestBid={highestBid}
                highestBidder={highestBidder}
                playersList={room.players}
                currentUsername={username}
                chatMessages={chatMessages}
                onBid={handlePlaceBid}
                onSendMessage={handleSendMessage}
                onSkipPlayer={handleSkipPlayer}
                onForceEndAuction={handleForceEndAuction}
                roundDuration={room.settings.timer_duration}
              />
            )}

            {currentView === "transfers" && room && (
              <TransferView
                currentUsername={username}
                playersList={room.players}
                proposals={proposals}
                onPropose={handleProposeTransfer}
                onResolveOffer={handleResolveOffer}
                onFinishWindow={handleFinishWindow}
              />
            )}

            {currentView === "boosts" && room && (
              <BoostView
                currentUsername={username}
                playersList={room.players}
                onPurchaseBoost={handlePurchaseBoost}
                onFinishBoosts={handleFinishBoosts}
                onNavigateToPitch={() => setCurrentView("pitch")}
              />
            )}

            {currentView === "pitch" && room && (
              <PitchView
                currentUsername={username}
                playersList={room.players}
                onBack={() => {
                  const s = room.status;
                  if (s === "transfers") setCurrentView("transfers");
                  else if (s === "boosts") setCurrentView("boosts");
                  else if (s === "completed") setCurrentView("completed");
                  else setCurrentView("auction");
                }}
                onNavigateToBoosts={() => setCurrentView("boosts")}
              />
            )}

            {currentView === "completed" && room && (
              <FinalizedView
                leaderboard={leaderboard}
                winnerName={leaderboard[0]?.name || null}
                onPlayAgain={handlePlayAgain}
                onGoHome={handleGoHome}
                currentUsername={username}
                room={room}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[rgba(255,255,255,0.06)] bg-[#0A0D10]/50 py-6 text-center text-xs text-white/30 font-medium">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
          <span>Global Football Auction 2026</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Tournament Rules</a>
          </div>
          <span>© 2026 GLOBAL FOOTBALL AUCTION. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}
