"use client"

import { useEffect, useRef } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function RevenueChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  const data = useAppSelector((state) => state.analytics.data)

  useEffect(() => {
    if (!chartRef.current) return

    // Sort data by date and take last 30 days
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30)

    const labels = sortedData.map((item) => {
      const date = new Date(item.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    const revenues = sortedData.map((item) => item.revenue / 1000) // Convert to thousands

    // Destroy previous chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revenues,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
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
              label: (context) => `Revenue: $${context.parsed.y.toFixed(0)}K`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${value}K`,
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
              color: "rgba(255, 255, 255, 0.05)",
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
        <h2 className="text-xl font-semibold text-foreground">Revenue Trend</h2>
        <p className="mt-1 text-sm text-muted-foreground">Daily revenue over the last 30 days</p>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>
    </Card>
  )
}
