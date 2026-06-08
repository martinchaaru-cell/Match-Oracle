// app/performance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { Award, TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";

interface PerformanceData {
  calibrationGrade: string;
  brierScore: number;
  ece: number;
  overallAccuracy: number;
  highConfAccuracy: number;
  mediumConfAccuracy: number;
  lowConfAccuracy: number;
  overallRoi: number;
  byLeague: Array<{ league: string; total: number; correct: number; accuracy: number; roi: number }>;
  history: Array<{ date: string; accuracy: number; roi: number }>;
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const response = await api.getPerformance();
      setData(response);
    } catch (error) {
      console.error("Failed to fetch performance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = () => {
    if (!data) return "text-gray-500";
    switch (data.calibrationGrade) {
      case "A":
        return "text-green-500";
      case "B":
        return "text-blue-500";
      case "C":
        return "text-yellow-500";
      default:
        return "text-red-500";
    }
  };

  const pieColors = ["#3b82f6", "#ef4444", "#f59e0b"];

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
        <h1 className="text-3xl font-bold">Performance</h1>
        <p className="text-muted-foreground mt-1">System calibration and historical results</p>
      </div>

      {/* Calibration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-900/5">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className={`text-4xl font-bold ${getGradeColor()}`}>{data?.calibrationGrade}</p>
            <p className="text-sm text-muted-foreground mt-1">Calibration Grade</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data?.brierScore.toFixed(4)}</p>
            <p className="text-sm text-muted-foreground mt-1">Brier Score</p>
            <p className="text-xs text-muted-foreground">(0=perfect, 0.25=random)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{(data?.overallAccuracy || 0) * 100}%</p>
            <p className="text-sm text-muted-foreground mt-1">Overall Accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2" />
            <p className={`text-2xl font-bold ${(data?.overallRoi || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
              {(data?.overallRoi || 0) > 0 ? "+" : ""}{((data?.overallRoi || 0) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Overall ROI</p>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy by Confidence */}
      <Card>
        <CardHeader>
          <CardTitle>Accuracy by Confidence Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>HIGH Confidence</span>
                <span>{(data?.highConfAccuracy || 0) * 100}%</span>
              </div>
              <Progress value={(data?.highConfAccuracy || 0) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>MEDIUM Confidence</span>
                <span>{(data?.mediumConfAccuracy || 0) * 100}%</span>
              </div>
              <Progress value={(data?.mediumConfAccuracy || 0) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>LOW Confidence</span>
                <span>{(data?.lowConfAccuracy || 0) * 100}%</span>
              </div>
              <Progress value={(data?.lowConfAccuracy || 0) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.history || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                formatter={(value: number, name: string) => [
                  `${(value * 100).toFixed(1)}%`,
                  name === "accuracy" ? "Accuracy" : "ROI",
                ]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Accuracy"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="roi"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="ROI"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance by League */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by League</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left p-4">League</th>
                  <th className="text-center p-4">Total</th>
                  <th className="text-center p-4">Correct</th>
                  <th className="text-center p-4">Accuracy</th>
                  <th className="text-center p-4">ROI</th>
                </td>
              </thead>
              <tbody>
                {data?.byLeague.map((league) => (
                  <tr key={league.league} className="border-b border-border/50">
                    <td className="p-4 font-medium">{league.league}</td>
                    <td className="p-4 text-center">{league.total}</td>
                    <td className="p-4 text-center">{league.correct}</td>
                    <td className="p-4 text-center">{league.accuracy * 100}%</td>
                    <td className={`p-4 text-center ${league.roi >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {league.roi > 0 ? "+" : ""}{league.roi}%
                    </td>
                  </table>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
