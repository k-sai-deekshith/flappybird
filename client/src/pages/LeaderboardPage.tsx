import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type Score = {
  id: number;
  userId: number;
  score: number;
  username: string;
  createdAt: string;
};

export default function LeaderboardPage() {
  const { data: scores, isLoading } = useQuery<Score[]>({
    queryKey: ["/api/scores"],
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

        <Card>
          <CardHeader>
            <CardTitle>Top Scores</CardTitle>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
