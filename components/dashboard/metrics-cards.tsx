"use client"

import { useAppSelector } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react"

export function MetricsCards() {
  const data = useAppSelector((state) => state.analytics.data)

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalUsers = data.reduce((sum, item) => sum + item.users, 0)
  const avgConversionRate = data.length > 0 ? data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length : 0

  const metrics = [
    {
      title: "Total Revenue",
      value: `$${(totalRevenue / 1000000).toFixed(2)}M`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-blue-400",
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+8.2%",
      icon: Users,
      color: "text-emerald-400",
    },
    {
      title: "Conversion Rate",
      value: `${avgConversionRate.toFixed(2)}%`,
      change: "+2.4%",
      icon: TrendingUp,
      color: "text-amber-400",
    },
    {
      title: "Growth",
      value: "12.5%",
      change: "+4.1%",
      icon: Activity,
      color: "text-cyan-400",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
                <p className="mt-1 text-xs text-emerald-400">{metric.change} from last period</p>
              </div>
              <div className={`rounded-xl bg-muted/50 p-3 ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
