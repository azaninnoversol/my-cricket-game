"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle, CSSProperties, ReactNode, MouseEvent } from "react";
import gsap from "gsap";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
export type ButtonSize = "small" | "medium" | "large";
export type AnimationType = "pulse" | "bounce" | "wiggle" | "glow";
export type HoverEffect = "scale" | "lift" | "colorShift" | "borderGrow";

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  animationType?: AnimationType;
  hoverEffect?: HoverEffect;
  style?: CSSProperties;
  className?: string;
}

export interface AnimatedButtonRef {
  animate: (animationProps: gsap.TweenVars) => gsap.core.Tween;
  shake: () => gsap.core.Tween;
  successAnimation: () => gsap.core.Timeline;
}

type AnimationConfig = {
  hover: gsap.TweenVars;
  active: gsap.TweenVars;
};

type HoverEffectConfig = gsap.TweenVars;

const animations: Record<AnimationType, AnimationConfig> = {
  pulse: {
    hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" },
    active: { scale: 0.95 },
  },
  bounce: {
    hover: { y: -5, scale: 1.05 },
    active: { y: 0 },
  },
  wiggle: {
    hover: { rotation: 5 },
    active: { rotation: -5 },
  },
  glow: {
    hover: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
      filter: "brightness(1.1)",
    },
    active: { boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)" },
  },
};

const hoverEffects: Record<HoverEffect, HoverEffectConfig> = {
  scale: { scale: 1.05 },
  lift: { y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" },
  colorShift: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  borderGrow: {
    borderWidth: "4px",
    borderColor: "#3B82F6",
  },
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  outline: "border-2 border-blue-500 text-blue-500 bg-transparent",
  danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white",
  success: "bg-gradient-to-r from-green-500 to-teal-600 text-white",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

const sizes: Record<ButtonSize, string> = {
  small: "px-4 py-2 text-sm",
  medium: "px-6 py-3 text-base",
  large: "px-8 py-4 text-lg",
};

const baseClasses = `
  relative overflow-hidden
  font-medium rounded-lg
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
  active:transform active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
  flex items-center justify-center gap-2
`;

const AnimatedButton = forwardRef<AnimatedButtonRef, AnimatedButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "medium",
      onClick,
      disabled = false,
      fullWidth = false,
      animationType = "pulse",
      hoverEffect = "scale",
      style = {},
      className = "",
      ...props
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleRef = useRef<HTMLSpanElement | null>(null);
    const hoverTimeline = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
      const button = buttonRef.current;
      if (!button) return;

      hoverTimeline.current = gsap.timeline({ paused: true });

      if (animations[animationType]) {
        hoverTimeline.current.to(button, {
          ...animations[animationType].hover,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (hoverEffects[hoverEffect]) {
        hoverTimeline.current.to(
          button,
          {
            ...hoverEffects[hoverEffect],
            duration: 0.3,
            ease: "power2.out",
          },
          0,
        );
      }

      return () => {
        hoverTimeline.current?.kill();
      };
    }, [animationType, hoverEffect]);

    const handleMouseEnter = () => {
      if (disabled || !hoverTimeline.current) return;
      hoverTimeline.current.play();
    };

    const handleMouseLeave = () => {
      if (disabled || !hoverTimeline.current) return;
      hoverTimeline.current.reverse();
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      createRippleEffect(e);

      const button = buttonRef.current;
      if (!button) return;

      gsap.to(button, {
        ...(animations[animationType]?.active || { scale: 0.95 }),
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.1,
          });
        },
      });

      onClick?.(e);
    };

    const createRippleEffect = (event: MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (!button || rippleRef.current) return;

      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
      `;

      button.appendChild(ripple);
      rippleRef.current = ripple;

      gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          if (button.contains(ripple)) {
            button.removeChild(ripple);
          }
          rippleRef.current = null;
        },
      });
    };

    useImperativeHandle(ref, () => ({
      animate: (animationProps: gsap.TweenVars) => {
        const button = buttonRef.current;
        if (!button) {
          throw new Error("Button element not found");
        }

        return gsap.to(button, {
          duration: 0.3,
          ease: "power2.out",
          ...animationProps,
        });
      },
      shake: () => {
        const button = buttonRef.current;
        if (!button) {
          throw new Error("Button element not found");
        }

        return gsap.to(button, {
          x: 10,
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            gsap.to(button, { x: 0, duration: 0.1 });
          },
        });
      },
      successAnimation: () => {
        const button = buttonRef.current;
        if (!button) {
          throw new Error("Button element not found");
        }

        return gsap
          .timeline()
          .to(button, { scale: 1.1, duration: 0.2 })
          .to(button, {
            backgroundColor: "#10B981",
            color: "white",
            duration: 0.3,
          })
          .to(button, { scale: 1, duration: 0.2 });
      },
    }));

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        className={`
          ${baseClasses}
          ${variants[variant]}
          ${sizes[size]}
          ${widthClass}
          ${className}
          cursor-pointer
        `}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  },
);

AnimatedButton.displayName = "AnimatedButton";

// IconButton Component
interface IconButtonProps extends Omit<AnimatedButtonProps, "children"> {
  icon: ReactNode;
  label?: string;
}

export const IconButton = forwardRef<AnimatedButtonRef, IconButtonProps>(({ icon, label, ...props }, ref) => (
  <AnimatedButton ref={ref} {...props}>
    {icon}
    {label && <span>{label}</span>}
  </AnimatedButton>
));

IconButton.displayName = "IconButton";

// LoadingButton Component
interface LoadingButtonProps extends Omit<AnimatedButtonProps, "children"> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export const LoadingButton = forwardRef<AnimatedButtonRef, LoadingButtonProps>(({ loading, loadingText = "Loading...", children, ...props }, ref) => {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading && spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "linear",
      });
    }
  }, [loading]);

  return (
    <AnimatedButton ref={ref} disabled={loading} {...props}>
      {loading ? (
        <>
          <div ref={spinnerRef} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </AnimatedButton>
  );
});

LoadingButton.displayName = "LoadingButton";

// Default export with memo
export default React.memo(AnimatedButton);
