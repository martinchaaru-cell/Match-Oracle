// app/bankroll/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { api } from "@/lib/api";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";

interface BankrollData {
  current: number;
  peak: number;
  drawdownPct: number;
  stakeMultiplier: number;
  healthLabel: string;
  pauseRecommended: boolean;
  singles: Array<{
    match: string;
    selection: string;
    odds: number;
    stake: number;
    potentialReturn: number;
    confidence: string;
  }>;
  ultraSafeAcca: {
    legs: string[];
    combinedOdds: number;
    stake: number;
    potentialReturn: number;
  } | null;
  valueAcca: {
    legs: string[];
    combinedOdds: number;
    stake: number;
    potentialReturn: number;
  } | null;
  history: Array<{
    date: string;
    bankroll: number;
    profit: number;
  }>;
}

export default function BankrollPage() {
  const [data, setData] = useState<BankrollData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankroll();
  }, []);

  const fetchBankroll = async () => {
    try {
      const response = await api.getBankroll();
      setData(response);
    } catch (error) {
      console.error("Failed to fetch bankroll:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = () => {
    if (!data) return "text-gray-500";
    switch (data.healthLabel) {
      case "HEALTHY":
        return "text-green-500";
      case "CAUTION":
        return "text-yellow-500";
      case "DANGER":
        return "text-orange-500";
      case "EMERGENCY":
        return "text-red-500";
      default:
        return "text-red-600";
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
        <h1 className="text-3xl font-bold">Bankroll Management</h1>
        <p className="text-muted-foreground mt-1">Capital allocation and risk monitoring</p>
      </div>

      {/* Bankroll Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-900/20 to-green-900/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Bankroll</p>
                <p className="text-3xl font-bold">${data?.current.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Peak Bankroll</p>
                <p className="text-2xl font-bold">${data?.peak.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drawdown</p>
                <p className={`text-2xl font-bold ${data?.drawdownPct && data.drawdownPct > 0 ? "text-red-500" : ""}`}>
                  {data?.drawdownPct && data.drawdownPct > 0 ? "-" : ""}{((data?.drawdownPct || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Status</p>
                <p className={`text-xl font-bold ${getHealthColor()}`}>{data?.healthLabel}</p>
              </div>
              <Shield className={`h-8 w-8 ${getHealthColor()}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stake Multiplier */}
      <Card>
        <CardHeader>
          <CardTitle>Stake Multiplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Kelly Scaling</span>
              <span>{(data?.stakeMultiplier || 1) * 100}% of full Kelly</span>
            </div>
            <Progress value={(data?.stakeMultiplier || 1) * 100} className="h-2" />
            {data?.pauseRecommended && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm">Pause recommended - drawdown exceeds safe threshold</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bankroll History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Bankroll History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.history || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Bankroll"]}
              />
              <Area
                type="monotone"
                dataKey="bankroll"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Singles */}
      <Card>
        <CardHeader>
          <CardTitle>Active Singles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left p-4">Match</th>
                  <th className="text-left p-4">Selection</th>
                  <th className="text-center p-4">Odds</th>
                  <th className="text-center p-4">Stake</th>
                  <th className="text-center p-4">Potential Return</th>
                  <th className="text-center p-4">Confidence</th>
                 </tr>
              </thead>
              <tbody>
                {data?.singles.map((single, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="p-4 font-medium">{single.match}</td>
                    <td className="p-4">{single.selection}</td>
                    <td className="p-4 text-center font-mono">{single.odds.toFixed(2)}</td>
                    <td className="p-4 text-center font-mono">${single.stake.toFixed(2)}</td>
                    <td className="p-4 text-center font-mono text-green-500">
                      ${single.potentialReturn.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={single.confidence === "HIGH" ? "default" : "secondary"}>
                        {single.confidence}
                      </Badge>
                    </td>
                  </table>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ACCA Stakes */}
      {(data?.ultraSafeAcca || data?.valueAcca) && (
        <div className="grid grid-cols-2 gap-6">
          {data?.ultraSafeAcca && (
            <Card>
              <CardHeader>
                <CardTitle>Ultra-Safe ACCA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legs:</span>
                  <span>{data.ultraSafeAcca.legs.join(" + ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Combined Odds:</span>
                  <span className="font-mono">{data.ultraSafeAcca.combinedOdds.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stake:</span>
                  <span className="font-mono">${data.ultraSafeAcca.stake.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential Return:</span>
                  <span className="font-mono text-green-500">${data.ultraSafeAcca.potentialReturn.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {data?.valueAcca && (
            <Card>
              <CardHeader>
                <CardTitle>Value ACCA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legs:</span>
                  <span>{data.valueAcca.legs.join(" + ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Combined Odds:</span>
                  <span className="font-mono">{data.valueAcca.combinedOdds.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stake:</span>
                  <span className="font-mono">${data.valueAcca.stake.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential Return:</span>
                  <span className="font-mono text-green-500">${data.valueAcca.potentialReturn.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
