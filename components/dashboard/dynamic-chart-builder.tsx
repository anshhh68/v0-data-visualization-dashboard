"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addChart, type ChartConfig } from "@/lib/features/analytics/analyticsSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export function DynamicChartBuilder() {
  const dispatch = useAppDispatch()
  const columns = useAppSelector((state) => state.analytics.columns)
  const [chartType, setChartType] = useState<ChartConfig["type"]>("bar")
  const [xAxis, setXAxis] = useState("")
  const [yAxis, setYAxis] = useState("")
  const [title, setTitle] = useState("")

  const numericColumns = columns.filter((col) => col.type === "numeric")
  const categoricalColumns = columns.filter((col) => col.type === "categorical" || col.type === "text")

  const handleAddChart = () => {
    if (!xAxis || !yAxis || !title) return

    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: chartType,
      xAxis,
      yAxis,
      title,
    }

    dispatch(addChart(newChart))

    // Reset form
    setTitle("")
  }

  if (columns.length === 0) return null

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Create New Chart</h3>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="chart-type">Chart Type</Label>
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartConfig["type"])}>
              <SelectTrigger id="chart-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="doughnut">Doughnut Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chart-title">Chart Title</Label>
            <Input
              id="chart-title"
              placeholder="e.g., Sales by Region"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="x-axis">X-Axis</Label>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger id="x-axis">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {categoricalColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="y-axis">Y-Axis</Label>
            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger id="y-axis">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleAddChart} disabled={!xAxis || !yAxis || !title} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Chart
        </Button>
      </div>
    </Card>
  )
}
