"use client";

import React from "react";
import { HitData } from "@/container/Pages/GamePage";

const RightSideVerticalBoundary = ({ hitData, zones }: { hitData?: HitData | null; zones: any[] }) => {
  const runs = hitData?.runs ?? 0;

  return (
    <div className="absolute right-6 top-2 z-20 h-[85vh] w-72 flex flex-row-reverse items-center gap-4">
      <div className="relative w-8 h-full bg-gray-800/80 border-2 border-white/50 rounded-full overflow-hidden">
        <div
          className="absolute bottom-0 w-full bg-linear-to-t from-red-600 via-yellow-400 to-green-500 transition-all duration-300"
          style={{ height: `${(runs / 6) * 100}%` }}
        />
      </div>

      <div className="flex flex-col justify-between h-full py-2 font-black italic text-3xl">
        {zones.map((r) => (
          <div key={r?.id} className={r?.id === runs ? "text-green-500" : "text-black/80"}>
            {r?.id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RightSideVerticalBoundary);
