"use client"

import { useMemo, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { removeChart, selectFilteredData, type ChartConfig } from "@/lib/features/analytics/analyticsSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface DynamicChartProps {
  config: ChartConfig
}

export function DynamicChart({ config }: DynamicChartProps) {
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectFilteredData)
  const chartRef = useRef<any>(null)

  const chartData = useMemo(() => {
    // Group data by x-axis and aggregate y-axis
    const groupedData = new Map<string, number>()

    data.forEach((row) => {
      const xValue = String(row[config.xAxis] ?? "Unknown")
      const yValue = Number(row[config.yAxis]) || 0

      groupedData.set(xValue, (groupedData.get(xValue) || 0) + yValue)
    })

    const labels = Array.from(groupedData.keys())
    const values = Array.from(groupedData.values())

    const isPieChart = config.type === "pie" || config.type === "doughnut"

    return {
      labels,
      datasets: [
        {
          label: config.yAxis,
          data: values,
          backgroundColor: isPieChart
            ? [
                "rgba(99, 102, 241, 0.8)",
                "rgba(34, 197, 94, 0.8)",
                "rgba(251, 191, 36, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(168, 85, 247, 0.8)",
              ]
            : "rgba(99, 102, 241, 0.8)",
          borderColor: isPieChart
            ? [
                "rgba(99, 102, 241, 1)",
                "rgba(34, 197, 94, 1)",
                "rgba(251, 191, 36, 1)",
                "rgba(239, 68, 68, 1)",
                "rgba(168, 85, 247, 1)",
              ]
            : "rgba(99, 102, 241, 1)",
          borderWidth: 2,
          fill: config.type === "area",
        },
      ],
    }
  }, [data, config])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "hsl(var(--foreground))",
        },
      },
      title: {
        display: false,
      },
    },
    scales:
      config.type !== "pie" && config.type !== "doughnut"
        ? {
            x: {
              ticks: {
                color: "hsl(var(--muted-foreground))",
              },
              grid: {
                color: "hsl(var(--border))",
              },
            },
            y: {
              ticks: {
                color: "hsl(var(--muted-foreground))",
              },
              grid: {
                color: "hsl(var(--border))",
              },
            },
          }
        : undefined,
  }

  const handleDownload = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${config.title.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = url
      link.click()
    }
  }

  const ChartComponent = {
    bar: Bar,
    line: Line,
    area: Line,
    pie: Pie,
    doughnut: Doughnut,
  }[config.type]

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{config.title}</h3>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => dispatch(removeChart(config.id))}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-80">
        <ChartComponent ref={chartRef} data={chartData} options={options} />
      </div>
    </Card>
  )
}
