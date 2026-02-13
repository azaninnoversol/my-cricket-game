// components/typography/index.tsx
"use client";

import AnimatedText, { TextAnimationType, TextVariant } from "./AnimatedText";

interface TypographyProps {
  children: string;
  animation?: TextAnimationType;
  delay?: number;
  className?: string;
  color?: string;
  onAnimationComplete?: () => void;
}

export function AnimatedH1({ children, animation = "fade", delay = 0, className = "", color, onAnimationComplete }: TypographyProps) {
  return (
    <h1 className={className}>
      <AnimatedText variant="h1" animation={animation} delay={delay} color={color} onAnimationComplete={onAnimationComplete} className="inline-block">
        {children}
      </AnimatedText>
    </h1>
  );
}

export function AnimatedH2({ children, animation = "slide", delay = 0.1, className = "", color, onAnimationComplete }: TypographyProps) {
  return (
    <h2 className={className}>
      <AnimatedText variant="h2" animation={animation} delay={delay} color={color} onAnimationComplete={onAnimationComplete} className="inline-block">
        {children}
      </AnimatedText>
    </h2>
  );
}

export function AnimatedH3({ children, animation = "scale", delay = 0.2, className = "", color, onAnimationComplete }: TypographyProps) {
  return (
    <h3 className={className}>
      <AnimatedText variant="h3" animation={animation} delay={delay} color={color} onAnimationComplete={onAnimationComplete} className="inline-block">
        {children}
      </AnimatedText>
    </h3>
  );
}

export function AnimatedBody({ children, animation = "fade", delay = 0.3, className = "", color, onAnimationComplete }: TypographyProps) {
  return (
    <p className={className}>
      <AnimatedText
        variant="body"
        animation={animation}
        delay={delay}
        color={color}
        onAnimationComplete={onAnimationComplete}
        className="inline-block"
      >
        {children}
      </AnimatedText>
    </p>
  );
}

export function AnimatedLead({ children, animation = "stagger", delay = 0.2, className = "", color, onAnimationComplete }: TypographyProps) {
  return (
    <p className={className}>
      <AnimatedText
        variant="lead"
        animation={animation}
        delay={delay}
        stagger={0.03}
        color={color}
        onAnimationComplete={onAnimationComplete}
        className="inline-block"
      >
        {children}
      </AnimatedText>
    </p>
  );
}

export function AnimatedCaption({ children, animation = "fade", delay = 0.4, className = "", color, onAnimationComplete }: TypographyProps) {
  return (
    <p className={className}>
      <AnimatedText
        variant="caption"
        animation={animation}
        delay={delay}
        color={color}
        onAnimationComplete={onAnimationComplete}
        className="inline-block"
      >
        {children}
      </AnimatedText>
    </p>
  );
}

export { AnimatedText };
