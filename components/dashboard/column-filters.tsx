"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setColumnFilter, clearColumnFilter, clearAllFilters } from "@/lib/features/analytics/analyticsSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Filter } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function ColumnFilters() {
  const dispatch = useAppDispatch()
  const columns = useAppSelector((state) => state.analytics.columns)
  const columnFilters = useAppSelector((state) => state.analytics.columnFilters)
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set())

  const toggleColumn = (columnName: string) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnName)) {
        next.delete(columnName)
      } else {
        next.add(columnName)
      }
      return next
    })
  }

  const handleNumericFilter = (column: string, min?: number, max?: number) => {
    dispatch(setColumnFilter({ column, filter: { min, max } }))
  }

  const handleCategoricalFilter = (column: string, values: (string | number)[]) => {
    if (values.length === 0) {
      dispatch(clearColumnFilter(column))
    } else {
      dispatch(setColumnFilter({ column, filter: { values } }))
    }
  }

  const activeFilterCount = Object.keys(columnFilters).length

  if (columns.length === 0) return null

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button size="sm" variant="ghost" onClick={() => dispatch(clearAllFilters())}>
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {columns.map((column) => (
          <Collapsible
            key={column.name}
            open={expandedColumns.has(column.name)}
            onOpenChange={() => toggleColumn(column.name)}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="font-medium">{column.name}</span>
                <span className="text-xs text-muted-foreground">{column.type}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              {column.type === "numeric" && (
                <NumericFilter
                  column={column.name}
                  currentFilter={columnFilters[column.name]}
                  onFilter={handleNumericFilter}
                  onClear={() => dispatch(clearColumnFilter(column.name))}
                />
              )}
              {column.type === "categorical" && (
                <CategoricalFilter
                  column={column.name}
                  values={column.uniqueValues || []}
                  currentFilter={columnFilters[column.name]}
                  onFilter={handleCategoricalFilter}
                />
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </Card>
  )
}

function NumericFilter({
  column,
  currentFilter,
  onFilter,
  onClear,
}: {
  column: string
  currentFilter?: { min?: number; max?: number }
  onFilter: (column: string, min?: number, max?: number) => void
  onClear: () => void
}) {
  const [min, setMin] = useState(currentFilter?.min?.toString() || "")
  const [max, setMax] = useState(currentFilter?.max?.toString() || "")

  const handleApply = () => {
    onFilter(column, min ? Number(min) : undefined, max ? Number(max) : undefined)
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`${column}-min`} className="text-xs">
            Min
          </Label>
          <Input
            id={`${column}-min`}
            type="number"
            placeholder="No minimum"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${column}-max`} className="text-xs">
            Max
          </Label>
          <Input
            id={`${column}-max`}
            type="number"
            placeholder="No maximum"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApply} className="flex-1">
          Apply
        </Button>
        {currentFilter && (
          <Button size="sm" variant="outline" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

function CategoricalFilter({
  column,
  values,
  currentFilter,
  onFilter,
}: {
  column: string
  values: (string | number)[]
  currentFilter?: { values?: (string | number)[] }
  onFilter: (column: string, values: (string | number)[]) => void
}) {
  const [selectedValues, setSelectedValues] = useState<Set<string | number>>(new Set(currentFilter?.values || []))

  const toggleValue = (value: string | number) => {
    setSelectedValues((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      onFilter(column, Array.from(next))
      return next
    })
  }

  return (
    <div className="space-y-2">
      {values.slice(0, 10).map((value) => (
        <div key={String(value)} className="flex items-center space-x-2">
          <Checkbox
            id={`${column}-${value}`}
            checked={selectedValues.has(value)}
            onCheckedChange={() => toggleValue(value)}
          />
          <Label htmlFor={`${column}-${value}`} className="cursor-pointer text-sm font-normal">
            {String(value)}
          </Label>
        </div>
      ))}
    </div>
  )
}
