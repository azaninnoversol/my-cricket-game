import React from "react";
import SelectTeam from "@/container/Pages/SelectTeam";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selection | Cricket Blast",
  description: "Select your Team and opponent Team and Select overs.",
};

function page() {
  return <SelectTeam />;
}

export default React.memo(page);
