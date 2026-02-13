"use client";

import React, { useCallback, useRef, useState } from "react";
import { HitData } from "@/container/Pages/GamePage";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CricketBallProps {
  position: [number, number, number];
  hitData: HitData | null;
  isReady: boolean;
  batterRef?: React.RefObject<any> | null;
  calculateRuns: (ballPos: THREE.Vector3) => void;
  setHitData?: React.Dispatch<React.SetStateAction<HitData | any>>;
  onWicket: () => void;
  isGameOver?: boolean;
}

const CricketBall: React.FC<CricketBallProps> = ({ position, hitData, isReady, batterRef, calculateRuns, setHitData, onWicket, isGameOver }) => {
  const ballRef = useRef<THREE.Group>(null);
  const [ballState, setBallState] = useState<"BOWLED" | "HIT" | "WAITING" | "IDLE">("IDLE");
  const [hasBeenCounted, setHasBeenCounted] = useState(false);

  const { scene } = useGLTF("/models/ball.glb");
  const startTime = useRef(Date.now());
  const ballVelocity = useRef(new THREE.Vector3());
  const BALL_SCALE = 0.0023;

  const hitStartHeight = useRef<number | null>(null);
  const maxAfterHitHeight = useRef<number>(0);

  const ballTypes = [
    { name: "YORKER", pitchTime: 1.0, bounceHeight: 2, speed: 22 },
    { name: "GOOD_LENGTH", pitchTime: 0.8, bounceHeight: 1.5, speed: 25 },
    { name: "SHORT_BALL", pitchTime: 0.6, bounceHeight: 1.3, speed: 18 },
  ];

  const [currentBall, setCurrentBall] = useState(ballTypes[1]);

  const resetBall = useCallback(() => {
    setBallState("IDLE");
    setCurrentBall(ballTypes[Math.floor(Math.random() * ballTypes.length)]);
    startTime.current = Date.now();
    ballVelocity.current.set(0, 0, 0);
    hitStartHeight.current = null;
    maxAfterHitHeight.current = 0;
    setHasBeenCounted(false);
    if (ballRef.current) {
      ballRef.current.position.set(...position);
    }
  }, [position]);

  const checkBatCollision = useCallback(
    (ballPos: THREE.Vector3) => {
      if (!batterRef?.current?.isSwinging) return false;

      const elapsed = Date.now() - batterRef.current.swingStartTime;
      if (elapsed < 50 || elapsed > 450) return false;

      const batX = -9.5;
      const batZ = 1.5;

      const horizontalDist = Math.hypot(ballPos.x - batX, ballPos.z - batZ);
      const correctHeight = ballPos.y > 12.5 && ballPos.y < 18.5;
      return horizontalDist < 1.8 && correctHeight;
    },
    [batterRef],
  );

  const handleBallEnd = useCallback(() => {
    setBallState("WAITING");
    if (ballRef.current) {
      ballRef.current.position.set(0, -100, 0);
    }

    setTimeout(() => {
      resetBall();
    }, 2000);
  }, []);

  const checkWicketCollision = (ballPos: THREE.Vector3) => {
    const isAtStumpsX = ballPos.x < -13.2 && ballPos.x > -13.8;
    const isAtStumpsZ = ballPos.z > 0.2 && ballPos.z < 1.8;
    const isAtStumpsY = ballPos.y > 12.4 && ballPos.y < 16.5;
    return isAtStumpsX && isAtStumpsZ && isAtStumpsY;
  };

  useFrame(() => {
    if (!isReady || !ballRef.current || ballState === "WAITING" || isGameOver) return;
    const t = (Date.now() - startTime.current) / 1000;
    const ballPos = ballRef.current.position;

    if (!hasBeenCounted && ballPos.x < -5) {
      setHasBeenCounted(true);
      setHitData?.((prev: any) => ({
        ...prev,
        ballsFaced: (prev?.ballsFaced || 0) + 1,
      }));
    }

    if (ballState === "IDLE" && hitData && checkBatCollision(ballPos)) {
      setBallState("HIT");

      hitStartHeight.current = ballPos.y;
      maxAfterHitHeight.current = ballPos.y;

      if (hitData.type === "SHOT") {
        ballVelocity.current.set(1.5 + Math.random() * 1.5, 0.8 + Math.random() * 0.7, Math.random() * 0.4);
      } else {
        ballVelocity.current.set(0.6, 0.3, 0);
      }

      startTime.current = Date.now();
      return;
    }

    if (ballState === "IDLE") {
      if (checkWicketCollision(ballPos)) {
        setBallState("BOWLED");
        onWicket();
        ballVelocity.current.set(0.5, 0.5, Math.random() - 0.5);
        startTime.current = Date.now();
        handleBallEnd();
        return;
      }
    }

    if (ballState === "HIT") {
      ballPos.add(ballVelocity.current);
      ballVelocity.current.y -= 0.012;

      maxAfterHitHeight.current = Math.max(maxAfterHitHeight.current, ballPos.y);
      const isTooHighForSix = ballPos.y > 65;
      const isOutOfBounds = ballPos.x > 120 || ballPos.y < 11 || ballPos.x < -40;

      if (isTooHighForSix || isOutOfBounds) {
        let runs = (isTooHighForSix ? 6 : calculateRuns(ballPos)) as number;

        setHitData?.((prev: any) => {
          const safePrev = prev || { time: Date.now(), type: "SHOT", Totalruns: 0 };
          const newTotal = (safePrev.Totalruns || 0) + runs;

          return {
            ...safePrev,
            runs: runs,
            Totalruns: newTotal,
          };
        });
        handleBallEnd();
      }
      return;
    }

    const currentX = 14 - t * currentBall.speed;
    ballPos.x = currentX;

    if (t < currentBall.pitchTime) {
      ballPos.y = 18 - (t / currentBall.pitchTime) * 5.6;
    } else {
      ballPos.y = 12.4 + (t - currentBall.pitchTime) * currentBall.bounceHeight * 6;
    }

    if (currentX < -25) handleBallEnd();
  });

  return <primitive ref={ballRef} object={scene} scale={BALL_SCALE} castShadow />;
};

export default React.memo(CricketBall);
