"use client"

import { useEffect, useRef } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function UserGrowthChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  const data = useAppSelector((state) => state.analytics.data)

  useEffect(() => {
    if (!chartRef.current) return

    // Group data by week
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-28)

    const weeklyData: { [key: string]: number } = {}
    sortedData.forEach((item) => {
      const date = new Date(item.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0
      }
      weeklyData[weekKey] += item.users
    })

    const labels = Object.keys(weeklyData).map((date) => {
      const d = new Date(date)
      return `Week ${Math.ceil(d.getDate() / 7)}`
    })

    const users = Object.values(weeklyData)

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Users",
            data: users,
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "rgb(16, 185, 129)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            callbacks: {
              label: (context) => `Users: ${context.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString(),
              color: "rgb(156, 163, 175)",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
            },
          },
          x: {
            ticks: {
              color: "rgb(156, 163, 175)",
            },
            grid: {
              display: false,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [data])

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">User Growth</h2>
        <p className="mt-1 text-sm text-muted-foreground">Weekly user acquisition metrics</p>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>
    </Card>
  )
}
