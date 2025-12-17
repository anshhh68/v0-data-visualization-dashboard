import * as XLSX from "xlsx"
import type { AnalyticsDataPoint, ColumnMetadata } from "@/lib/features/analytics/analyticsSlice"

export function detectColumnType(values: unknown[]): "numeric" | "categorical" | "date" | "text" {
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "")

  if (nonNullValues.length === 0) return "text"

  // Check if numeric
  const numericCount = nonNullValues.filter((v) => !isNaN(Number(v))).length
  if (numericCount / nonNullValues.length > 0.8) return "numeric"

  // Check if date
  const dateCount = nonNullValues.filter((v) => {
    const dateValue = new Date(String(v))
    return dateValue instanceof Date && !isNaN(dateValue.getTime())
  }).length
  if (dateCount / nonNullValues.length > 0.8) return "date"

  // Check if categorical (limited unique values)
  const uniqueValues = new Set(nonNullValues)
  if (uniqueValues.size < nonNullValues.length * 0.5 && uniqueValues.size < 20) {
    return "categorical"
  }

  return "text"
}

export function parseCSV(file: File): Promise<{ data: AnalyticsDataPoint[]; columns: ColumnMetadata[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          throw new Error("CSV file must have at least a header row and one data row")
        }

        // Parse header
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))

        // Parse data
        const data: AnalyticsDataPoint[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
          const row: AnalyticsDataPoint = {}

          headers.forEach((header, index) => {
            const value = values[index]
            // Try to convert to number
            const numValue = Number(value)
            row[header] = isNaN(numValue) ? value : numValue
          })

          data.push(row)
        }

        // Detect column types
        const columns: ColumnMetadata[] = headers.map((header) => {
          const values = data.map((row) => row[header])
          const type = detectColumnType(values)

          const metadata: ColumnMetadata = { name: header, type }

          if (type === "categorical") {
            metadata.uniqueValues = Array.from(new Set(values.filter((v) => v !== null && v !== undefined)))
          }

          return metadata
        })

        resolve({ data, columns })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

export function parseExcel(file: File): Promise<{ data: AnalyticsDataPoint[]; columns: ColumnMetadata[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(arrayBuffer, { type: "array" })

        // Get first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null })

        if (jsonData.length === 0) {
          throw new Error("Excel file is empty")
        }

        const data = jsonData as AnalyticsDataPoint[]

        // Get column names
        const headers = Object.keys(data[0])

        // Detect column types
        const columns: ColumnMetadata[] = headers.map((header) => {
          const values = data.map((row) => row[header])
          const type = detectColumnType(values)

          const metadata: ColumnMetadata = { name: header, type }

          if (type === "categorical") {
            metadata.uniqueValues = Array.from(new Set(values.filter((v) => v !== null && v !== undefined))) as (
              | string
              | number
            )[]
          }

          return metadata
        })

        resolve({ data, columns })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

export function exportToCSV(data: AnalyticsDataPoint[], fileName: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
