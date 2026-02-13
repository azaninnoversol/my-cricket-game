"use client";

import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Stumps = ({ position, isOut }: { position: [number, number, number]; isOut: boolean }) => {
  const bail1Ref = useRef<THREE.Mesh>(null);
  const bail2Ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!isOut) {
      if (bail1Ref.current) {
        bail1Ref.current.position.set(0, 3.55, -0.32);
        bail1Ref.current.rotation.set(Math.PI / 2, 0, 0);
      }
      if (bail2Ref.current) {
        bail2Ref.current.position.set(0, 3.55, 0.32);
        bail2Ref.current.rotation.set(Math.PI / 2, 0, 0);
      }
    }
  }, [isOut]);

  useFrame((state, delta) => {
    if (isOut) {
      if (bail1Ref.current && bail1Ref.current.position.y > 0.2) {
        bail1Ref.current.position.y -= 5 * delta;
        bail1Ref.current.position.x -= 2 * delta;
        bail1Ref.current.rotation.x += 5 * delta;
        bail1Ref.current.rotation.z += 3 * delta;
      }

      if (bail2Ref.current && bail2Ref.current.position.y > 0.2) {
        bail2Ref.current.position.y -= 5 * delta;
        bail2Ref.current.position.x -= 2.5 * delta;
        bail2Ref.current.rotation.x -= 5 * delta;
        bail2Ref.current.rotation.z -= 3 * delta;
      }
    }
  });

  return (
    <group position={position}>
      {[-0.6, 0, 0.6].map((zOffset, i) => (
        <mesh key={i} position={[0, 1.75, zOffset]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 3.5, 16]} />
          <meshStandardMaterial color="#d40000" roughness={0.5} />
        </mesh>
      ))}

      <mesh ref={bail1Ref} position={[0, 3.55, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>

      <mesh ref={bail2Ref} position={[0, 3.55, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
    </group>
  );
};

export default React.memo(Stumps);
