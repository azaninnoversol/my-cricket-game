"use client";
import React, { useRef, Suspense, useState, useEffect, useCallback } from "react";

// Animations Lib
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

// components
import Loader from "@/components/Loader/Loader";
import { showError } from "@/components/Toast/Toast";
import Stadium from "@/components/Stadium/Stadium";
import Batter from "@/components/Batter/Batter";
import CricketBall from "@/components/CricketBall/CricketBall";
import Stumps from "@/components/Stumps/Stumps";
import RightSideVerticalBoundary from "@/components/RightSideVerticalBoundary/RightSideVerticalBoundary";

// service
import GameService, { UpdatedData } from "@/utils/services/services";

// Modal
import Swal from "sweetalert2";

// utils
import { localStorageHelper } from "@/utils/helper-functions/helper-functions";

// next
import { useRouter } from "next/navigation";

export interface HitData {
  time: number;
  power: number;
  wickets?: number;
  type: "SHOT" | "DEFENSE";
  runs?: number;
  Totalruns?: number;
  ballsFaced?: number;
  status?: "ACHIEVED" | "NOT_ACHIEVED" | "LOST" | "ON_GOING";
}

const PerspectivePitch = ({ isOut }: { isOut: boolean }) => {
  return (
    <group position={[5, 12.4, 1]}>
      <Stumps position={[-18.5, 0, 0]} isOut={isOut} />
      <Stumps position={[8.5, 0, 0]} isOut={false} />
    </group>
  );
};

const BatHitZone = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position} visible={false}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="red" wireframe transparent opacity={0.3} />
    </mesh>
  );
};

const zones = [
  { id: 6, center: new THREE.Vector3(0, 100, 0), width: 10, depth: 10 },
  { id: 4, center: new THREE.Vector3(0, 80, 0), width: 10, depth: 10 },
  { id: 3, center: new THREE.Vector3(0, 60, 0), width: 15, depth: 15 },
  { id: 2, center: new THREE.Vector3(0, 40, 0), width: 10, depth: 10 },
  { id: 1, center: new THREE.Vector3(0, 20, 0), width: 15, depth: 15 },
];

export default function CricketGame() {
  const [hitData, setHitData] = useState<HitData>({
    runs: 0,
    Totalruns: 0,
    ballsFaced: 0,
    wickets: 0,
    status: "ON_GOING",
    time: Date.now(),
    power: 0,
    type: "SHOT",
  });

  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);
  const [showHitZone, setShowHitZone] = useState(false);
  const [isOut, setIsOut] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [balls, setBalls] = useState<any>("");

  const router = useRouter();
  const hasPostedRef = useRef(false);
  const batterRef = useRef<any>(null);
  const prevHitDataRef = useRef<HitData>(hitData);

  const calculateRunsByHeight = (ballPos: THREE.Vector3) => {
    if (ballPos.y > 60) return 6;
    if (ballPos.y > 50) return 4;
    if (ballPos.y > 40) return 3;
    if (ballPos.y > 30) return 2;
    return 1;
  };

  const fetchGameByUserId = useCallback(async () => {
    const user = localStorageHelper.getItem("users");
    const userId = user?.profile?.id;

    try {
      const res = await fetch(`/api/game-setup?userId=${userId}`);
      const data = await res.json();

      if (data?.data) {
        setGameState(data.data);
        setHitData({
          runs: data.data.score || 0,
          Totalruns: data.data.score || 0,
          ballsFaced: data.data.ballsFaced || 0,
          wickets: data.data.wickets || 0,
          status: data.data.status || "ON_GOING",
          time: Date.now(),
          power: 0,
          type: "SHOT",
        });
      }
    } catch (err) {
      console.error("Error fetching game:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onHit = (power: number, type: "SHOT" | "DEFENSE") => {
    if (!isReady || isGameOver) return;
    if (!isGameStarted) setIsGameStarted(true);

    setHitData((prev) => ({
      ...prev,
      time: Date.now(),
      power,
      type,
    }));
  };

  const handleWicket = () => {
    setIsOut(true);
    setHitData((prev) => ({ ...prev, wickets: (prev?.wickets || 0) + 1 }));
    setTimeout(() => setIsOut(false), 2000);
  };

  const fetchSpecificMatch = async (userId: string, gameId: string) => {
    const res = await fetch(`/api/play-match?userId=${userId}&&gameId=${gameId}`);
    const result = await res.json();
    return result.data;
  };

  const getBallLeft = () => {
    if (!gameState || !hitData) return 0;
    const totalBalls = (gameState.overs || 0) * 6;
    return totalBalls - (hitData.ballsFaced || 0);
  };

  const deleteMatch = async () => {
    await fetch("/api/play-match", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: gameState?.userId, gameId: gameState?.id }),
    });
  };

  const showResultModal = (title: string, text: string, icon: "success" | "error" | "info") => {
    Swal.fire({
      title,
      text,
      icon,
      background: "#1f2933",
      color: "#fff",
      backdrop: "rgba(0,0,0,0.85)",
      showConfirmButton: true,
      confirmButtonText: "Close",
      confirmButtonColor: "#2563eb",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(async (result) => {
      if (result?.isConfirmed) {
        await fetch(`/api/game-setup`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: gameState?.id }),
        });
        Swal.close();
        router.back();
      }
    });
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (!isGameStarted || !hitData || !gameState) return;

    const prev = prevHitDataRef.current;
    const hasMeaningfulChange = prev.Totalruns !== hitData.Totalruns || prev.ballsFaced !== hitData.ballsFaced || prev.wickets !== hitData.wickets;
    if (!hasMeaningfulChange) return;
    prevHitDataRef.current = hitData;

    const saveGame = async () => {
      const ballsFaced = hitData.ballsFaced || 0;
      const completedOvers = Math.floor(ballsFaced / 6);
      const ballsInCurrentOver = ballsFaced % 6;
      const overs = parseFloat(`${completedOvers}.${ballsInCurrentOver}`);
      setBalls(overs);
      const status: "achieved" | "not-achieved" | "ongoing" =
        Number(hitData.Totalruns) >= gameState?.target
          ? "achieved"
          : overs >= gameState?.overs || Number(hitData.wickets) >= gameState?.maxPlayer
          ? "not-achieved"
          : "ongoing";

      const gameData: UpdatedData = {
        gameId: gameState.id,
        userId: gameState.userId,
        yourTeam: gameState.yourTeam,
        opponentTeam: gameState.opponentTeam,
        overs,
        score: Number(hitData.Totalruns),
        status,
        target: gameState.target,
        wickets: Number(hitData.wickets),
      };

      try {
        if (!hasPostedRef.current) {
          const res = await GameService.addMatch(gameData);
          if (res?.success && res?.data?.id) {
            hasPostedRef.current = true;

            // const latest = await fetchSpecificMatch(gameData.userId, gameData.gameId);
            // if (latest) setGameState(latest);
          }
        } else {
          if (gameData.gameId) {
            await GameService.updateGame({ ...gameData, thisGameId: gameData.gameId });
          }
        }
      } catch (err: any) {
        console.error("Error saving game:", err);
        showError(err?.message || "Error saving game", "Error");
      }
    };

    saveGame();
  }, [hitData, gameState, isGameStarted]);

  useEffect(() => {
    if (!hitData || !gameState || hitData.ballsFaced === 0) return;
    const ballsLeft = gameState.overs * 6 - Number(hitData.ballsFaced);

    (async () => {
      if (Number(hitData.Totalruns) >= gameState.target) {
        setIsGameOver(true);
        showResultModal("🎉 YOU WON!", "Congratulations! You have achieved the target.", "success");
        await deleteMatch();
      } else if (ballsLeft === 0) {
        setTimeout(() => {
          setIsGameOver(true);
          showResultModal("❌ YOU LOST", "Balls are finished and you couldn't achieve the target.", "error");
        }, 2500);
        await deleteMatch();
      } else if (Number(hitData.wickets) >= gameState.maxPlayer) {
        setIsGameOver(true);
        showResultModal("❌ ALL OUT", "All wickets have fallen.", "error");
        await deleteMatch();
      }
    })();
  }, [hitData, gameState]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const latest = await fetchSpecificMatch(gameState?.userId, gameState?.id);
      if (latest) {
        setGameState(latest);
      }
      await fetchGameByUserId();
      setIsLoading(false);
    })();
  }, [fetchGameByUserId]);

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader size={140} color="white" />
      </div>
    );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <h1 className="text-white text-9xl font-black italic animate-pulse">{countdown}</h1>
        </div>
      )}

      <div className="absolute top-8 left-10 z-20 text-white">
        <div className="bg-[#333333]/90 p-4 rounded-xl border-2 border-gray-600 text-xl font-black italic uppercase">
          <h2 className="text-[#FFEB3B]/80">Overs: {balls}</h2>
          <h2 className="text-[#FFEB3B]">
            TARGET: {gameState?.target} <strong>Score: {hitData?.Totalruns}</strong>
          </h2>
          <p>BALLS LEFT: {getBallLeft()}</p>
          <p>WICKETS LEFT: {gameState?.maxPlayer - Number(hitData?.wickets)}</p>
        </div>
      </div>

      <Suspense fallback={null}>
        {isReady && <RightSideVerticalBoundary hitData={hitData} zones={zones} />}
        <Canvas shadows>
          <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
          <PerspectiveCamera makeDefault position={[0, 22, 30]} fov={40} rotation={[-0.1, 0, 0]} />
          <PerspectivePitch isOut={isOut} />

          <Batter refForward={batterRef} position={[-10, 13, 1.5]} onHit={onHit} isReady={isReady || isLoading} />
          <CricketBall
            position={[14, 18, 1.5]}
            hitData={hitData}
            isReady={isReady || !isLoading}
            batterRef={batterRef}
            calculateRuns={calculateRunsByHeight}
            setHitData={setHitData}
            onWicket={handleWicket}
            isGameOver={isGameOver}
          />
          <Stadium />

          {showHitZone && <BatHitZone position={[-9.5, 14, 1.8]} />}
          <Environment preset="apartment" />
        </Canvas>
      </Suspense>

      <div className="absolute bottom-8 w-full flex justify-center items-center gap-8 z-20 text-white font-black text-3xl italic">
        <span>{gameState?.yourTeam}</span>
        <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-sm border-2">VS</div>
        <span>{gameState?.opponentTeam}</span>
      </div>

      <div className="absolute bottom-4 left-4 z-20 text-white/70 text-sm">
        <p className="text-yellow-400 font-bold">TIPS:</p>
        <p>1. Press W/Space For Hitting</p>
        <p>2. Press S for defense</p>

        <button className="mt-2 px-3 py-1 bg-blue-600 rounded text-xs" onClick={() => setShowHitZone(!showHitZone)}>
          {showHitZone ? "Hide Hit Zone" : "Show Hit Zone"}
        </button>
      </div>
    </div>
  );
}
