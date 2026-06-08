// components/forensic-modal.tsx
"use client";

import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  Brain,
  Repeat,
  Eye,
  Calendar as CalendarIcon,
  Trophy,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { ForensicReport, Leg } from "@/types";
import { useEffect } from "react";

interface ForensicModalProps {
  isOpen: boolean;
  onClose: () => void;
  leg: Leg;
}

export function ForensicModal({ isOpen, onClose, leg }: ForensicModalProps) {
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && leg) {
      fetchForensicReport();
    }
  }, [isOpen, leg]);

  const fetchForensicReport = async () => {
    try {
      const response = await api.getLegForensic(leg.legId);
      setReport(response);
    } catch (error) {
      console.error("Failed to fetch forensic report:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (checkId: string) => {
    const newExpanded = new Set(expandedChecks);
    if (newExpanded.has(checkId)) {
      newExpanded.delete(checkId);
    } else {
      newExpanded.add(checkId);
    }
    setExpandedChecks(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-background rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
          <div>
            <h2 className="text-2xl font-bold">{leg.homeTeam} vs {leg.awayTeam}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{leg.country} • {leg.league} (Tier {leg.leagueTier})</span>
              <span>{new Date(leg.kickoff).toLocaleString()}</span>
              <Badge variant="outline">Odds: {leg.homeOdds} | {leg.drawOdds} | {leg.awayOdds}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          ) : report ? (
            <Tabs defaultValue="m4" className="w-full">
              <TabsList className="grid w-full grid-cols-10 mb-6">
                <TabsTrigger value="m4">M4</TabsTrigger>
                <TabsTrigger value="m5">M5</TabsTrigger>
                <TabsTrigger value="m6">M6</TabsTrigger>
                <TabsTrigger value="m7">M7</TabsTrigger>
                <TabsTrigger value="m8">M8</TabsTrigger>
                <TabsTrigger value="m9">M9</TabsTrigger>
                <TabsTrigger value="m10">M10</TabsTrigger>
                <TabsTrigger value="m26">M26</TabsTrigger>
                <TabsTrigger value="m27">M27</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              {/* M4 Pre-filter */}
              <TabsContent value="m4" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Asymmetric Pre-filter (8 Checks)</h3>
                  <Badge variant={report.m4.passed ? "default" : "destructive"}>
                    {report.m4.checksPassed}/{report.m4.checksTotal} Passed
                  </Badge>
                </div>
                <div className="space-y-2">
                  {report.m4.checkDetails.map((check) => (
                    <div key={check.id} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCheck(`m4-${check.id}`)}
                        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {check.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="text-left">
                            <div className="font-medium">{check.name}</div>
                            <div className="text-sm text-muted-foreground">{check.message}</div>
                          </div>
                        </div>
                        {expandedChecks.has(`m4-${check.id}`) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedChecks.has(`m4-${check.id}`) && (
                        <div className="p-4 border-t border-border bg-secondary/20">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Value:</span>
                              <span className="ml-2 font-mono">{check.value.toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Threshold:</span>
                              <span className="ml-2 font-mono">{check.threshold}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* M5 Forensic Failures */}
              <TabsContent value="m5" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Forensic Failures</h3>
                  <Badge variant={report.m5.passed ? "default" : "destructive"}>
                    Score: {report.m5.failureScore.toFixed(1)} / 4.5
                  </Badge>
                </div>
                <div className="space-y-2">
                  {Object.entries(report.m5.details).map(([failure, weight]) => (
                    <div key={failure} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>{failure.replace(/_/g, " ")}</span>
                      </div>
                      <Badge variant="destructive">+{weight.toFixed(1)} pts</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* M6 Personnel */}
              <TabsContent value="m6" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {leg.homeTeam}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Personnel Score:</span>
                        <span className="font-mono">{report.m6.homeScore}/100</span>
                      </div>
                      {report.m6.homeKeyPlayersMissing.length > 0 && (
                        <div>
                          <span className="text-muted-foreground text-sm">Key Players Missing:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {report.m6.homeKeyPlayersMissing.map((p) => (
                              <Badge key={p} variant="destructive" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground text-sm">Fatigue:</span>
                        <Badge variant="warning" className="ml-2">{report.m6.homeFatigue}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {leg.awayTeam}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Personnel Score:</span>
                        <span className="font-mono">{report.m6.awayScore}/100</span>
                      </div>
                      {report.m6.awayKeyPlayersMissing.length > 0 && (
                        <div>
                          <span className="text-muted-foreground text-sm">Key Players Missing:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {report.m6.awayKeyPlayersMissing.map((p) => (
                              <Badge key={p} variant="destructive" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground text-sm">Fatigue:</span>
                        <Badge variant="warning" className="ml-2">{report.m6.awayFatigue}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* M7 AI Consensus */}
              <TabsContent value="m7" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Multi-AI Consensus
                  </h3>
                  <Badge variant="default">{report.m7.consensus}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(report.m7.narratives).map(([provider, narrative]) => (
                    <div key={provider} className="p-3 rounded-lg bg-secondary/30">
                      <div className="font-medium mb-2">{provider}</div>
                      <p className="text-sm text-muted-foreground">{narrative.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <span className="text-muted-foreground">Agreement Level:</span>
                  <div className="mt-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${report.m7.agreement * 100}%` }} />
                  </div>
                  <div className="text-right text-sm mt-1">{(report.m7.agreement * 100).toFixed(0)}%</div>
                </div>
              </TabsContent>

              {/* M8 Dual Pattern */}
              <TabsContent value="m8" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dual Risk Level:</span>
                      <Badge variant={
                        report.m8.dualRiskLevel === "LOW" ? "default" :
                        report.m8.dualRiskLevel === "MEDIUM" ? "warning" : "destructive"
                      }>
                        {report.m8.dualRiskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Underdog Threat:</span>
                      <span>{report.m8.underdogThreat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pattern Clash Score:</span>
                      <span className="font-mono">{report.m8.patternClashScore.toFixed(3)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resilience Gap:</span>
                      <span className={report.m8.resilienceGap > 0 ? "text-green-500" : "text-red-500"}>
                        {report.m8.resilienceGap > 0 ? "+" : ""}{report.m8.resilienceGap.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patterns Reliable:</span>
                      <Badge variant={report.m8.patternsReliable ? "default" : "destructive"}>
                        {report.m8.patternsReliable ? "YES" : "NO"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* M9 Underdog Scanner */}
              <TabsContent value="m9" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-center mb-4">
                      {(report.m9.underdogEdge * 100).toFixed(1)}%
                    </div>
                    <div className="text-center text-muted-foreground">Underdog Edge</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Threat Level:</span>
                      <Badge variant={
                        report.m9.threatLevel === "NONE" ? "default" :
                        report.m9.threatLevel === "LOW" ? "secondary" :
                        report.m9.threatLevel === "MEDIUM" ? "warning" : "destructive"
                      }>
                        {report.m9.threatLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pattern Score:</span>
                      <span className="font-mono">{report.m9.patternScore.toFixed(0)}/100</span>
                    </div>
                    {report.m9.goldmineQualified && (
                      <Badge className="w-full justify-center bg-yellow-600">🏆 GOLDMINE OPPORTUNITY</Badge>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* M10 Tally Matrix */}
              <TabsContent value="m10" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5" />
                      <span className="font-medium">Matrix Useful:</span>
                      <Badge variant={report.m10.matrixUseful ? "default" : "destructive"}>
                        {report.m10.matrixUseful ? "YES" : "NO"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      <span className="font-medium">Bilateral Prediction:</span>
                      <span>{report.m10.bilateralPrediction}</span>
                      <Badge variant="secondary">{report.m10.bilateralConfidence}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium">Signal:</span>
                      <Badge variant={
                        report.m10.trapValueSignal === "VALUE" ? "default" :
                        report.m10.trapValueSignal === "TRAP" ? "destructive" : "secondary"
                      }>
                        {report.m10.trapValueSignal}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* M26 Match Context */}
              <TabsContent value="m26" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Match Importance:</span>
                      <span className="font-mono">{(report.m26.matchImportance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Context Label:</span>
                      <Badge variant="secondary">{report.m26.contextLabel}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Is Rivalry:</span>
                      <Badge variant={report.m26.isRivalry ? "default" : "secondary"}>
                        {report.m26.isRivalry ? "YES" : "NO"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Home Motivation:</span>
                      <Badge variant={
                        report.m26.homeMotivation === "DESPERATE" ? "destructive" :
                        report.m26.homeMotivation === "HIGH" ? "default" :
                        report.m26.homeMotivation === "NORMAL" ? "secondary" : "warning"
                      }>
                        {report.m26.homeMotivation}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Away Motivation:</span>
                      <Badge variant={
                        report.m26.awayMotivation === "DESPERATE" ? "destructive" :
                        report.m26.awayMotivation === "HIGH" ? "default" :
                        report.m26.awayMotivation === "NORMAL" ? "secondary" : "warning"
                      }>
                        {report.m26.awayMotivation}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* M27 H2H Deep Analysis */}
              <TabsContent value="m27" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Head-to-Head History</h3>
                  <Badge variant="default">{report.m27.h2hLabel}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{report.m27.favWins}</div>
                    <div className="text-sm text-muted-foreground">Favourite Wins</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500">{report.m27.draws}</div>
                    <div className="text-sm text-muted-foreground">Draws</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">{report.m27.undWins}</div>
                    <div className="text-sm text-muted-foreground">Underdog Wins</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Games Analyzed:</span>
                    <span>{report.m27.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draw Rate:</span>
                    <span>{(report.m27.drawRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Psychological Block:</span>
                    <Badge variant={report.m27.psychologicalBlock ? "destructive" : "secondary"}>
                      {report.m27.psychologicalBlock ? "DETECTED" : "NONE"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draw Boost Factor:</span>
                    <span className="font-mono">{report.m27.drawBoostFactor.toFixed(2)}x</span>
                  </div>
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-6">
                <div className={`p-6 rounded-lg ${
                  report.finalStatus === "APPROVED" ? "bg-green-500/10 border border-green-500/20" :
                  report.finalStatus === "REJECTED" ? "bg-red-500/10 border border-red-500/20" :
                  "bg-yellow-500/10 border border-yellow-500/20"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Final Verdict</h3>
                    <Badge variant={
                      report.finalStatus === "APPROVED" ? "default" :
                      report.finalStatus === "REJECTED" ? "destructive" : "warning"
                    }>
                      {report.finalStatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold mb-2">{(report.weightedScore * 100).toFixed(0)}%</div>
                      <div className="text-muted-foreground">Weighted Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold mb-2">{report.finalConfidence}</div>
                      <div className="text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Flags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {report.riskFlags.map((flag) => (
                      <Badge key={flag} variant="warning">{flag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{leg.homeTeam}</div>
                    <div className="text-sm text-muted-foreground">Selection @ {leg.selectionOdds.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold">{(leg.modelProb * 100).toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Win Probability</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">+{(leg.edge * 100).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Edge</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              Failed to load forensic report
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
