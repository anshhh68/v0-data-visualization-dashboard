"use client"

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  selectPaginatedData,
  selectFilteredData,
  selectTotalPages,
  setSortField,
  setSortDirection,
  setCurrentPage,
  setRowsPerPage,
} from "@/lib/features/analytics/analyticsSlice"
import { exportToCSV } from "@/lib/utils/file-parser"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DynamicDataTable() {
  const dispatch = useAppDispatch()
  const paginatedData = useAppSelector(selectPaginatedData)
  const allFilteredData = useAppSelector(selectFilteredData)
  const columns = useAppSelector((state) => state.analytics.columns)
  const { currentPage, rowsPerPage, sortField, sortDirection, fileName } = useAppSelector((state) => state.analytics)
  const totalPages = useAppSelector(selectTotalPages)

  const handleSort = (columnName: string) => {
    if (sortField === columnName) {
      dispatch(setSortDirection(sortDirection === "asc" ? "desc" : "asc"))
    } else {
      dispatch(setSortField(columnName))
      dispatch(setSortDirection("asc"))
    }
  }

  const handleExport = () => {
    const exportFileName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "filtered-data"
    exportToCSV(allFilteredData, `${exportFileName}-filtered.csv`)
  }

  if (paginatedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No data available</p>
        <p className="mt-1 text-sm text-muted-foreground">Upload a file to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, allFilteredData.length)}{" "}
          of {allFilteredData.length} results
        </p>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.name}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.name)}
                    className="-ml-3 h-8 font-medium"
                  >
                    {column.name}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.name}>{String(row[column.name] ?? "-")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={String(rowsPerPage)} onValueChange={(value) => dispatch(setRowsPerPage(Number(value)))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => dispatch(setCurrentPage(1))}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => dispatch(setCurrentPage(totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
