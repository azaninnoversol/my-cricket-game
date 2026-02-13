"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface BatterProps {
  position?: [number, number, number] | null;
  onHit: (power: number, type: "SHOT" | "DEFENSE") => void;
  isReady: boolean;
  refForward?: React.Ref<THREE.Group>;
}

const Batter: React.FC<BatterProps> = ({ onHit, isReady, refForward }) => {
  const { scene, animations } = useGLTF("/models/batter.glb");

  const { actions, names } = useAnimations(animations, scene);
  const [isBusy, setIsBusy] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);
  const [swingStartTime, setSwingStartTime] = useState<number | null>(null);
  const [batPosition, setBatPosition] = useState<[number, number, number]>([-10, 13.5, 1.5]);

  const keyPressed = useRef<boolean>(false);
  const lastSwingTime = useRef<number>(0);
  const SWING_COOLDOWN = 300;

  useEffect(() => {
    if (actions && names[1]) {
      actions[names[1]]?.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  const playAction = useCallback(
    (index: number, speed: number, type: "SHOT" | "DEFENSE") => {
      const now = Date.now();

      if (now - lastSwingTime.current < SWING_COOLDOWN) {
        return;
      }

      if (isReady && !isBusy && actions && names[index]) {
        setIsBusy(true);
        setIsSwinging(true);
        setSwingStartTime(now);
        lastSwingTime.current = now;

        const action = actions[names[index]]!;
        action.reset().setEffectiveTimeScale(speed).setLoop(THREE.LoopOnce, 1).play();
        action.clampWhenFinished = true;

        const power = type === "SHOT" ? 0.4 + Math.random() * 0.5 : 0.01 + Math.random() * 0.6;
        onHit(power, type);

        if (type === "SHOT") {
          setBatPosition([-9.5, 0, 0]);
        } else {
          setBatPosition([-9.7, 13.8, 1.6]);
        }

        setTimeout(() => {
          setIsSwinging(false);
          setSwingStartTime(null);
        }, 250);

        setTimeout(() => {
          setIsBusy(false);
          setBatPosition([-10, 13.5, 1.5]);

          action.fadeOut(0.3);
          if (names[1]) actions[names[1]]?.reset().fadeIn(0.3).play();
        }, 600);
      }
    },
    [actions, names, isBusy, isReady, onHit],
  );

  useEffect(() => {
    if (refForward && typeof refForward === "object") {
      (refForward as React.MutableRefObject<any>).current = {
        isSwinging,
        swingStartTime,
        batPosition,
      };
    }
  }, [refForward, isSwinging, swingStartTime, batPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keyPressed.current) return;

      keyPressed.current = true;

      if (e.code === "Space" || e.key.toLowerCase() === "w") {
        playAction(0, 6, "SHOT");
      }
      if (e.key.toLowerCase() === "s") {
        playAction(0, 5, "DEFENSE");
      }
    };

    const handleKeyUp = () => {
      keyPressed.current = false;
    };

    const handleMouseDown = () => {
      if (!keyPressed.current) {
        keyPressed.current = true;
        playAction(0, 6, "SHOT");
      }
    };

    const handleMouseUp = () => {
      keyPressed.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [playAction]);

  return <primitive object={scene} position={[-10, 13, 0.9]} rotation={[0, Math.PI / 1.8, 0]} scale={4} castShadow />;
};

export default React.memo(Batter);
