import { configureStore } from "@reduxjs/toolkit"
import analyticsReducer from "./features/analytics/analyticsSlice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      analytics: analyticsReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
