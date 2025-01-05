import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { Difficulty } from "@/components/game/GameCanvas";

type Score = {
  id: number;
  userId: number;
  score: number;
  username: string;
  difficulty: Difficulty;
  createdAt: string;
};

export default function LeaderboardPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const { data: scores, isLoading } = useQuery<Score[]>({
    queryKey: ["/api/scores", { difficulty }],
    queryFn: async () => {
      const response = await fetch(`/api/scores?difficulty=${difficulty}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch scores');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-sky-400 to-sky-200">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <Link href="/">
            <Button variant="secondary">Back to Game</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Select Difficulty</h2>
            <RadioGroup
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as Difficulty)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard">Hard</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Scores - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {scores?.map((score, index) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{score.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(score.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{score.score}</span>
                  </div>
                ))}
                {scores?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No scores yet for this difficulty level
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}