"use client"
import { description, title, url } from "@/lib/metadata";
import { generateMetadata } from "@/lib/farcaster-embed";
import { useState } from "react";
import { Share } from "@/components/share";
import Game2048 from "@/components/2048-game";


export default function Home() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  return (
    <main className="flex flex-col gap-3 place-items-center px-4">
      <span className="text-2xl">{title}</span>
      <span className="text-muted-foreground">{description}</span>

      <Game2048
        onGameOver={(finalScore) => {
          setScore(finalScore);
          setGameOver(true);
        }}
      />

      {gameOver && (
        <div className="flex flex-col items-center gap-2 mt-4">
          <span className="text-lg font-semibold">Your score: {score}</span>
          <Share text={`${url}/?score=${score}`} />
        </div>
      )}
    </main>
  );
}
