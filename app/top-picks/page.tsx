// app/top-picks/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TopPicksPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Top Picks</h1>
        <p className="text-muted-foreground mt-1">
          View the highest-confidence predictions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Rated Selections</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}