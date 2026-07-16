import { configureStore } from '@reduxjs/toolkit'
import { attendanceApi } from './attendance'
import { notificationsApi } from './notifications'
import { salesApi } from './sales'
import uiSlice from './slices/uiSlice'
import { tasksApi } from './tasks'
import { updatesApi } from './updates'
import { usersApi } from './user'

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [updatesApi.reducerPath]: updatesApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    ui: uiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
      .concat(usersApi.middleware)
      .concat(attendanceApi.middleware)
      .concat(tasksApi.middleware)
      .concat(updatesApi.middleware)
      .concat(notificationsApi.middleware)
      .concat(salesApi.middleware)
})
