"use client";
import React, { useState, useRef, useEffect } from "react";
import { IMAGES } from "@/utils/resourses";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { FaTrophy, FaPlay, FaTimes } from "react-icons/fa";
import { GiCricketBat } from "react-icons/gi";
import { BiCricketBall } from "react-icons/bi";
import { BASE_URL } from "@/config";
import Image from "next/image";
import TeamSelection from "@/components/TeamSelection";
import { OVERS, needThisTeam, TEAM_COLORS } from "@/utils/mockData";
import { localStorageHelper } from "@/utils/helper-functions/helper-functions";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { X } from "lucide-react";
const MySwal = withReactContent(Swal);
export interface PayloadGame {
  userId?: string;
  yourTeam: string;
  opponentTeam: string;
  overs: number | string;
  maxPlayer: number | string;
  target: number | string;
  status?: "PENDING" | "IN-PROGRESS" | "COMPLETED";
  started_at?: Date | null;
}

function SelectTeam() {
  const router = useRouter();
  const [selectedYourTeam, setSelectedYourTeam] = useState<string | null>(null);
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<string | null>(null);
  const [selectedOver, setSelectedOver] = useState<number>(3);
  const [isAnimating, setIsAnimating] = useState(false);
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryOpponent, setSearchQueryOpponent] = useState("");
  const [showSameTeamAlert, setShowSameTeamAlert] = useState(false);
  const [resumeModalGame, setResumeModalGame] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const yourTeamCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const opponentTeamCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const overButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const cricketBallRef = useRef<HTMLDivElement>(null);
  const vsAnimationRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const isSameTeam = selectedYourTeam && selectedOpponentTeam && selectedYourTeam === selectedOpponentTeam;

  const getFormattedCountries = (countries: any[]) => {
    if (!countries || countries.length === 0) return [];

    const filteredCountries = countries.filter((country) => needThisTeam.includes(country?.name));

    return filteredCountries.map((country, index) => {
      let flagUrl = country?.flag;

      if (flagUrl && !flagUrl.startsWith("http") && !flagUrl.startsWith("data:")) {
        if (flagUrl.includes("flagcdn") || flagUrl.includes("flagsapi")) {
        } else if (flagUrl.startsWith("/")) {
          flagUrl = `https://flagcdn.com${flagUrl}`;
        } else {
          flagUrl = `https://flagcdn.com/w320/${flagUrl.toLowerCase()}.png`;
        }
      }

      return {
        ...country,
        id: country?.id || index + 1,
        flag: flagUrl || `https://flagcdn.com/w320/${country?.iso2?.toLowerCase() || "us"}.png`,
        name: country?.name || `Country ${index + 1}`,
        color: TEAM_COLORS[index % TEAM_COLORS.length],
      };
    });
  };

  const formattedCountries = getFormattedCountries(allCountries);

  useEffect(() => {
    fetch(BASE_URL)
      .then((res) => res?.json())
      .then((data) => {
        if (data?.data) {
          setAllCountries(data.data);
        }
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  useEffect(() => {
    if (isSameTeam) {
      setShowSameTeamAlert(true);
      const timer = setTimeout(() => {
        setShowSameTeamAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowSameTeamAlert(false);
    }
  }, [isSameTeam]);

  useEffect(() => {
    if (showSameTeamAlert && alertRef.current) {
      gsap.fromTo(
        alertRef.current,
        { x: 100, opacity: 0, scale: 0.8 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
      );
    }
  }, [showSameTeamAlert]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" });

      if (vsAnimationRef.current) {
        gsap.fromTo(
          vsAnimationRef.current,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "elastic.out(1, 0.5)",
            delay: 0.5,
          },
        );
      }

      gsap.fromTo(
        overButtonsRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.8,
        },
      );

      gsap.fromTo(
        startButtonRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
          delay: 1.2,
        },
      );

      if (cricketBallRef.current) {
        gsap.to(cricketBallRef.current, {
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: "linear",
        });
      }

      createFloatingParticles();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (formattedCountries.length > 0) {
      setTimeout(() => {
        gsap.fromTo(
          yourTeamCardsRef.current,
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
  }, [formattedCountries]);

  useEffect(() => {
    if (formattedCountries.length > 0) {
      setTimeout(() => {
        gsap.fromTo(
          opponentTeamCardsRef.current,
          { scale: 0, opacity: 0, y: 50 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "back.out(1.7)",
            delay: 0.1,
          },
        );
      }, 500);
    }
  }, [formattedCountries]);

  const createFloatingParticles = () => {
    const particlesContainer = document.createElement("div");
    particlesContainer.className = "fixed inset-0 pointer-events-none overflow-hidden z-0";

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "absolute w-1 h-1 bg-yellow-500/20 rounded-full";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      gsap.to(particle, {
        y: -100,
        x: Math.random() * 100 - 50,
        opacity: 0,
        duration: 3 + Math.random() * 4,
        repeat: -1,
        delay: Math.random() * 3,
        ease: "sine.inOut",
      });

      particlesContainer.appendChild(particle);
    }

    if (containerRef.current) {
      containerRef.current.appendChild(particlesContainer);
    }
  };

  const handleOverSelect = (over: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSelectedOver(over);

    overButtonsRef.current.forEach((button, index) => {
      if (button) {
        const isSelected = OVERS[index].value === over;

        gsap.to(button, {
          scale: isSelected ? 1.1 : 0.95,
          backgroundColor: isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.1)",
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            if (index === overButtonsRef.current.length - 1) {
              setIsAnimating(false);
            }
          },
        });
      }
    });
  };

  const handleTeamSelect = (team: string, isYourTeam: boolean) => {
    if (isYourTeam) {
      setSelectedYourTeam(team);
    } else {
      setSelectedOpponentTeam(team);
    }
  };

  const maxPlayersByOvers: Record<number, number> = {
    3: 2,
    5: 3,
    10: 6,
    20: 10,
  };

  const targetRangeByOvers: Record<number, [number, number]> = {
    3: [50, 80],
    5: [82, 120],
    10: [122, 200],
    20: [202, 310],
  };

  const [minTarget, maxTarget] = targetRangeByOvers[selectedOver];
  const target = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;
  const maxPlayers = maxPlayersByOvers[selectedOver || 3];

  const continueAnimations = async () => {
    if (containerRef.current) {
      for (let i = 0; i < 20; i++) {
        const confetti = document.createElement("div");
        confetti.className = "fixed w-2 h-2 bg-yellow-500 rounded-full z-50";
        confetti.style.left = "50%";
        confetti.style.top = "50%";

        gsap.to(confetti, {
          x: Math.random() * 400 - 200,
          y: Math.random() * 400 - 200,
          opacity: 0,
          scale: 0,
          duration: 1,
          ease: "power2.out",
          onComplete: () => confetti.remove(),
        });

        containerRef.current.appendChild(confetti);
      }
    }

    if (cricketBallRef.current) {
      gsap.to(cricketBallRef.current, {
        x: 500,
        y: -300,
        rotation: 720,
        scale: 1.5,
        duration: 1,
        ease: "power2.inOut",
      });
    }

    gsap.to(titleRef.current, {
      y: -100,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    });

    gsap.to([...yourTeamCardsRef.current, ...opponentTeamCardsRef.current], {
      y: 100,
      opacity: 0,
      stagger: 0.05,
      duration: 0.4,
      ease: "power2.in",
    });

    gsap.to(overButtonsRef.current, {
      x: -100,
      opacity: 0,
      stagger: 0.05,
      duration: 0.4,
      ease: "power2.in",
    });

    gsap.to(startButtonRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      delay: 0.2,
      onComplete: () => {
        setTimeout(() => {
          router.push(`/game`);
        }, 300);
      },
    });
  };

  const handleStartGame = async () => {
    if (!selectedYourTeam || !selectedOpponentTeam || isAnimating || isSameTeam) return;

    const user = localStorageHelper.getItem("users");
    const userId = user?.profile?.id;

    if (!userId) {
      console.error("User not found");
      return;
    }

    const payload: PayloadGame = {
      userId,
      yourTeam: selectedYourTeam,
      opponentTeam: selectedOpponentTeam,
      overs: selectedOver,
      maxPlayer: maxPlayers,
      target,
      status: "PENDING",
      started_at: new Date(),
    };

    try {
      setIsAnimating(true);

      const res = await fetch("/api/game-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok || result.success) {
        await continueAnimations();
        router.push(`/game`);
        setTimeout(() => {
          setIsAnimating(false);
        }, 1200);
      } else {
        throw new Error(result?.message || "Game setup failed");
      }
    } catch (error) {
      console.error(error);
      setIsAnimating(false);
    }
  };

  const closeAlert = () => {
    if (alertRef.current) {
      gsap.to(alertRef.current, {
        x: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShowSameTeamAlert(false);
        },
      });
    } else {
      setShowSameTeamAlert(false);
    }
  };

  const fetchLatestGame = async () => {
    const user = localStorageHelper.getItem("users");
    const userId = user?.profile?.id;
    if (!userId) return;

    const res = await fetch(`/api/game-setup?userId=${userId}`);
    const result = await res.json();

    if (result.success && result.data) {
      const game = result.data;
      if (["PENDING", "IN_PROGRESS"].includes(game.status)) {
        setResumeModalGame(game);
      } else {
        setSelectedYourTeam(null);
        setSelectedOpponentTeam(null);
      }
    }
  };

  const dataWithIcon = [
    { label: "Total Teams", value: formattedCountries.length, icon: "🏏" },
    { label: "Match Format", value: "T20", icon: "🔥" },
    { label: "Selected Overs", value: selectedOver, icon: "⏱️" },
    {
      label: "Ready to Play",
      value: selectedYourTeam && selectedOpponentTeam ? (isSameTeam ? "No ❌" : "Yes ✅") : "No",
      icon: "👥",
    },
  ];

  const init = async () => {
    await fetchLatestGame();
    setIsModalOpen?.(true);
  };

  useEffect(() => {
    fetchLatestGame();
  }, []);

  const alertBox = (
    <>
      {showSameTeamAlert && (
        <div
          ref={alertRef}
          className="fixed top-6 right-6 z-50 w-96 bg-linear-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="relative p-5">
            <button onClick={closeAlert} className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors">
              <FaTimes />
            </button>

            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <div className="text-xl">⚡</div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Same Team Selected!</h3>
                <p className="text-gray-200">You cannot play against yourself! Please select a different opponent team for the match.</p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-400">
                    {selectedYourTeam && formattedCountries.find((t) => t.name === selectedYourTeam)?.flag ? (
                      <Image
                        src={formattedCountries.find((t) => t.name === selectedYourTeam)?.flag || ""}
                        alt={selectedYourTeam}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">🏴</div>
                    )}
                  </div>
                  <span className="text-yellow-300 font-bold">{selectedYourTeam}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-yellow-300 font-bold">{selectedOpponentTeam}</span>
                </div>

                <div className="mt-4 text-sm text-gray-300">💡 Tip: Try selecting teams from different continents for a more exciting match!</div>
              </div>
            </div>
          </div>

          <div className="h-1 bg-linear-to-r from-red-500 via-orange-500 to-yellow-500 animate-[shimmer_5s_linear]"></div>
        </div>
      )}
    </>
  );

  const showResumeModal = async (game: any) => {
    MySwal?.fire({
      title: (
        <div className="flex justify-center items-center text-center relative">
          <p className="text-center">Resume your game?</p>
          <button
            onClick={() => {
              setIsModalOpen(false);
              MySwal?.close();
            }}
            className="absolute -right-2 -top-2 transition-colors text-lg font-bold cursor-pointer"
          >
            <X color="black" />
          </button>
        </div>
      ),
      html: (
        <div>
          <p>
            You have an unfinished game: <br />
            {game.yourTeam} vs {game.opponentTeam}, {game.overs} overs
          </p>
        </div>
      ),
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",

      customClass: {
        popup: "bg-gray-900 text-white rounded-2xl p-6",
        confirmButton: "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded",
        cancelButton: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSelectedYourTeam(game.yourTeam);
        setSelectedOpponentTeam(game.opponentTeam);
        setSelectedOver(game.overs);
        setIsModalOpen(false);
        MySwal.close();
        router.push(`/game`);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        MySwal.showLoading();
        await fetch(`/api/game-setup`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: game.id }),
        });
        setIsModalOpen(false);
        MySwal?.close();
        fetchLatestGame();
      }
    });
  };

  // useEffect ke andar modal call
  useEffect(() => {
    if (isModalOpen && resumeModalGame) {
      showResumeModal(resumeModalGame);
    }
  }, [isModalOpen, resumeModalGame]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-no-repeat bg-cover w-full"
      style={{ backgroundImage: `url(${IMAGES.backGroundImg.src})` }}
    >
      <div className="absolute inset-0 bg-[url('/cricket-pattern.png')] opacity-5 animate-pulse"></div>
      {alertBox}

      <div ref={cricketBallRef} className="fixed top-1/4 right-1/4 z-10">
        <div className="relative">
          <BiCricketBall className="text-6xl text-yellow-500 filter drop-shadow-lg" />
          <div className="absolute inset-0 animate-ping bg-yellow-500 rounded-full opacity-20"></div>
        </div>
      </div>

      <div className="fixed top-1/4 left-1/4 z-10">
        <FaTrophy className="text-5xl text-yellow-400 animate-bounce" />
      </div>

      <div className="fixed bottom-1/4 right-1/4 z-10">
        <GiCricketBat className="text-6xl text-gray-300 animate-[wiggle_3s_ease-in-out_infinite]" />
      </div>

      <section className="relative z-20 w-full min-h-screen flex items-center justify-center text-white p-4 md:p-8">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-8">
            <h1
              ref={titleRef}
              className="text-5xl md:text-7xl font-bold pb-4 bg-linear-to-r from-yellow-400 via-green-400 to-blue-500 bg-clip-text text-transparent"
            >
              Cricket Fever 🏏
            </h1>
            <p className="text-xl text-gray-300 opacity-0 animate-fade-in">Select your team, opponent and start the match!</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="lg:w-[45%]">
              <TeamSelection
                title="Your Team"
                teams={formattedCountries}
                selectedTeam={selectedYourTeam || resumeModalGame?.yourTeam}
                onTeamSelect={(team) => handleTeamSelect(team, true)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search your team..."
                theme="green"
                icon={<GiCricketBat className="text-2xl" />}
                isAnimating={isAnimating}
                maxTeams={30}
                disabled={!!resumeModalGame}
              />
            </div>

            <div className="lg:w-[10%] flex items-center justify-center">
              <div ref={vsAnimationRef} className="relative">
                <div className="w-24 h-24 bg-linear-to-br from-red-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <div className="text-2xl font-bold">VS</div>
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-red-600 to-blue-600 rounded-full animate-ping opacity-30"></div>

                {isSameTeam && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="text-xs">!</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-[45%]">
              <TeamSelection
                title="Opponent Team"
                teams={formattedCountries}
                selectedTeam={selectedOpponentTeam || resumeModalGame?.opponentTeam}
                onTeamSelect={(team) => handleTeamSelect(team, false)}
                searchQuery={searchQueryOpponent}
                onSearchChange={setSearchQueryOpponent}
                placeholder="Search opponent team..."
                theme="red"
                icon={<BiCricketBall className="text-2xl" />}
                isAnimating={isAnimating}
                maxTeams={30}
                disabled={!!resumeModalGame}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="bg-linear-to-br from-gray-900/80 to-blue-900/30 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-500/30 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <FaTrophy className="text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold">Match Preview</h2>

                    {isSameTeam && (
                      <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-red-300">Same Team!</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-linear-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div
                          className={`w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border-4 ${
                            isSameTeam ? "border-red-500/70" : "border-green-500/50"
                          }`}
                        >
                          {(selectedYourTeam || resumeModalGame?.yourTeam) &&
                          formattedCountries.find((t) => t.name === (selectedYourTeam || resumeModalGame?.yourTeam))?.flag ? (
                            <Image
                              src={formattedCountries.find((t) => t.name === (selectedYourTeam || resumeModalGame?.yourTeam))?.flag || ""}
                              alt={selectedYourTeam || resumeModalGame?.yourTeam}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🏴</div>
                          )}
                        </div>
                        <div className="text-xl font-bold">{selectedYourTeam || "Your Team"}</div>
                        <div className="text-sm text-gray-300">(You)</div>
                      </div>

                      <div className="px-8">
                        <div
                          className={`text-3xl text-center font-bold ${
                            isSameTeam ? "text-red-400" : "bg-linear-to-r from-red-500 to-blue-500 bg-clip-text text-transparent"
                          }`}
                        >
                          VS
                        </div>
                        <div className="text-sm text-gray-400 text-center">Best of {selectedOver} overs</div>
                      </div>

                      {/* Opponent Team */}
                      <div className="text-center flex-1">
                        <div
                          className={`w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border-4 ${
                            isSameTeam ? "border-red-500/70" : "border-red-500/50"
                          }`}
                        >
                          {(selectedOpponentTeam || resumeModalGame?.opponentTeam) &&
                          formattedCountries.find((t) => t.name === (selectedOpponentTeam || resumeModalGame?.opponentTeam))?.flag ? (
                            <Image
                              src={formattedCountries.find((t) => t.name === (selectedOpponentTeam || resumeModalGame?.opponentTeam))?.flag || ""}
                              alt={selectedOpponentTeam || resumeModalGame?.opponentTeam}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🏴</div>
                          )}
                        </div>
                        <div className="text-xl font-bold">{selectedOpponentTeam || "Opponent"}</div>
                        <div className="text-sm text-gray-300">(CPU)</div>
                      </div>
                    </div>

                    {/* Match Type */}
                    <div className="mt-6 text-center">
                      <div
                        className={`inline-block px-4 py-2 rounded-full text-sm ${
                          isSameTeam ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-linear-to-r from-yellow-600 to-orange-600"
                        }`}
                      >
                        {selectedOver} Overs Match • T20 Format
                        {isSameTeam && " ⚠️ Same Team!"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/3">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3">Select Overs</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {OVERS.map((over, index) => (
                        <button
                          key={over.value}
                          ref={(el) => {
                            if (el) overButtonsRef.current[index] = el;
                          }}
                          onClick={() => handleOverSelect(over.value)}
                          className={`p-3 rounded-xl transition-all duration-300 border-2 cursor-pointer ${
                            selectedOver === over.value
                              ? "border-blue-500 bg-linear-to-r from-blue-900/30 to-transparent scale-105"
                              : "border-white/20 hover:border-blue-400/50"
                          } backdrop-blur-sm`}
                          disabled={!!resumeModalGame}
                        >
                          <div className="font-bold text-lg">{over.label}</div>
                          <div className="text-gray-300 text-sm">{over.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {!!resumeModalGame ? (
                    <button
                      ref={startButtonRef}
                      onClick={init}
                      className={`bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 cursor-pointer w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3`}
                    >
                      <FaPlay className="text-xl" />
                      Resume Match
                    </button>
                  ) : (
                    <button
                      ref={startButtonRef}
                      onClick={handleStartGame}
                      disabled={(!selectedYourTeam || !selectedOpponentTeam || isAnimating || isSameTeam) as boolean}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        selectedYourTeam && selectedOpponentTeam && !isSameTeam
                          ? "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 cursor-pointer"
                          : "bg-gray-700 cursor-not-allowed"
                      } shadow-lg flex items-center justify-center gap-3`}
                    >
                      <FaPlay className="text-xl" />
                      {isAnimating
                        ? "Starting Match..."
                        : isSameTeam
                        ? "Same Team Selected!"
                        : !selectedYourTeam || !selectedOpponentTeam
                        ? "Select Teams First"
                        : "Start Match"}
                      {selectedYourTeam && selectedOpponentTeam && !isSameTeam && <div className="animate-ping">🎯</div>}
                      {isSameTeam && <span>⚠️</span>}
                    </button>
                  )}

                  {/* Warning message */}
                  {isSameTeam && (
                    <div className="mt-3 text-center">
                      <div className="text-red-300 text-sm">⚠️ Select different teams to start the match</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {dataWithIcon.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-white/10 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(10deg);
          }
          75% {
            transform: rotate(-10deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #3b82f6);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default React.memo(SelectTeam);
