import React from "react";
import CricketGame from "@/container/Pages/GamePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Game | Cricket Blast",
  description: "Hit and Win.",
};

function page() {
  return <CricketGame />;
}

export default React.memo(page);
