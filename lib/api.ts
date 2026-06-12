// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard
  async getDashboard<T = unknown>(defaultValue?: T): Promise<T | unknown> {
    try {
      const response = await this.request("/frontend/dashboard");
      return response as T;
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      return defaultValue || {};
    }
  }

  // Legs
  async getAllLegs(filters?: {
    status?: string[];
    confidence?: string[];
    league?: string[];
    date?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status.join(","));
    if (filters?.confidence) params.append("confidence", filters.confidence.join(","));
    if (filters?.league) params.append("league", filters.league.join(","));
    if (filters?.date) params.append("date", filters.date);
    return this.request(`/frontend/legs?${params.toString()}`);
  }

  async getLegForensic(legId: string) {
    return this.request(`/frontend/legs/${legId}/forensic`);
  }

  // Countries & Leagues
  async getCountries() {
    return this.request("/frontend/countries");
  }

  async getStandings(leagueId: number) {
    return this.request(`/frontend/leagues/${leagueId}/standings`);
  }

  async getFixtures(leagueId: number, date?: string) {
    const params = date ? `?date=${date}` : "";
    return this.request(`/frontend/leagues/${leagueId}/fixtures${params}`);
  }

  async getTeams(leagueId: number) {
    return this.request(`/frontend/leagues/${leagueId}/teams`);
  }

  async getTeam(teamId: number) {
    return this.request(`/frontend/teams/${teamId}`);
  }

  // Calendar & Scanning
  async getCalendarMonths() {
    return this.request("/frontend/calendar/months");
  }

  async getCalendarEvents(startDate: string, endDate: string) {
    return this.request(`/frontend/calendar/events?start=${startDate}&end=${endDate}`);
  }

  async scanDate(date: string) {
    return this.request(`/frontend/scan/${date}`, { method: "POST" });
  }

  async scanDateRange(startDate: string, endDate: string) {
    return this.request(`/frontend/scan/range`, {
      method: "POST",
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    });
  }

  // Portfolio & Bankroll
  async getPortfolio() {
    return this.request("/frontend/portfolio");
  }

  async getBankroll() {
    return this.request("/frontend/bankroll");
  }

  async getPerformance() {
    return this.request("/frontend/performance");
  }

  async getParlays() {
    return this.request("/frontend/parlays");
  }

  // Admin & Config
  async getConfig() {
    return this.request("/frontend/config");
  }

  async updateConfig(config: any) {
    return this.request("/frontend/config", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  async getApiBudget() {
    return this.request("/frontend/budget");
  }

  async getDatabaseStats() {
    return this.request("/frontend/stats");
  }
}

export const api = new ApiClient();
