"use client";
import React from "react";
import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";
import { AnimatedBody, AnimatedH1 } from "@/components/AnimatedText/Typography";
import { IMAGES } from "@/utils/resourses";
import { useRouter } from "next/navigation";
import Link from "next/link";

function page() {
  const router = useRouter();
  return (
    <section
      className="w-full h-screen flex flex-col items-center justify-center text-white bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${IMAGES.backGroundImg.src})` }}
    >
      <AnimatedH1 animation="stagger">Circket BLAST</AnimatedH1>

      <AnimatedBody className="mb-6 text-lg text-gray-300" animation="mask-reveal">
        Tap the bat at the perfect time and score points!
      </AnimatedBody>

      <div className="flex items-center justify-center gap-2 w-full">
        <AnimatedButton className="w-fit" variant="primary" animationType="pulse" hoverEffect="scale" onClick={() => router.push("/select-team")}>
          PLAY NOW
        </AnimatedButton>

        <Link href={"/skull"}>
          <AnimatedButton variant="primary" animationType="glow" hoverEffect="scale" onClick={() => router.push("/select-team")}>
            Skull
          </AnimatedButton>
        </Link>

        <Link href={"/human"}>
          <AnimatedButton variant="primary" animationType="glow" hoverEffect="scale" onClick={() => router.push("/select-team")}>
            Human
          </AnimatedButton>
        </Link>
      </div>
    </section>
  );
}

export default React.memo(page);
