"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";

import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

function Skull({ scrollY }: { scrollY: number }) {
  const { scene, animations } = useGLTF("/models/man_in_suit.glb");
  const skullRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // clamp scrollY between 0 and 1
    const t = Math.min(Math.max(scrollY, 0), 1);

    // find bones
    const head = scene.getObjectByName("Head_08");
    console.log(head, "head");
    const neck = scene.getObjectByName("Neck2_07"); //if it exists as a bone
    console.log(neck, "neck");

    console.log(scene);

    if (head) {
      head.rotation.x = -0.1 * t; // tilt head slightly up
      head.rotation.z = 0.05 * t; // tilt sideways
    }
    if (neck) {
      neck.rotation.x = -0.02 * t; // tiny neck tilt for more natural smile
    }
  }, [scrollY, scene]);

  //   useEffect(() => {
  //     // traverse the scene to find meshes with morph targets
  //     scene.traverse((obj: any) => {
  //       if (obj.isMesh) {
  //         console.log(obj.name, "name");
  //         console.log(obj.morphTargetDictionary, "morphTargetDictionary");

  //         // try to find smile morph target
  //         const smileIndex = obj.morphTargetDictionary?.Smile ?? obj.morphTargetDictionary?.smile ?? obj.morphTargetDictionary?.MouthSmile;

  //         if (smileIndex !== undefined) {
  //           // clamp scrollY between 0 and 1
  //           const clampedValue = Math.min(Math.max(scrollY, 0), 1);
  //           obj.morphTargetInfluences[smileIndex] = clampedValue;
  //         }
  //       }
  //     });
  //   }, [scrollY, scene]);

  useEffect(() => {
    if (!skullRef.current) return;
    skullRef.current.scale.set(4, 4, 4);
    gsap.to(skullRef.current.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  return <primitive ref={skullRef} object={scene} position={[0, -2.5, 0]} />;
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
    <section style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
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

useGLTF.preload("/models/man_in_suit.glb");
