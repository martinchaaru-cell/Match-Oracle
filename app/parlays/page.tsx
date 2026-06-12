// app/parlays/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParlaysPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Parlays</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track parlay combinations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parlay Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}