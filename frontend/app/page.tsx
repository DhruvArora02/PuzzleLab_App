"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlayPuzzle } from "@/components/PlayPuzzle";
import { LoginAndRegister } from "@/components/LoginAndRegister";

export default function Home() {
  const router = useRouter();

  return (
    <div className="grid items-center mt-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center ">
        <Image
          src="/logo.png"
          alt="Puzzle Lab logo"
          width={180}
          height={38}
          priority
          className="mb-5"
        />
        <Button variant="outline" onClick={() => router.push("/create")}>Create Puzzle</Button>
        <Button variant="outline" onClick={() => router.push("/mypuzzles")}>My Puzzles</Button>
        <PlayPuzzle />
      </main>
    </div>
  );
}