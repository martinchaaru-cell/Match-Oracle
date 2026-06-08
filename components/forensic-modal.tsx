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
                        <span className="
