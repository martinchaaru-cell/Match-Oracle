// app/legs/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Legs</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all analyzed legs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Legs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}