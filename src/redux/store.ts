import { configureStore } from '@reduxjs/toolkit'
import { attendanceApi } from './attendance'
import { usersApi } from './user'

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
      .concat(usersApi.middleware)
      .concat(attendanceApi.middleware),
})
