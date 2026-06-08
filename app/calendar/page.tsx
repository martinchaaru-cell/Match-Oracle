// app/calendar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Calendar, Search, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CalendarEvent {
  date: string;
  legCount: number;
  approvedCount: number;
  rejectedCount: number;
  cautionCount: number;
  scanned: boolean;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Map<string, CalendarEvent>>(new Map());
  const [scanning, setScanning] = useState(false);
  const [legs, setLegs] = useState<any[]>([]);
  const [loadingLegs, setLoadingLegs] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchMonthEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDateLegs();
    }
  }, [selectedDate]);

  const fetchMonthEvents = async () => {
    try {
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const response = await api.getCalendarEvents(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
      const eventsMap = new Map();
      response.events.forEach((event: CalendarEvent) => {
        eventsMap.set(event.date, event);
      });
      setEvents(eventsMap);
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    }
  };

  const fetchDateLegs = async () => {
    setLoadingLegs(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await api.getAllLegs({ date: dateStr });
      setLegs(response.legs);
    } catch (error) {
      console.error("Failed to fetch legs for date:", error);
    } finally {
      setLoadingLegs(false);
    }
  };

  const scanDate = async () => {
    setScanning(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      await api.scanDate(dateStr);
      toast.success(`Scan complete for ${dateStr}`);
      await fetchMonthEvents();
      await fetchDateLegs();
    } catch (error) {
      toast.error("Scan failed");
      console.error("Scan failed:", error);
    } finally {
      setScanning(false);
    }
  };

  const scanRange = async () => {
    setScanning(true);
    try {
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      await api.scanDateRange(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
      toast.success(`Batch scan complete for ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
      await fetchMonthEvents();
      await fetchDateLegs();
    } catch (error) {
      toast.error("Batch scan failed");
      console.error("Batch scan failed:", error);
    } finally {
      setScanning(false);
    }
  };

  const getDayContent = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const event = events.get(dateStr);
    
    if (!event || !event.scanned) {
      return <div className="text-center">{date.getDate()}</div>;
    }
    
    return (
      <div className="relative">
        <div className="text-center">{date.getDate()}</div>
        <div className="flex justify-center gap-1 mt-1">
          {event.approvedCount > 0 && (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          )}
          {event.cautionCount > 0 && (
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          )}
          {event.rejectedCount > 0 && (
            <div className="w-2 h-2 rounded-full bg-red-500" />
          )}
        </div>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "CAUTION":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Calendar Panel */}
      <div className="w-96 border-r border-border overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </h2>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              components={{
                DayContent: ({ date }) => getDayContent(date),
              }}
              className="rdp-dark"
              styles={{
                day: {
                  padding: "8px",
                },
              }}
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={scanDate}
              disabled={scanning}
              className="w-full gap-2"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Scan Selected Date
            </Button>
            <Button
              onClick={scanRange}
              disabled={scanning}
              variant="outline"
              className="w-full gap-2"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Scan Entire Month
            </Button>
          </div>

          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Legend</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Approved Legs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Caution Legs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Rejected Legs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h1>
          <p className="text-muted-foreground mt-1">
            Oracle analysis for selected date
          </p>
        </div>

        {loadingLegs ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : legs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data available for this date</p>
              <Button onClick={scanDate} className="mt-4" variant="outline">
                Scan this date
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{legs.length}</div>
                  <div className="text-sm text-muted-foreground">Total Legs</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {legs.filter((l) => l.status === "APPROVED").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {legs.filter((l) => l.status === "CAUTION").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Caution</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {legs.filter((l) => l.status === "REJECTED").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </CardContent>
              </Card>
            </div>

            {/* Legs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Legs Analyzed</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-sm text-muted-foreground">
                        <th className="text-left p-4">Match</th>
                        <th className="text-left p-4">League</th>
                        <th className="text-left p-4">Selection</th>
                        <th className="text-center p-4">Odds</th>
                        <th className="text-center p-4">Prob</th>
                        <th className="text-center p-4">Edge</th>
                        <th className="text-center p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {legs.map((leg) => (
                        <tr key={leg.legId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                          <td className="p-4">
                            <div className="font-medium">{leg.homeTeam} vs {leg.awayTeam}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(leg.kickoff).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>{leg.league}</div>
                            <div className="text-xs text-muted-foreground">Tier {leg.leagueTier}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{leg.selection}</div>
                          </td>
                          <td className="p-4 text-center font-mono">{leg.selectionOdds.toFixed(2)}</td>
                          <td className="p-4 text-center">{(leg.modelProb * 100).toFixed(0)}%</td>
                          <td className={`p-4 text-center ${leg.edge > 0 ? "text-green-500" : "text-red-500"}`}>
                            {leg.edge > 0 ? "+" : ""}{(leg.edge * 100).toFixed(1)}%
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center">
                              {getStatusIcon(leg.status)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
