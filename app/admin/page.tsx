// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Save, RefreshCw, Database, Zap, Shield, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface ConfigData {
  homeWinThreshold: number;
  opponentWinCap: number;
  minEdge: number;
  confidenceThreshold: number;
  riskTolerance: number;
  kellyFraction: number;
}

interface BudgetData {
  callsUsed: number;
  callsLimit: number;
  callsLeft: number;
  warning: boolean;
  critical: boolean;
  emergency: boolean;
  exhausted: boolean;
}

interface DatabaseStats {
  matches: number;
  predictions: number;
  outcomes: number;
  uniqueLeagues: number;
  overallAccuracy: number;
}

export default function AdminPage() {
  const [config, setConfig] = useState<ConfigData>({
    homeWinThreshold: 0.57,
    opponentWinCap: 0.25,
    minEdge: 0.04,
    confidenceThreshold: 0.55,
    riskTolerance: 1.0,
    kellyFraction: 0.25,
  });
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [recalibrating, setRecalibrating] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchBudget();
    fetchStats();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.getConfig();
      setConfig(response);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  const fetchBudget = async () => {
    try {
      const response = await api.getApiBudget();
      setBudget(response.budget);
    } catch (error) {
      console.error("Failed to fetch budget:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getDatabaseStats();
      setStats(response);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await api.updateConfig(config);
      toast.success("Configuration saved");
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const runRecalibration = async () => {
    setRecalibrating(true);
    try {
      await api.post("/admin/recalibrate");
      toast.success("Recalibration complete");
      await fetchConfig();
    } catch (error) {
      toast.error("Recalibration failed");
    } finally {
      setRecalibrating(false);
    }
  };

  const getBudgetColor = () => {
    if (!budget) return "text-gray-500";
    if (budget.exhausted) return "text-red-600";
    if (budget.emergency) return "text-red-500";
    if (budget.critical) return "text-orange-500";
    if (budget.warning) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">System configuration and monitoring</p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">⚙️ Configuration</TabsTrigger>
          <TabsTrigger value="api">🌐 API Status</TabsTrigger>
          <TabsTrigger value="database">💾 Database</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threshold Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Home Win Threshold: {config.homeWinThreshold.toFixed(2)}</Label>
                <Slider
                  value={[config.homeWinThreshold]}
                  onValueChange={(val) => setConfig({ ...config, homeWinThreshold: val[0] })}
                  min={0.52}
                  max={0.70}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">Minimum home win probability for approval</p>
              </div>

              <div className="space-y-2">
                <Label>Opponent Win Cap: {config.opponentWinCap.toFixed(2)}</Label>
                <Slider
                  value={[config.opponentWinCap]}
                  onValueChange={(val) => setConfig({ ...config, opponentWinCap: val[0] })}
                  min={0.15}
                  max={0.35}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">Maximum opponent win probability allowed</p>
              </div>

              <div className="space-y-2">
                <Label>Minimum Edge: {config.minEdge.toFixed(2)}</Label>
                <Slider
                  value={[config.minEdge]}
                  onValueChange={(val) => setConfig({ ...config, minEdge: val[0] })}
                  min={0.02}
                  max={0.15}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">Required value edge for approval</p>
              </div>

              <div className="space-y-2">
                <Label>Confidence Threshold: {config.confidenceThreshold.toFixed(2)}</Label>
                <Slider
                  value={[config.confidenceThreshold]}
                  onValueChange={(val) => setConfig({ ...config, confidenceThreshold: val[0] })}
                  min={0.50}
                  max={0.75}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">Probability threshold for HIGH confidence</p>
              </div>

              <div className="space-y-2">
                <Label>Kelly Fraction: {config.kellyFraction.toFixed(2)}</Label>
                <Slider
                  value={[config.kellyFraction]}
                  onValueChange={(val) => setConfig({ ...config, kellyFraction: val[0] })}
                  min={0.10}
                  max={0.50}
                  step={0.05}
                />
                <p className="text-xs text-muted-foreground">Fraction of Kelly to stake</p>
              </div>

              <Button onClick={saveConfig} disabled={saving} className="gap-2">
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runRecalibration} disabled={recalibrating} variant="outline" className="gap-2">
                {recalibrating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Run Recalibration
              </Button>
              <p className="text-xs text-muted-foreground">
                Recalibrates system thresholds based on historical performance
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Status Tab */}
        <TabsContent value="api" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Budget Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budget ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Calls Used Today</p>
                      <p className={`text-2xl font-bold ${getBudgetColor()}`}>
                        {budget.callsUsed} / {budget.callsLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-2xl font-bold">{budget.callsLeft}</p>
                    </div>
                    <Badge variant={budget.exhausted ? "destructive" : budget.emergency ? "destructive" : budget.critical ? "warning" : budget.warning ? "warning" : "default"}>
                      {budget.exhausted ? "EXHAUSTED" : budget.emergency ? "EMERGENCY" : budget.critical ? "CRITICAL" : budget.warning ? "WARNING" : "OK"}
                    </Badge>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budget.exhausted ? "bg-red-600" :
                        budget.emergency ? "bg-red-500" :
                        budget.critical ? "bg-orange-500" :
                        budget.warning ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${(budget.callsUsed / budget.callsLimit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resets daily at UTC midnight
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Loading budget data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <Database className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.matches}</p>
                    <p className="text-xs text-muted-foreground">Matches</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{stats.predictions}</p>
                    <p className="text-xs text-muted-foreground">Predictions</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{stats.outcomes}</p>
                    <p className="text-xs text-muted-foreground">Outcomes</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{stats.uniqueLeagues}</p>
                    <p className="text-xs text-muted-foreground">Leagues</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading database stats...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
