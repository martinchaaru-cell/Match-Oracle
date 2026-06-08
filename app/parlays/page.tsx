// app/parlays/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface Parlay {
  parlayId: number;
  tier: string;
  legs: Array<{
    match: string;
    selection: string;
    odds: number;
    confidence: string;
    league: string;
  }>;
  totalOdds: number;
  combinedProb: number;
  riskScore: number;
  riskLevel: string;
}

export default function ParlaysPage() {
  const [parlays, setParlays] = useState<{ safe: Parlay[]; balanced: Parlay[]; aggressive: Parlay[] }>({
    safe: [],
    balanced: [],
    aggressive: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParlays();
  }, []);

  const fetchParlays = async () => {
    try {
      const response = await api.getParlays();
      setParlays(response);
    } catch (error) {
      console.error("Failed to fetch parlays:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "SAFE":
        return <Badge className="bg-green-600">SAFE</Badge>;
      case "CAUTION":
        return <Badge variant="warning">CAUTION</Badge>;
      default:
        return <Badge variant="destructive">AVOID</Badge>;
    }
  };

  const ParlayCard = ({ parlay }: { parlay: Parlay }) => (
    <Card className="hover:bg-secondary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg">#{parlay.parlayId}</span>
            {getRiskBadge(parlay.riskLevel)}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-500">{parlay.totalOdds.toFixed(2)}x</div>
            <div className="text-xs text-muted-foreground">{(parlay.combinedProb * 100).toFixed(1)}% prob</div>
          </div>
        </div>
        <div className="space-y-2">
          {parlay.legs.map((leg, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium">{leg.match}</span>
                <div className="text-muted-foreground text-xs">{leg.league} • {leg.selection}</div>
              </div>
              <div className="text-right">
                <span className="font-mono">@{leg.odds.toFixed(2)}</span>
                <Badge variant="outline" className="ml-2 text-xs">{leg.confidence}</Badge>
              </div>
            </div>
          ))}
        </div>
        {parlay.riskScore > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Risk Score: {(parlay.riskScore * 100).toFixed(0)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
        <h1 className="text-3xl font-bold">Parlays</h1>
        <p className="text-muted-foreground mt-1">Multi-leg accumulator slips</p>
      </div>

      <Tabs defaultValue="safe" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="safe">🟢 Ultra Safe</TabsTrigger>
          <TabsTrigger value="balanced">🟡 Balanced</TabsTrigger>
          <TabsTrigger value="aggressive">🔴 Aggressive</TabsTrigger>
        </TabsList>

        <TabsContent value="safe" className="mt-6">
          <div className="grid gap-4">
            {parlays.safe.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No safe parlays available for today
                </CardContent>
              </Card>
            ) : (
              parlays.safe.map((parlay) => <ParlayCard key={parlay.parlayId} parlay={parlay} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="balanced" className="mt-6">
          <div className="grid gap-4">
            {parlays.balanced.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No balanced parlays available for today
                </CardContent>
              </Card>
            ) : (
              parlays.balanced.map((parlay) => <ParlayCard key={parlay.parlayId} parlay={parlay} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="aggressive" className="mt-6">
          <div className="grid gap-4">
            {parlays.aggressive.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No aggressive parlays available for today
                </CardContent>
              </Card>
            ) : (
              parlays.aggressive.map((parlay) => <ParlayCard key={parlay.parlayId} parlay={parlay} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
