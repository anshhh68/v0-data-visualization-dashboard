"use client"

import type { AnalyticsDataPoint } from "@/lib/features/analytics/analyticsSlice"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableProps {
  data: AnalyticsDataPoint[]
  onSort: (field: string) => void
  sortField: string | null
  sortDirection: "asc" | "desc"
}

export function DataTable({ data, onSort, sortField, sortDirection }: DataTableProps) {
  const displayData = data.slice(0, 10) // Show first 10 rows

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("id")}
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                ID
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </th>
            <th className="px-4 py-3 text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("date")}
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Date
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </th>
            <th className="px-4 py-3 text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("category")}
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Category
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </th>
            <th className="px-4 py-3 text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("region")}
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Region
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </th>
            <th className="px-4 py-3 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("revenue")}
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Revenue
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </th>
            <th className="px-4 py-3 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("users")}
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Users
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((row) => (
            <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{row.id}</td>
              <td className="px-4 py-3 text-sm text-foreground">{row.date}</td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  {row.category}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{row.region}</td>
              <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                ${row.revenue.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-sm text-foreground">{row.users.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">Showing 10 of {data.length} records</div>
      )}
    </div>
  )
}
