"use client"

import { useEffect, useRef } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function CategoryDistributionChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  const data = useAppSelector((state) => state.analytics.data)

  useEffect(() => {
    if (!chartRef.current) return

    // Group by category
    const categoryData: { [key: string]: number } = {}
    data.forEach((item) => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = 0
      }
      categoryData[item.category] += item.revenue
    })

    const labels = Object.keys(categoryData)
    const revenues = Object.values(categoryData)

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const colors = [
      "rgba(59, 130, 246, 0.8)",
      "rgba(16, 185, 129, 0.8)",
      "rgba(251, 191, 36, 0.8)",
      "rgba(236, 72, 153, 0.8)",
      "rgba(139, 92, 246, 0.8)",
    ]

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: revenues,
            backgroundColor: colors,
            borderColor: colors.map((c) => c.replace("0.8", "1")),
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgb(156, 163, 175)",
              padding: 16,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            callbacks: {
              label: (context) => {
                const value = context.parsed as number
                const total = revenues.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${context.label}: $${(value / 1000).toFixed(0)}K (${percentage}%)`
              },
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
        <h2 className="text-xl font-semibold text-foreground">Category Distribution</h2>
        <p className="mt-1 text-sm text-muted-foreground">Revenue breakdown by category</p>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>
    </Card>
  )
}
