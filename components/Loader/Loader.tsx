"use client";
import React, { useEffect, useRef } from "react";

// Animation Lib
import gsap from "gsap";

interface LoaderProps {
  size?: number;
  color?: string;
}

function Loader({ size = 40, color = "#ffffff" }: LoaderProps) {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spinnerRef.current) return;

    gsap.to(spinnerRef.current, {
      rotate: 360,
      duration: 1,
      repeat: -1,
      ease: "linear",
    });
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div
        ref={spinnerRef}
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}40`,
          borderTop: `3px solid ${color}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

export default React.memo(Loader);
