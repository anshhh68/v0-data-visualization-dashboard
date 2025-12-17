import type { ColumnMetadata } from "@/lib/features/analytics/analyticsSlice"

export interface ChartRecommendation {
  type: "bar" | "line" | "pie" | "doughnut" | "area"
  xAxis: string
  yAxis: string
  title: string
  confidence: number
  reason: string
}

export function recommendCharts(columns: ColumnMetadata[]): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = []

  const numericColumns = columns.filter((col) => col.type === "numeric")
  const categoricalColumns = columns.filter((col) => col.type === "categorical" || col.type === "text")
  const dateColumns = columns.filter((col) => col.type === "date")

  // Time series recommendations
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    numericColumns.forEach((numCol) => {
      recommendations.push({
        type: "line",
        xAxis: dateColumns[0].name,
        yAxis: numCol.name,
        title: `${numCol.name} Over Time`,
        confidence: 0.95,
        reason: "Date column detected - line chart ideal for time series",
      })
    })
  }

  // Categorical vs Numeric (bar charts)
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    categoricalColumns.slice(0, 2).forEach((catCol) => {
      numericColumns.slice(0, 2).forEach((numCol) => {
        // Check if categorical has reasonable number of unique values
        const uniqueCount = catCol.uniqueValues?.length || 0
        if (uniqueCount > 1 && uniqueCount <= 20) {
          recommendations.push({
            type: "bar",
            xAxis: catCol.name,
            yAxis: numCol.name,
            title: `${numCol.name} by ${catCol.name}`,
            confidence: 0.85,
            reason: `Categorical data with ${uniqueCount} categories - bar chart recommended`,
          })
        }
      })
    })
  }

  // Pie/Doughnut for composition
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const firstCat = categoricalColumns[0]
    const firstNum = numericColumns[0]
    const uniqueCount = firstCat.uniqueValues?.length || 0

    if (uniqueCount >= 2 && uniqueCount <= 8) {
      recommendations.push({
        type: "doughnut",
        xAxis: firstCat.name,
        yAxis: firstNum.name,
        title: `${firstNum.name} Distribution by ${firstCat.name}`,
        confidence: 0.75,
        reason: `Good for showing proportions with ${uniqueCount} categories`,
      })
    }
  }

  // Sort by confidence and return top recommendations
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
}
