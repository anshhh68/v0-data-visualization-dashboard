"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { uploadDataFile } from "@/lib/features/analytics/analyticsSlice"
import { parseCSV, parseExcel } from "@/lib/utils/file-parser"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { sampleDataset } from "@/lib/data/sample-dataset"

export function FileUpload() {
  const dispatch = useAppDispatch()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setUploading(true)

      try {
        const fileExtension = file.name.split(".").pop()?.toLowerCase()

        if (!fileExtension || !["csv", "xlsx", "xls"].includes(fileExtension)) {
          throw new Error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
        }

        let parsedData
        if (fileExtension === "csv") {
          parsedData = await parseCSV(file)
        } else {
          parsedData = await parseExcel(file)
        }

        if (parsedData.data.length === 0) {
          throw new Error("File contains no data")
        }

        await dispatch(
          uploadDataFile({
            data: parsedData.data,
            columns: parsedData.columns,
            fileName: file.name,
          }),
        ).unwrap()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process file")
      } finally {
        setUploading(false)
      }
    },
    [dispatch],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    },
    [handleFile],
  )

  const handleLoadSample = useCallback(() => {
    setError(null)
    setUploading(true)

    try {
      dispatch(
        uploadDataFile({
          data: sampleDataset.data,
          columns: sampleDataset.columns,
          fileName: sampleDataset.fileName,
        }),
      ).unwrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sample data")
    } finally {
      setUploading(false)
    }
  }, [dispatch])

  return (
    <Card className="p-8">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          uploading && "pointer-events-none opacity-50",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">Upload your data</h3>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Drag and drop your CSV or Excel file here, or click to browse
        </p>
        <input
          type="file"
          id="file-upload"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        <div className="flex gap-3">
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Processing..." : "Choose File"}
            </label>
          </Button>
          <Button variant="outline" onClick={handleLoadSample} disabled={uploading}>
            Try Sample Data
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Supports CSV, XLSX, and XLS files</p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Upload Error</p>
            <p className="mt-1 text-sm text-destructive/90">{error}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setError(null)} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}
