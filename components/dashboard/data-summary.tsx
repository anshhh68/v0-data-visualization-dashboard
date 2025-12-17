"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"
import { selectFilteredData } from "@/lib/features/analytics/analyticsSlice"
import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function DataSummary() {
  const data = useAppSelector(selectFilteredData)
  const columns = useAppSelector((state) => state.analytics.columns)

  const summaryMetrics = useMemo(() => {
    const numericColumns = columns.filter((col) => col.type === "numeric")

    return numericColumns.map((col) => {
      const values = data.map((row) => Number(row[col.name]) || 0)
      const sum = values.reduce((acc, val) => acc + val, 0)
      const avg = values.length > 0 ? sum / values.length : 0
      const min = values.length > 0 ? Math.min(...values) : 0
      const max = values.length > 0 ? Math.max(...values) : 0

      return {
        name: col.name,
        count: values.length,
        sum,
        avg,
        min,
        max,
      }
    })
  }, [data, columns])

  if (summaryMetrics.length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryMetrics.map((metric) => (
        <Card key={metric.name} className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-2xl font-bold text-foreground">{metric.sum.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              Avg: {metric.avg.toFixed(2)} • Min: {metric.min} • Max: {metric.max}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
