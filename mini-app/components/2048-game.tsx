"use client"
import { useEffect, useState } from "react";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function getRandomTile() {
  const rand = Math.random();
  return rand < TILE_PROBABILITIES[0] ? TILE_VALUES[0] : TILE_VALUES[1];
}

function addRandomTile(board: number[][]) {
  const empty: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map((row) => row.slice());
  newBoard[r][c] = getRandomTile();
  return newBoard;
}

function rotateBoard(board: number[][], times: number) {
  let newBoard = board.map((row) => row.slice());
  for (let t = 0; t < times; t++) {
    const rotated: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        rotated[c][GRID_SIZE - 1 - r] = newBoard[r][c];
      }
    }
    newBoard = rotated;
  }
  return newBoard;
}

function slideAndMerge(row: number[]): { newRow: number[]; score: number } {
  const nonZero = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let score = 0;
  for (let i = 0; i < nonZero.length; i++) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2;
      merged.push(mergedVal);
      score += mergedVal;
      i++; // skip next
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return { newRow: merged, score };
}

function move(board: number[][], direction: "up" | "down" | "left" | "right") {
  let rotatedBoard = board;
  let times = 0;
  if (direction === "up") times = 1;
  else if (direction === "down") times = 3;
  else if (direction === "right") times = 2;
  rotatedBoard = rotateBoard(board, times);

  const newBoard: number[][] = [];
  let totalScore = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    const { newRow, score } = slideAndMerge(rotatedBoard[r]);
    newBoard.push(newRow);
    totalScore += score;
  }

  const restoredBoard = rotateBoard(newBoard, (4 - times) % 4);
  const moved = JSON.stringify(restoredBoard) !== JSON.stringify(board);
  return { board: restoredBoard, moved, score: totalScore };
}

export default function Game2048({
  onGameOver,
}: {
  onGameOver: (finalScore: number) => void;
}) {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => {
    const init = addRandomTile(addRandomTile(board));
    setBoard(init);
  }, []);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const { board: newBoard, moved, score: delta } = move(board, dir);
    if (!moved) return;
    const updatedBoard = addRandomTile(newBoard);
    const newScore = score + delta;
    setBoard(updatedBoard);
    setScore(newScore);

    // Check win
    if (updatedBoard.some((row) => row.includes(2048))) {
      setGameOver(true);
      onGameOver(newScore);
      return;
    }

    // Check lose
    const hasEmpty = updatedBoard.some((row) => row.includes(0));
    const canMerge = updatedBoard.some((row, rIdx) =>
      row.some((val, cIdx) => {
        if (cIdx + 1 < GRID_SIZE && val === row[cIdx + 1]) return true;
        if (rIdx + 1 < GRID_SIZE && val === updatedBoard[rIdx + 1][cIdx]) return true;
        return false;
      })
    );
    if (!hasEmpty && !canMerge) {
      setGameOver(true);
      onGameOver(newScore);
    }
  };

  const renderTile = (value: number, key: string) => (
    <div
      key={key}
      className={`flex items-center justify-center rounded-md text-2xl font-bold
        ${value === 0 ? "bg-gray-200" : "bg-yellow-300"}
        ${value >= 1024 ? "text-white" : "text-black"}`}
      style={{ width: 80, height: 80 }}
    >
      {value !== 0 ? value : null}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {board.flatMap((row, rIdx) =>
          row.map((val, cIdx) => renderTile(val, `${rIdx}-${cIdx}`))
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <button onClick={() => handleMove("up")} className="p-2 bg-blue-500 rounded">
            ↑
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleMove("left")} className="p-2 bg-blue-500 rounded">
            ←
          </button>
          <button onClick={() => handleMove("down")} className="p-2 bg-blue-500 rounded">
            ↓
          </button>
          <button onClick={() => handleMove("right")} className="p-2 bg-blue-500 rounded">
            →
          </button>
        </div>
      </div>

      <div className="text-lg font-semibold">Score: {score}</div>
    </div>
  );
}
