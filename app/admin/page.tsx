"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription>Admin panel - placeholder for future implementation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is reserved for admin configuration. Currently focusing on the landing page redesign with AI semantic search.</p>
        </CardContent>
      </Card>
    </div>
  )
}
