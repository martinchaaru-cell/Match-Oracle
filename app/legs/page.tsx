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
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("APPROVED")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "APPROVED"]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "APPROVED"));
                    }
                  }}
                >
                  ✅ Approved
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("CAUTION")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "CAUTION"]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "CAUTION"));
                    }
                  }}
                >
                  ⚠️ Caution
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("REJECTED")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "REJECTED"]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "REJECTED"));
                    }
                  }}
                >
                  ❌ Rejected
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Confidence {confidenceFilter.length > 0 && `(${confidenceFilter.length})`}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuCheckboxItem
                  checked={confidenceFilter.includes("HIGH")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfidenceFilter([...confidenceFilter, "HIGH"]);
                    } else {
                      setConfidenceFilter(confidenceFilter.filter((c) => c !== "HIGH"));
                    }
                  }}
                >
                  HIGH
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={confidenceFilter.includes("MEDIUM")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfidenceFilter([...confidenceFilter, "MEDIUM"]);
                    } else {
                      setConfidenceFilter(confidenceFilter.filter((c) => c !== "MEDIUM"));
                    }
                  }}
                >
                  MEDIUM
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={confidenceFilter.includes("LOW")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfidenceFilter([...confidenceFilter, "LOW"]);
                    } else {
                      setConfidenceFilter(confidenceFilter.filter((c) => c !== "LOW"));
                    }
                  }}
                >
                  LOW
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  League {leagueFilter.length > 0 && `(${leagueFilter.length})`}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-96 overflow-y-auto">
                {leagues.map((league) => (
                  <DropdownMenuCheckboxItem
                    key={league}
                    checked={leagueFilter.includes(league)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setLeagueFilter([...leagueFilter, league]);
                      } else {
                        setLeagueFilter(leagueFilter.filter((l) => l !== league));
                      }
                    }}
                  >
                    {league}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" onClick={() => {
              setSearchTerm("");
              setStatusFilter([]);
              setConfidenceFilter([]);
              setLeagueFilter([]);
            }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-[180px]">Match</TableHead>
                <TableHead className="w-[100px]">League</TableHead>
                <TableHead className="w-[140px]">Kickoff</TableHead>
                <TableHead className="w-[80px]">H</TableHead>
                <TableHead className="w-[80px]">D</TableHead>
                <TableHead className="w-[80px]">A</TableHead>
                <TableHead className="w-[120px]">Selection</TableHead>
                <TableHead className="w-[60px]">Prob</TableHead>
                <TableHead className="w-[60px]">Edge</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px]">Conf</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLegs.map((leg) => (
                <TableRow
                  key={leg.legId}
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => handleLegClick(leg)}
                >
                  <TableCell className="font-medium">
                    <div>{leg.homeTeam}</div>
                    <div className="text-sm text-muted-foreground">vs</div>
                    <div>{leg.awayTeam}</div>
                  </TableCell>
                  <TableCell>
                    <div>{leg.league}</div>
                    <div className="text-xs text-muted-foreground">Tier {leg.leagueTier}</div>
                  </TableCell>
                  <TableCell className="text-sm">{formatKickoff(leg.kickoff)}</TableCell>
                  <TableCell className="font-mono">{leg.homeOdds.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">{leg.drawOdds.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">{leg.awayOdds.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{leg.selection}</div>
                    <div className="text-xs text-muted-foreground">@{leg.selectionOdds.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>{(leg.modelProb * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getEdgeIcon(leg.edge)}
                      <span className={leg.edge > 0 ? "text-green-500" : "text-red-500"}>
                        {(leg.edge * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(leg.status)}</TableCell>
                  <TableCell>{getConfidenceBadge(leg.confidence)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Forensic Modal */}
      {selectedLeg && (
        <ForensicModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          leg={selectedLeg}
        />
      )}
    </div>
  );
}
