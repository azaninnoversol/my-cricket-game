"use client";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  animation?: "focusScale" | "shake" | "underlineGrow" | "fadeIn" | "pulse";
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ animation = "focusScale", error, className = "", type, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  useEffect(() => {
    if (animation === "fadeIn" && inputRef.current) {
      gsap.from(inputRef.current, { opacity: 0, y: -10, duration: 0.5 });
    }

    if (animation === "underlineGrow" && underlineRef.current) {
      gsap.fromTo(underlineRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left", duration: 0.5 });
    }
  }, [animation]);

  useEffect(() => {
    if (error && animation === "shake" && inputRef.current) {
      gsap.fromTo(inputRef.current, { x: -5 }, { x: 5, duration: 0.1, repeat: 5, yoyo: true });
    }

    if (error && errorRef.current) {
      gsap.fromTo(errorRef.current, { opacity: 0, y: -5 }, { opacity: 1, y: 0, duration: 0.4 });
    }
  }, [error, animation]);

  const handleFocus = () => {
    if (animation === "focusScale" && inputRef.current) {
      gsap.to(inputRef.current, { scale: 1.05, duration: 0.2 });
    }
  };

  const handleBlur = () => {
    if (animation === "focusScale" && inputRef.current) {
      gsap.to(inputRef.current, { scale: 1, duration: 0.2 });
    }
  };

  return (
    <div className="relative w-full">
      <input
        {...props}
        ref={inputRef}
        type={isPassword && showPassword ? "text" : type}
        onFocus={(e) => {
          handleFocus();
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          handleBlur();
          props.onBlur?.(e);
        }}
        className={`w-full px-4 py-2 pr-10 rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300
          ${error ? "border-red-500" : ""} ${className}`}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}

      {animation === "underlineGrow" && <div ref={underlineRef} className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 origin-left scale-x-0" />}

      {error && (
        <div ref={errorRef} className="mt-1 text-sm text-red-500 font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default React.memo(Input);
