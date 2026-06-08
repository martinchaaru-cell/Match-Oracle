// app/countries/page.tsx (Country/League Explorer)
"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Search, Trophy, Users, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  leagues: League[];
}

interface League {
  id: number;
  name: string;
  tier: number;
  season: number;
  totalTeams: number;
  logo?: string;
}

interface Team {
  id: number;
  name: string;
  logo?: string;
  position?: number;
  points?: number;
  form?: string[];
}

interface Standing {
  position: number;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string[];
}

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: string;
  homeGoals?: number;
  awayGoals?: number;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [expandedLeagues, setExpandedLeagues] = useState<Set<number>>(new Set());
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("standings");

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredCountries(
        countries.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.leagues.some((l) => l.name.toLowerCase().includes(term))
        )
      );
    } else {
      setFilteredCountries(countries);
    }
  }, [searchTerm, countries]);

  const fetchCountries = async () => {
    try {
      const response = await api.getCountries();
      setCountries(response.countries);
      setFilteredCountries(response.countries);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      toast.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (countryId: number) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
    } else {
      newExpanded.add(countryId);
    }
    setExpandedCountries(newExpanded);
  };

  const toggleLeague = async (league: League) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(league.id)) {
      newExpanded.delete(league.id);
      setSelectedLeague(null);
    } else {
      newExpanded.add(league.id);
      setSelectedLeague(league);
      await Promise.all([
        fetchStandings(league.id),
        fetchFixtures(league.id),
        fetchTeams(league.id),
      ]);
    }
    setExpandedLeagues(newExpanded);
  };

  const fetchStandings = async (leagueId: number) => {
    try {
      const response = await api.getStandings(leagueId);
      setStandings(response.standings);
    } catch (error) {
      console.error("Failed to fetch standings:", error);
    }
  };

  const fetchFixtures = async (leagueId: number) => {
    try {
      const response = await api.getFixtures(leagueId);
      setFixtures(response.fixtures);
    } catch (error) {
      console.error("Failed to fetch fixtures:", error);
    }
  };

  const fetchTeams = async (leagueId: number) => {
    try {
      const response = await api.getTeams(leagueId);
      setTeams(response.teams);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const getFormColor = (result: string) => {
    switch (result) {
      case "W":
        return "bg-green-600";
      case "D":
        return "bg-yellow-600";
      case "L":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Country/League Tree */}
      <div className="w-80 border-r border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries or leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="p-2 space-y-1">
          {filteredCountries.map((country) => (
            <div key={country.id}>
              <button
                onClick={() => toggleCountry(country.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {country.leagues.length}
                  </Badge>
                </div>
                {expandedCountries.has(country.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedCountries.has(country.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {country.leagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => toggleLeague(league)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors ${
                        selectedLeague?.id === league.id ? "bg-secondary/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{league.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Tier {league.tier}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - League Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedLeague ? (
          <div className="p-6 space-y-6">
            {/* League Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{selectedLeague.name}</h1>
                <p className="text-muted-foreground mt-1">
                  Season {selectedLeague.season} • {selectedLeague.totalTeams} Teams • Tier {selectedLeague.tier}
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = `/oracle?league=${selectedLeague.id}`}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Oracle Report
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="standings" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Standings
                </TabsTrigger>
                <TabsTrigger value="fixtures" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Fixtures
                </TabsTrigger>
                <TabsTrigger value="teams" className="gap-2">
                  <Users className="h-4 w-4" />
                  Teams
                </TabsTrigger>
              </TabsList>

              {/* Standings Tab */}
              <TabsContent value="standings" className="mt-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border">
                          <tr className="text-sm text-muted-foreground">
                            <th className="text-left p-4 w-16">Pos</th>
                            <th className="text-left p-4">Team</th>
                            <th className="text-center p-4 w-16">Pld</th>
                            <th className="text-center p-4 w-16">W</th>
                            <th className="text-center p-4 w-16">D</th>
                            <th className="text-center p-4 w-16">L</th>
                            <th className="text-center p-4 w-16">GF</th>
                            <th className="text-center p-4 w-16">GA</th>
                            <th className="text-center p-4 w-16">GD</th>
                            <th className="text-center p-4 w-16">Pts</th>
                            <th className="text-left p-4">Form</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((standing) => (
                            <tr
                              key={standing.teamId}
                              className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                              onClick={() => window.location.href = `/teams/${standing.teamId}`}
                            >
                              <td className="p-4 font-medium">{standing.position}</td>
                              <td className="p-4 font-medium">{standing.teamName}</td>
                              <td className="p-4 text-center">{standing.played}</td>
                              <td className="p-4 text-center">{standing.wins}</td>
                              <td className="p-4 text-center">{standing.draws}</td>
                              <td className="p-4 text-center">{standing.losses}</td>
                              <td className="p-4 text-center">{standing.goalsFor}</td>
                              <td className="p-4 text-center">{standing.goalsAgainst}</td>
                              <td className={`p-4 text-center font-medium ${
                                standing.goalDiff > 0 ? "text-green-500" : standing.goalDiff < 0 ? "text-red-500" : ""
                              }`}>
                                {standing.goalDiff > 0 ? `+${standing.goalDiff}` : standing.goalDiff}
                              </td>
                              <td className="p-4 text-center font-bold">{standing.points}</td>
                              <td className="p-4">
                                <div className="flex gap-1">
                                  {standing.form.slice(0, 5).map((result, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getFormColor(result)}`}
                                    >
                                      {result}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fixtures Tab */}
              <TabsContent value="fixtures" className="mt-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {fixtures.map((fixture) => (
                        <div key={fixture.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                          <div className="flex-1 text-right">
                            <span className="font-medium">{fixture.homeTeam}</span>
                          </div>
                          <div className="mx-8 text-center">
                            {fixture.status === "FT" || fixture.status === "AET" ? (
                              <div className="text-xl font-bold">
                                {fixture.homeGoals} - {fixture.awayGoals}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {new Date(fixture.date).toLocaleDateString()}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {fixture.status === "NS" ? "Not Started" : fixture.status}
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium">{fixture.awayTeam}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Teams Tab */}
              <TabsContent value="teams" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {teams.map((team) => (
                    <Card
                      key={team.id}
                      className="cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => window.location.href = `/teams/${team.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {team.logo && (
                            <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
                          )}
                          <div>
                            <div className="font-medium">{team.name}</div>
                            {team.position && (
                              <div className="text-sm text-muted-foreground">
                                Pos: {team.position} • {team.points} pts
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a league from the left panel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
