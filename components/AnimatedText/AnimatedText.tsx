// components/typography/AnimatedText.tsx
"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(TextPlugin, ScrollTrigger);

// Types
export type TextAnimationType = "fade" | "slide" | "typewriter" | "scale" | "stagger" | "mask-reveal" | "gradient-slide";

export type TextVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "lead" | "caption";

interface AnimatedTextProps {
  children: string | React.ReactNode;
  variant?: TextVariant;
  animation?: TextAnimationType;
  delay?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
  className?: string;
  color?: string;
  onAnimationComplete?: () => void;
}

type GSAPCallback = gsap.Callback | (() => void) | undefined;

const variantStyles: Record<TextVariant, string> = {
  h1: "max-sm:text-4xl text-6xl md:text-8xl font-bold tracking-tight",
  h2: "max-sm:text-3xl text-5xl md:text-6xl font-bold",
  h3: "max-sm:text-2xl text-4xl md:text-5xl font-semibold",
  h4: "max-sm:text-xl text-3xl md:text-4xl font-semibold",
  h5: "max-sm:text-lg text-2xl md:text-3xl font-medium",
  h6: "text-xl md:text-2xl font-medium",
  body: "max-sm:text-sm text-base md:text-lg",
  lead: "text-xl md:text-2xl",
  caption: "text-sm text-gray-600",
};

export default function AnimatedText({
  children,
  variant = "body",
  animation = "fade",
  delay = 0,
  duration = 1,
  stagger = 0.1,
  once = true,
  className = "",
  color,
  onAnimationComplete,
}: AnimatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!textRef.current) return;

    const ctx = gsap.context(() => {
      const element = textRef.current;
      if (!element) return;

      switch (animation) {
        case "fade":
          gsap.fromTo(
            element,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration,
              delay,
              ease: "power3.out",
              onComplete: onAnimationComplete as GSAPCallback,
              scrollTrigger: once
                ? {
                    trigger: element,
                    start: "top 80%",
                    toggleActions: "play none none none",
                  }
                : undefined,
            },
          );
          break;

        case "slide":
          gsap.fromTo(
            element,
            { x: -100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration,
              delay,
              ease: "power3.out",
              scrollTrigger: once
                ? {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none none",
                  }
                : undefined,
            },
          );
          break;

        case "typewriter":
          gsap.fromTo(
            element,
            { opacity: 1 },
            {
              text: { value: children as string },
              duration: duration * 1.5,
              delay,
              ease: "none",
              onComplete: onAnimationComplete as GSAPCallback,
              scrollTrigger: once
                ? {
                    trigger: element,
                    start: "top 80%",
                    toggleActions: "play none none none",
                  }
                : undefined,
            },
          );
          break;

        case "scale":
          gsap.fromTo(
            element,
            { scale: 0.8, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration,
              delay,
              ease: "back.out(1.7)",
              scrollTrigger: once
                ? {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none none",
                  }
                : undefined,
            },
          );
          break;

        case "stagger":
          // Filter out null values from charsRef
          const validChars = charsRef.current.filter((char): char is HTMLSpanElement => char !== null);

          if (validChars.length > 0) {
            gsap.fromTo(
              validChars,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: stagger,
                delay,
                ease: "power3.out",
                scrollTrigger: once
                  ? {
                      trigger: element,
                      start: "top 80%",
                      toggleActions: "play none none none",
                    }
                  : undefined,
                onComplete: onAnimationComplete as GSAPCallback,
              },
            );
          }
          break;

        case "mask-reveal":
          gsap.fromTo(
            element,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration,
              delay,
              ease: "power3.inOut",
              scrollTrigger: once
                ? {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none none",
                  }
                : undefined,
            },
          );
          break;

        case "gradient-slide":
          gsap.fromTo(
            element,
            { backgroundPosition: "200% center" },
            {
              backgroundPosition: "0% center",
              duration: duration * 1.5,
              delay,
              ease: "power2.inOut",
              scrollTrigger: once
                ? {
                    trigger: element,
                    start: "top 80%",
                    toggleActions: "play none none none",
                  }
                : undefined,
            },
          );
          break;
      }
    }, textRef);

    return () => ctx.revert();
  }, [animation, children, delay, duration, stagger, once, onAnimationComplete]);

  const splitTextIntoChars = (text: string): ReactNode[] => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        ref={(el) => {
          charsRef.current[index] = el;
        }}
        className="inline-block"
        style={{ color }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  const renderContent = (): ReactNode => {
    if (animation === "stagger") {
      return splitTextIntoChars(children as any);
    }
    return children;
  };

  const baseClasses = variantStyles[variant];
  const gradientClass =
    animation === "gradient-slide"
      ? "bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto]"
      : "";

  return (
    <div
      ref={textRef}
      className={`${baseClasses} ${gradientClass} ${className}`}
      style={color && animation !== "gradient-slide" ? { color } : animation === "gradient-slide" ? { backgroundSize: "200% auto" } : {}}
    >
      {renderContent()}
    </div>
  );
}
