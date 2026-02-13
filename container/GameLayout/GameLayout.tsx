"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaVolumeHigh, FaVolumeOff } from "react-icons/fa6";
import { showError } from "@/components/Toast/Toast";
import { MUSIC } from "@/utils/resourses";
import { localStorageHelper } from "@/utils/helper-functions/helper-functions";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

interface GameLayoutProps {
  children: React.ReactNode;
}

function GameLayout({ children }: GameLayoutProps) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const volumeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();

  const router = useRouter();
  let volume = 0.2;
  // let volume = 0;

  useEffect(() => {
    if (audioRef.current) {
      console.log("Initializing audio...");
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      audioRef.current.preload = "auto";

      audioRef.current.load();

      setTimeout(() => {
        if (audioRef.current) {
          console.log("Attempting autoplay...");
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio autoplay successful!");
              })
              .catch((error) => {
                console.error("Autoplay blocked, waiting for user interaction :", error);
              });
          }
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUserInteracted && audioRef.current) {
        console.log("User interacted, attempting to play audio...");
        setHasUserInteracted(true);

        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio started after user interaction");
            })
            .catch((error) => {
              console.error("Play failed even after interaction:", error);
            });
        }
      }
    };

    const events = ["click", "touchstart", "touchend", "keydown", "mousedown", "mouseup", "scroll"];

    events.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, {
        once: true,
        passive: true,
      });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [hasUserInteracted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (volumeRef.current) {
      gsap.fromTo(
        volumeRef.current,
        { scale: 0, opacity: 0, rotation: -180 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
      );
    }

    timelineRef.current = gsap.timeline({ paused: true });

    if (iconRef.current) {
      timelineRef.current
        .to(iconRef.current, {
          scale: 1.5,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(iconRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "power2.in",
        });
    }

    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <FaVolumeOff size={40} className="text-white" />;
    }
    return <FaVolumeHigh size={40} className="text-white" />;
  };

  const toggleMute = () => {
    if (!hasUserInteracted && audioRef.current) {
      setHasUserInteracted(true);

      audioRef.current
        .play()
        .then(() => {
          setIsMuted(!isMuted);
        })
        .catch((error) => {
          console.error("Failed to start audio:", error);
        });
    } else {
      setIsMuted(!isMuted);
    }

    timelineRef.current?.restart();

    if (volumeRef.current) {
      gsap.to(volumeRef.current, {
        scale: 1.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          const color = !isMuted ? "#ef4444" : "#22c55e";
          gsap.to(volumeRef.current, {
            backgroundColor: color,
            duration: 0.3,
            onComplete: () => {
              gsap.to(volumeRef.current, {
                backgroundColor: "rgba(31, 41, 55, 0.5)",
                duration: 0.5,
              });
            },
          });
        },
      });
    }
  };

  const handleMouseEnter = () => {
    if (volumeRef.current) {
      gsap.to(volumeRef.current, {
        scale: 1.2,
        backgroundColor: "rgba(31, 41, 55, 0.8)",
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (volumeRef.current) {
      gsap.to(volumeRef.current, {
        scale: 1,
        backgroundColor: "rgba(31, 41, 55, 0.5)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const waves = [1, 2, 3];

  const ArrayTwenty = [...Array(20)];

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (result.success) {
      router.push("/");
      localStorageHelper.clear();
    } else {
      showError("Logout!", "Logout failed, try again.");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPage = pathname === "/game";

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-900 to-black">
      <audio ref={audioRef} src={MUSIC.musicOne} loop preload="auto" className="hidden" />

      {!isPage && (
        <div title="Volume" className="absolute right-8 top-5 flex items-start gap-4 z-50">
          <div
            ref={volumeRef}
            className="relative group cursor-pointer bg-gray-800/60 backdrop-blur-sm rounded-full p-4 border-2 border-white/30 transition-all duration-300 hover:scale-110 hover:bg-gray-800/80 active:scale-95"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={toggleMute}
            style={{
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div ref={iconRef} className="relative">
              {getVolumeIcon()}

              {!isMuted && volume > 0 && (
                <div className="absolute inset-0">
                  {waves?.map((wave) => (
                    <div
                      key={wave}
                      className="absolute inset-0 border-2 border-blue-400/40 rounded-full animate-ping"
                      style={{
                        animationDelay: `${wave * 0.2}s`,
                        animationDuration: `${1 + wave * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isPage && (
        <div
          title="Logout"
          className="absolute right-8 top-28 flex items-start gap-4 z-50 group cursor-pointer bg-gray-800/60 backdrop-blur-sm rounded-full p-4 border-2 border-white/30 transition-all duration-300 hover:scale-110 hover:bg-gray-800/80 active:scale-95"
          onClick={handleLogout}
        >
          <LogOut className="text-white" size={40} />
        </div>
      )}

      <div>{children}</div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {mounted &&
          ArrayTwenty?.map((_, i) => (
            <div
              key={`dynamic__${i}`}
              className="absolute w-1 h-1 bg-linear-to-r from-blue-400/30 to-purple-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 3}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
      </div>
    </div>
  );
}

export default React.memo(GameLayout);
