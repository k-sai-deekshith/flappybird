import { useState, useCallback, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useUser } from "./use-user";

export function useGame() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Fetch the user's highest score
  const { data: highScoreData } = useQuery<{ highScore: number }>({
    queryKey: ["/api/scores/highest"],
    enabled: !!user,
    staleTime: 0, // Always refetch to ensure we have the latest high score
  });

  const highScore = highScoreData?.highScore ?? 0;

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
      queryClient.invalidateQueries({ queryKey: ["/api/scores/highest"] });
    },
  });

  const handleGameOver = useCallback(
    async (score: number) => {
      setFinalScore(score);
      setScore(score);
      setGameOver(true);
      setIsPlaying(false);

      if (user) {
        try {
          await submitScore.mutateAsync(score);
        } catch (error) {
          console.error("Failed to submit score:", error);
        }
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