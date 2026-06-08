// app/top-picks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Eye, TrendingUp, TrendingDown } from "lucide-react";
import { ForensicModal } from "@/components/forensic-modal";

interface TopPick {
  legId: string;
  match: string;
  selection: string;
  odds: number;
  modelProb: number;
  edge: number;
  confidence: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
}

export default function TopPicksPage() {
  const [picks, setPicks] = useState<TopPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPick, setSelectedPick] = useState<TopPick | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTopPicks();
  }, []);

  const fetchTopPicks = async () => {
    try {
      const response = await api.getPortfolio();
      setPicks(response.top_picks);
    } catch (error) {
      console.error("Failed to fetch top picks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Top Picks</h1>
        <p className="text-muted-foreground mt-1">
          Highest probability selections for today
        </p>
      </div>

      <div className="grid gap-4">
        {picks.map((pick, idx) => (
          <Card
            key={pick.legId}
            className="cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => {
              setSelectedPick(pick);
              setShowModal(true);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-3xl font-bold text-primary">#{idx + 1}</div>
                  <div>
                    <div className="font-medium text-lg">
                      {pick.homeTeam} vs {pick.awayTeam}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {pick.league} • {new Date(pick.kickoff).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Selection</div>
                    <div className="font-medium">{pick.selection} @ {pick.odds.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Probability</div>
                    <div className="font-medium">{(pick.modelProb * 100).toFixed(0)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Edge</div>
                    <div className={`font-medium flex items-center gap-1 ${pick.edge > 0 ? "text-green-500" : "text-red-500"}`}>
                      {pick.edge > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {(pick.edge * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Badge variant={pick.confidence === "HIGH" ? "default" : "secondary"}>
                    {pick.confidence}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPick && (
        <ForensicModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          leg={{
            legId: selectedPick.legId,
            matchId: selectedPick.match,
            country: "",
            league: selectedPick.league,
            leagueId: 0,
            leagueTier: 0,
            kickoff: selectedPick.kickoff,
            homeTeam: selectedPick.homeTeam,
            awayTeam: selectedPick.awayTeam,
            homeOdds: 0,
            drawOdds: 0,
            awayOdds: 0,
            selection: selectedPick.selection,
            selectionOdds: selectedPick.odds,
            modelProb: selectedPick.modelProb,
            edge: selectedPick.edge,
            status: "APPROVED",
            confidence: selectedPick.confidence,
          }}
        />
      )}
    </div>
  );
}
