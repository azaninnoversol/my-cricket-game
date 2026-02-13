"use client";

import React from "react";
import { useGLTF } from "@react-three/drei";

const Stadium = () => {
  const { scene } = useGLTF("/models/stadium.glb");
  return <primitive object={scene} rotation={[0, 1.57, 0]} position={[0, 0.8, 0]} scale={3.5} receiveShadow />;
};

export default React.memo(Stadium);
