import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/lib/store"

export interface AnalyticsDataPoint {
  [key: string]: string | number | boolean | null
}

export interface ColumnMetadata {
  name: string
  type: "numeric" | "categorical" | "date" | "text"
  uniqueValues?: (string | number)[]
}

export interface ChartConfig {
  id: string
  type: "bar" | "line" | "pie" | "doughnut" | "area"
  xAxis: string
  yAxis: string
  title: string
}

interface AnalyticsState {
  data: AnalyticsDataPoint[]
  columns: ColumnMetadata[]
  loading: boolean
  error: string | null
  searchQuery: string
  sortField: string | null
  sortDirection: "asc" | "desc"
  currentPage: number
  rowsPerPage: number
  columnFilters: Record<string, { min?: number; max?: number; values?: (string | number)[] }>
  charts: ChartConfig[]
  viewMode: "table" | "chart"
  fileName: string | null
}

const initialState: AnalyticsState = {
  data: [],
  columns: [],
  loading: false,
  error: null,
  searchQuery: "",
  sortField: null,
  sortDirection: "asc",
  currentPage: 1,
  rowsPerPage: 10,
  columnFilters: {},
  charts: [],
  viewMode: "table",
  fileName: null,
}

export const uploadDataFile = createAsyncThunk(
  "analytics/uploadDataFile",
  async (payload: { data: AnalyticsDataPoint[]; columns: ColumnMetadata[]; fileName: string }) => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return payload
  },
)

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.currentPage = 1
    },
    setSortField: (state, action: PayloadAction<string>) => {
      state.sortField = action.payload
    },
    setSortDirection: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortDirection = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload
      state.currentPage = 1
    },
    setColumnFilter: (
      state,
      action: PayloadAction<{ column: string; filter: { min?: number; max?: number; values?: (string | number)[] } }>,
    ) => {
      state.columnFilters[action.payload.column] = action.payload.filter
      state.currentPage = 1
    },
    clearColumnFilter: (state, action: PayloadAction<string>) => {
      delete state.columnFilters[action.payload]
    },
    clearAllFilters: (state) => {
      state.columnFilters = {}
      state.searchQuery = ""
      state.currentPage = 1
    },
    addChart: (state, action: PayloadAction<ChartConfig>) => {
      state.charts.push(action.payload)
    },
    removeChart: (state, action: PayloadAction<string>) => {
      state.charts = state.charts.filter((chart) => chart.id !== action.payload)
    },
    updateChart: (state, action: PayloadAction<ChartConfig>) => {
      const index = state.charts.findIndex((chart) => chart.id === action.payload.id)
      if (index !== -1) {
        state.charts[index] = action.payload
      }
    },
    setViewMode: (state, action: PayloadAction<"table" | "chart">) => {
      state.viewMode = action.payload
    },
    clearData: (state) => {
      state.data = []
      state.columns = []
      state.charts = []
      state.columnFilters = {}
      state.searchQuery = ""
      state.fileName = null
      state.currentPage = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDataFile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadDataFile.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data
        state.columns = action.payload.columns
        state.fileName = action.payload.fileName
        state.currentPage = 1
        state.columnFilters = {}
        state.searchQuery = ""
      })
      .addCase(uploadDataFile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to process file"
      })
  },
})

export const {
  setSearchQuery,
  setSortField,
  setSortDirection,
  setCurrentPage,
  setRowsPerPage,
  setColumnFilter,
  clearColumnFilter,
  clearAllFilters,
  addChart,
  removeChart,
  updateChart,
  setViewMode,
  clearData,
} = analyticsSlice.actions

export const selectFilteredData = (state: RootState) => {
  let filteredData = state.analytics.data

  // Apply search filter
  if (state.analytics.searchQuery) {
    const query = state.analytics.searchQuery.toLowerCase()
    filteredData = filteredData.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(query)),
    )
  }

  // Apply column filters
  Object.entries(state.analytics.columnFilters).forEach(([column, filter]) => {
    filteredData = filteredData.filter((item) => {
      const value = item[column]

      // Range filter for numeric data
      if (filter.min !== undefined || filter.max !== undefined) {
        const numValue = typeof value === "number" ? value : Number.parseFloat(String(value))
        if (isNaN(numValue)) return false
        if (filter.min !== undefined && numValue < filter.min) return false
        if (filter.max !== undefined && numValue > filter.max) return false
      }

      // Value filter for categorical data
      if (filter.values && filter.values.length > 0) {
        return filter.values.includes(value as string | number)
      }

      return true
    })
  })

  return filteredData
}

export const selectSortedData = (state: RootState) => {
  const filteredData = selectFilteredData(state)

  if (state.analytics.sortField) {
    return [...filteredData].sort((a, b) => {
      const field = state.analytics.sortField!
      const aVal = a[field]
      const bVal = b[field]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === "string" && typeof bVal === "string") {
        return state.analytics.sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return state.analytics.sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }

      return 0
    })
  }

  return filteredData
}

export const selectPaginatedData = (state: RootState) => {
  const sortedData = selectSortedData(state)
  const startIndex = (state.analytics.currentPage - 1) * state.analytics.rowsPerPage
  const endIndex = startIndex + state.analytics.rowsPerPage
  return sortedData.slice(startIndex, endIndex)
}

export const selectTotalPages = (state: RootState) => {
  const filteredData = selectFilteredData(state)
  return Math.ceil(filteredData.length / state.analytics.rowsPerPage)
}

export const selectLoading = (state: RootState) => state.analytics.loading
export const selectError = (state: RootState) => state.analytics.error

export default analyticsSlice.reducer
