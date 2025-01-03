import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./use-user";

export function useGame() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const submitScore = useMutation({
    mutationFn: async (score: number) => {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to submit score");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
    },
  });

  const handleGameOver = useCallback(
    async (score: number) => {
      setFinalScore(score);
      setScore(score);
      setGameOver(true);
      setIsPlaying(false);
      setHighScore((prev) => Math.max(prev, score));

      if (user) {
        await submitScore.mutateAsync(score);
      }
    },
    [user, submitScore]
  );

  const startGame = useCallback(() => {
    setScore(0);
    setFinalScore(0);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  const restartGame = useCallback(() => {
    setGameOver(false);
    setScore(0);
    setFinalScore(0);
    setIsPlaying(false);
  }, []);

  return {
    score,
    setScore,
    gameOver,
    highScore,
    finalScore,
    isPlaying,
    startGame,
    restartGame,
    handleGameOver,
  };
}