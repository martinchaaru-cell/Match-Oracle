// app/legs/page.tsx (All Legs)
"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ForensicModal } from "@/components/forensic-modal";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Leg {
  legId: string;
  matchId: string;
  country: string;
  league: string;
  leagueId: number;
  leagueTier: number;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  selection: string;
  selectionOdds: number;
  modelProb: number;
  edge: number;
  status: "APPROVED" | "REJECTED" | "CAUTION";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  statusReason?: string;
}

export default function LegsPage() {
  const [legs, setLegs] = useState<Leg[]>([]);
  const [filteredLegs, setFilteredLegs] = useState<Leg[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [confidenceFilter, setConfidenceFilter] = useState<string[]>([]);
  const [leagueFilter, setLeagueFilter] = useState<string[]>([]);
  const [selectedLeg, setSelectedLeg] = useState<Leg | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [leagues, setLeagues] = useState<string[]>([]);

  useEffect(() => {
    fetchLegs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [legs, searchTerm, statusFilter, confidenceFilter, leagueFilter]);

  const fetchLegs = async () => {
    try {
      const response = await api.getAllLegs();
      setLegs(response.legs);
      // Extract unique leagues for filter
      const uniqueLeagues = [...new Set(response.legs.map((l: Leg) => l.league))];
      setLeagues(uniqueLeagues);
    } catch (error) {
      console.error("Failed to fetch legs:", error);
      toast.error("Failed to load legs");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...legs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (leg) =>
          leg.homeTeam.toLowerCase().includes(term) ||
          leg.awayTeam.toLowerCase().includes(term) ||
          leg.league.toLowerCase().includes(term) ||
          leg.selection.toLowerCase().includes(term)
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((leg) => statusFilter.includes(leg.status));
    }

    if (confidenceFilter.length > 0) {
      filtered = filtered.filter((leg) => confidenceFilter.includes(leg.confidence));
    }

    if (leagueFilter.length > 0) {
      filtered = filtered.filter((leg) => leagueFilter.includes(leg.league));
    }

    setFilteredLegs(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-600 hover:bg-green-700">✅ APPROVED</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">❌ REJECTED</Badge>;
      case "CAUTION":
        return <Badge variant="warning">⚠️ CAUTION</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "HIGH":
        return <Badge className="bg-blue-600">HIGH</Badge>;
      case "MEDIUM":
        return <Badge variant="secondary">MEDIUM</Badge>;
      case "LOW":
        return <Badge variant="outline">LOW</Badge>;
      default:
        return <Badge variant="secondary">{confidence}</Badge>;
    }
  };

  const getEdgeIcon = (edge: number) => {
    if (edge > 0.05) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (edge > 0) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const formatKickoff = (kickoff: string) => {
    const date = new Date(kickoff);
    return date.toLocaleString();
  };

  const handleLegClick = async (leg: Leg) => {
    setSelectedLeg(leg);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Legs</h1>
          <p className="text-muted-foreground mt-1">
            {filteredLegs.length} of {legs.length} legs
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams, leagues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status {statusFilter.length > 0 && `(${statusFilter.length})`}
                  <ChevronDown className="
