"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";

import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

function Skull({ scrollY }: { scrollY: number }) {
  const { scene } = useGLTF("/models/skull.glb");
  const skullRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((obj: any) => {
      if (obj.type === "Audio" || obj.type === "PositionalAudio") {
        obj.stop?.();
        obj.parent?.remove(obj);
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!skullRef.current) return;
    skullRef.current.rotation.y = -Math.PI / 1.5;
    skullRef.current.scale.set(0.9, 0.9, 0.9);
    gsap.to(skullRef.current.scale, {
      x: 0.26,
      y: 0.26,
      z: 0.26,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  useEffect(() => {
    if (!skullRef.current) return;

    const targetRotation = -Math.PI / 2 + scrollY * (Math.PI / 2);
    gsap.to(skullRef.current.rotation, {
      y: targetRotation,
      duration: 0.2,
      ease: "power1.out",
    });
  }, [scrollY]);

  return <primitive ref={skullRef} object={scene} />;
}

function Page() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = (e: WheelEvent) => {
      setScrollY((prev) => {
        let next = prev + e.deltaY * 0.001;
        if (next > 1) next = 1;
        if (next < 0) next = 0;
        return next;
      });
    };

    window.addEventListener("wheel", onScroll, { passive: true });
    return () => window.removeEventListener("wheel", onScroll);
  }, []);

  return (
    <section style={{ width: "100vw", height: "100vh", backgroundColor: "black" }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 0, 5]} intensity={2} />
        <Suspense fallback={null}>
          <Skull scrollY={scrollY} />
        </Suspense>
      </Canvas>
    </section>
  );
}

export default React.memo(Page);

useGLTF.preload("/models/skull.glb");
