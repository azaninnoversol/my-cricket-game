// components/TeamSelection.tsx
"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { FaSearch } from "react-icons/fa";

interface Team {
  id: string | number;
  name: string;
  flag: string;
  color: string;
  iso2?: string;
}

interface TeamSelectionProps {
  title: string;
  teams: Team[];
  selectedTeam: string | null;
  onTeamSelect: (teamName: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder: string;
  theme: "green" | "red" | "blue";
  icon: React.ReactNode;
  isAnimating: boolean;
  disabled: boolean;
  maxTeams?: number;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  title,
  teams,
  selectedTeam,
  onTeamSelect,
  searchQuery,
  onSearchChange,
  placeholder,
  theme,
  icon,
  isAnimating,
  maxTeams = 30,
  disabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const themeConfig = {
    green: {
      border: "border-green-500/30",
      gradientFrom: "from-green-900/80",
      gradientTo: "to-green-900/30",
      selectedBorder: "border-green-500",
      selectedGradient: "from-green-900/40",
      hoverBorder: "hover:border-green-400/50",
      iconGradient: "from-green-500 to-emerald-600",
      indicatorBg: "bg-green-900/50",
      indicatorColor: "bg-green-500",
      selectedColor: "text-green-400",
      searchBorder: "border-green-500/30",
      infoGradient: "from-green-900/30 to-emerald-900/20",
    },
    red: {
      border: "border-red-500/30",
      gradientFrom: "from-red-900/80",
      gradientTo: "to-red-900/30",
      selectedBorder: "border-red-500",
      selectedGradient: "from-red-900/40",
      hoverBorder: "hover:border-red-400/50",
      iconGradient: "from-red-500 to-pink-600",
      indicatorBg: "bg-red-900/50",
      indicatorColor: "bg-red-500",
      selectedColor: "text-red-400",
      searchBorder: "border-red-500/30",
      infoGradient: "from-red-900/30 to-pink-900/20",
    },
    blue: {
      border: "border-blue-500/30",
      gradientFrom: "from-blue-900/80",
      gradientTo: "to-blue-900/30",
      selectedBorder: "border-blue-500",
      selectedGradient: "from-blue-900/40",
      hoverBorder: "hover:border-blue-400/50",
      iconGradient: "from-blue-500 to-purple-600",
      indicatorBg: "bg-blue-900/50",
      indicatorColor: "bg-blue-500",
      selectedColor: "text-blue-400",
      searchBorder: "border-blue-500/30",
      infoGradient: "from-blue-900/30 to-purple-900/20",
    },
  };

  const config = themeConfig[theme];

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, maxTeams);

  useEffect(() => {
    if (cardsRef.current.length > 0) {
      setTimeout(() => {
        gsap.fromTo(
          cardsRef.current,
          { scale: 0, opacity: 0, y: 50 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "back.out(1.7)",
          },
        );
      }, 300);
    }
  }, [teams]);

  const handleCardClick = (teamName: string) => {
    if (isAnimating || disabled) return;
    onTeamSelect(teamName);

    cardsRef.current.forEach((card, index) => {
      if (card && filteredTeams[index]) {
        const isSelected = filteredTeams[index].name === teamName;

        gsap.to(card, {
          scale: isSelected ? 1.1 : 0.95,
          y: isSelected ? -10 : 0,
          backgroundColor: isSelected
            ? theme === "green"
              ? "rgba(34, 197, 94, 0.3)"
              : theme === "red"
              ? "rgba(239, 68, 68, 0.3)"
              : "rgba(59, 130, 246, 0.3)"
            : "rgba(0, 0, 0, 0.5)",
          duration: 0.3,
          ease: "power2.out",
        });

        if (isSelected) {
          gsap.to(card, {
            boxShadow:
              theme === "green"
                ? "0 0 30px rgba(34, 197, 94, 0.8)"
                : theme === "red"
                ? "0 0 30px rgba(239, 68, 68, 0.8)"
                : "0 0 30px rgba(59, 130, 246, 0.8)",
            duration: 0.5,
            yoyo: true,
            repeat: 1,
          });
        }
      }
    });
  };

  return (
    <div className="h-full">
      <div
        ref={containerRef}
        className={`bg-linear-to-br ${config.gradientFrom} ${config.gradientTo} backdrop-blur-xl rounded-3xl p-6 border-2 ${config.border} shadow-2xl h-full hide-scrollbar`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-linear-to-r ${config.iconGradient} rounded-full flex items-center justify-center`}>{icon}</div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-gray-300 text-sm">Select your playing team</p>
            </div>
          </div>

          {selectedTeam && (
            <div className={`flex items-center gap-2 ${config.indicatorBg} px-3 py-1 rounded-full`}>
              <div className={`w-3 h-3 ${config.indicatorColor} rounded-full animate-pulse`}></div>
              <span className="text-sm font-medium">Selected</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-black/50 border ${config.searchBorder} rounded-xl focus:outline-none focus:border-${theme}-500 focus:ring-1 focus:ring-${theme}-500`}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredTeams.map((team, index) => (
            <div
              key={team.id || team.name}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              onClick={() => handleCardClick(team.name)}
              className={`relative group cursor-pointer rounded-2xl p-4 transition-all duration-300 border-2 ${
                selectedTeam === team.name
                  ? `${config.selectedBorder} bg-linear-to-br ${config.selectedGradient} to-transparent scale-105`
                  : `border-white/20 ${config.hoverBorder}`
              } backdrop-blur-sm overflow-hidden`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-linear-to-br ${team.color} opacity-20 rounded-2xl`}></div>

              {/* Selection indicator */}
              {selectedTeam === team.name && (
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center animate-pulse"
                  style={{
                    backgroundColor: theme === "green" ? "#22c55e" : theme === "red" ? "#ef4444" : "#3b82f6",
                  }}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              )}

              <div className="relative z-10">
                <div className="flex flex-col items-center">
                  {/* Flag Image */}
                  <div className="w-16 h-16 mb-2 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center bg-gray-800">
                    {team.flag ? (
                      <Image
                        src={team.flag}
                        alt={team.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://flagcdn.com/w320/${team.iso2?.toLowerCase() || "us"}.png`;
                        }}
                      />
                    ) : (
                      <span className="text-3xl">🏴</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-center truncate w-full">{team.name}</span>
                  <span className="text-xs text-gray-300 mt-1">International</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedTeam && (
          <div className="mt-4 p-3 bg-linear-to-r rounded-xl border ${config.infoGradient} border-${theme}-500/30">
            <div className="flex items-center justify-between" onClick={() => onTeamSelect("")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30">
                  {filteredTeams.find((t) => t.name === selectedTeam)?.flag ? (
                    <Image
                      src={filteredTeams.find((t) => t.name === selectedTeam)?.flag || ""}
                      alt={selectedTeam}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏴</div>
                  )}
                </div>
                <div>
                  <div className="font-bold">{selectedTeam}</div>
                  <div className="text-xs text-gray-300">{title}</div>
                </div>
              </div>
              <div className={`${config.selectedColor}`}>{theme === "green" ? "✓" : theme === "red" ? "⚔️" : "⭐"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelection;
