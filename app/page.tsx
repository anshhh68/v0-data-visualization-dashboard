"use client"

import { useState } from "react"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { UserGrowthChart } from "@/components/dashboard/user-growth-chart"
import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart"
import { DataTable } from "@/components/dashboard/data-table"
import { DatabaseConnector } from "@/components/dashboard/database-connector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AnalyticsDataPoint } from "@/lib/features/analytics/analyticsSlice"

const mockData: AnalyticsDataPoint[] = [
  { id: "001", date: "2024-01-15", category: "Electronics", region: "North America", revenue: 45230, users: 1234 },
  { id: "002", date: "2024-01-16", category: "Clothing", region: "Europe", revenue: 32100, users: 987 },
  { id: "003", date: "2024-01-17", category: "Food", region: "Asia", revenue: 28900, users: 1456 },
  { id: "004", date: "2024-01-18", category: "Electronics", region: "Europe", revenue: 52000, users: 1678 },
  { id: "005", date: "2024-01-19", category: "Books", region: "North America", revenue: 19500, users: 734 },
  { id: "006", date: "2024-01-20", category: "Clothing", region: "Asia", revenue: 38700, users: 1123 },
  { id: "007", date: "2024-01-21", category: "Food", region: "North America", revenue: 31200, users: 998 },
  { id: "008", date: "2024-01-22", category: "Electronics", region: "Asia", revenue: 48900, users: 1567 },
  { id: "009", date: "2024-01-23", category: "Books", region: "Europe", revenue: 22400, users: 812 },
  { id: "010", date: "2024-01-24", category: "Clothing", region: "North America", revenue: 41500, users: 1289 },
  { id: "011", date: "2024-01-25", category: "Food", region: "Europe", revenue: 27800, users: 923 },
  { id: "012", date: "2024-01-26", category: "Electronics", region: "North America", revenue: 55600, users: 1789 },
]

export default function DashboardPage() {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [data, setData] = useState<AnalyticsDataPoint[]>(mockData)

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...data].sort((a, b) => {
      const aValue = a[field as keyof AnalyticsDataPoint]
      const bValue = b[field as keyof AnalyticsDataPoint]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return newDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return newDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    setData(sorted)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Data Visualization Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">Monitor key metrics and analytics in real-time</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="database">Connect Database</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <MetricsCards />

            <div className="grid gap-8 lg:grid-cols-2">
              <RevenueChart />
              <UserGrowthChart />
            </div>

            <CategoryDistributionChart />

            <DataTable data={data} onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseConnector />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
