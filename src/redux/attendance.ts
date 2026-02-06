// services/attendanceApi.ts
import firestore from '@react-native-firebase/firestore';
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { attendanceRef } from "../utils/firestoreRefs";
import { Report } from "../utils/types";
interface CheckInOut {
  userId: string;
  date: string;
  latitude: number;
  longitude: number;
  note: string;
}

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    addCheckIn: builder.mutation<any, CheckInOut>({
      async queryFn({ userId, date, latitude, longitude, note }) {
        try {
          const [, month, year ] = date.split('-').map(Number);

          const dateObj = new Date(year, month - 1); // day not needed
    
          const docRef = attendanceRef(userId, date);
    
          // Check-in
          await docRef
            .collection("checkIn")
            .doc("today")
            .set({
              time: firestore.FieldValue.serverTimestamp(),
              latitude,
              longitude,
              note,
            });
    
          // Attendance metadata
          await docRef.set(
            {
              date: firestore.Timestamp.fromDate(dateObj),
              year,
              month,
              placeholder: true,
              checkIn: firestore.FieldValue.serverTimestamp(),
              checkInNote: note
            },
            { merge: true }
          );
    
          return { data: true };
        } catch (err: any) {
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    addCheckOut: builder.mutation<any, CheckInOut>({
      async queryFn({ userId, date, latitude, longitude, note }) {
        try {
          const [, month, year ] = date.split('-').map(Number);

          const dateObj = new Date(year, month - 1); // day not needed
    
          const docRef = attendanceRef(userId, date);
    
          // Check-in
          await docRef
            .collection("checkOut")
            .doc("today")
            .set({
              time: firestore.FieldValue.serverTimestamp(),
              latitude,
              longitude,
              note,
            });
    
          // Attendance metadata
          await docRef.set(
            {
              date: firestore.Timestamp.fromDate(dateObj),
              year,
              month,
              placeholder: true,
              checkOut: firestore.FieldValue.serverTimestamp(),
              checkOutNote: note
            },
            { merge: true }
          );
    
          return { data: true };
        } catch (err: any) {
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    addReport: builder.mutation<any, Report>({
      async queryFn({ userId, date, note }) {
        try {
          await attendanceRef(userId, date)
            .collection("report")
            .doc("today")
            .set({
              time: new Date(),
              note,
            });

          return { data: true };
        } catch (err: any) {
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    addLeave: builder.mutation<any, Report>({
      async queryFn({ userId, date, note }) {
        try {
          await attendanceRef(userId, date)
            .collection("leave")
            .doc("today")
            .set({
              time: new Date(),
              note,
            });

          return { data: true };
        } catch (err: any) {
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    getCheckOutRealtime: builder.query<any, { userId: string | undefined; date: string }>({
      async queryFn() {
            // Initial cache value
            return { data: null };
          },
    
          async onCacheEntryAdded(
            { userId, date },
            { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
          ) {
          if (!userId || !date) return;
    
          await cacheDataLoaded;
    
          const checkOutRef = await attendanceRef(userId, date)
            .collection("checkOut")
            .doc("today")
    
          const unsubscribe = checkOutRef.onSnapshot((docSnap) => {
          updateCachedData(() => {
            if (!docSnap.exists) {
              return null; // 🔥 clear cache properly
            }
        
            return {
              id: docSnap.id,
              ...docSnap.data(),
            };
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    getCheckInRealtime: builder.query<any, { userId: string | undefined; date: string }>({
      async queryFn() {
            // Initial cache value
            return { data: null };
          },
    
          async onCacheEntryAdded(
            { userId, date },
            { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
          ) {
          if (!userId || !date) return;
    
          await cacheDataLoaded;
    
          const checkIn = await attendanceRef(userId, date)
            .collection("checkIn")
            .doc("today")
    
          const unsubscribe = checkIn.onSnapshot((docSnap) => {
          updateCachedData(() => {
            if (!docSnap.exists) {
              return null; // 🔥 clear cache properly
            }
        
            return {
              id: docSnap.id,
              ...docSnap.data(),
            };
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    getAttendanceRealtime: builder.query<any[],  { userId: string | undefined; date: string }>({
    // Initial cache value (required)
    async queryFn() {
      return { data: [] };
    },
  
    async onCacheEntryAdded(
      { userId, date },
      { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
    ) {
        if (!userId || !date) return;
    
        const [, month, year] = date.split('-').map(Number);
    
        await cacheDataLoaded;
    
        const attendanceRef = firestore()
          .collection('users')
          .doc(userId)
          .collection('attendance')
          .where('year', '==', year)
          .where('month', '==', month);
    
        const unsubscribe = attendanceRef.onSnapshot((snapshot) => {
          updateCachedData((draft) => {
            // Clear safely
            draft.splice(0, draft.length);
    
            snapshot.docs.forEach((doc) => {
              draft.push({
                id: doc.id,
                ...doc.data(),
              });
            });
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),
  

    getReportRealtime: builder.query<any, { userId?: string | undefined; date?: string }>({
      async queryFn() {
            // Initial cache value
            return { data: null };
          },
    
          async onCacheEntryAdded(
            { userId, date },
            { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
          ) {
          if (!userId || !date) return;
    
          await cacheDataLoaded;
    
          const reportRef = await attendanceRef(userId, date)
            .collection("report")
            .doc("today")
    
          const unsubscribe = reportRef.onSnapshot((docSnap) => {
          updateCachedData(() => {
            if (!docSnap.exists) {
              return null; // 🔥 clear cache properly
            }
        
            return {
              id: docSnap.id,
              ...docSnap.data(),
            };
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    getLeaveRealtime: builder.query<any, { userId: string | undefined; date: string }>({
      async queryFn() {
            // Initial cache value
            return { data: null };
          },
    
          async onCacheEntryAdded(
            { userId, date },
            { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
          ) {
          if (!userId || !date) return;
    
          await cacheDataLoaded;
    
          const leaveRef = await attendanceRef(userId, date)
            .collection("leave")
            .doc("today")
    
          const unsubscribe = leaveRef.onSnapshot((docSnap) => {
          updateCachedData(() => {
            if (!docSnap.exists) {
              return null; // 🔥 clear cache properly
            }
        
            return {
              id: docSnap.id,
              ...docSnap.data(),
            };
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    getDaysWorkingRealTime: builder.query<any[], { userId?: string }>({
      async queryFn() {
        // Initial empty cache
        return { data: [] };
      },
    
      async onCacheEntryAdded(
        { userId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!userId) return;
    
        await cacheDataLoaded;
    
        const reportRef = firestore().collectionGroup("report");
    
        const unsubscribe = reportRef.onSnapshot((snapshot) => {
          updateCachedData((draft) => {
            // clear safely (immer-friendly)
            draft.splice(0, draft.length);
    
            snapshot.docs.forEach((doc) => {
              // Filter only this user's reports
              if (doc.ref.path.includes(`users/${userId}/`)) {
                draft.push({
                  id: doc.id,
                  ...doc.data(),
                });
              }
            });
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),    

    getLeaveDaysRealTime: builder.query<any[], { userId?: string }>({
      async queryFn() {
        // Initial empty cache
        return { data: [] };
      },
    
      async onCacheEntryAdded(
        { userId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!userId) return;
    
        await cacheDataLoaded;
    
        const reportRef = firestore().collectionGroup("leave");
    
        const unsubscribe = reportRef.onSnapshot((snapshot) => {
          updateCachedData((draft) => {
            // clear safely (immer-friendly)
            draft.splice(0, draft.length);
    
            snapshot.docs.forEach((doc) => {
              // Filter only this user's reports
              if (doc.ref.path.includes(`users/${userId}/`)) {
                draft.push({
                  id: doc.id,
                  ...doc.data(),
                });
              }
            });
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    getUpdatesDaysRealTime: builder.query<any[], { userId?: string | undefined }>({
      async queryFn() {
        // Initial empty cache
        return { data: [] };
      },
    
      async onCacheEntryAdded(
        { userId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!userId) return;
    
        await cacheDataLoaded;
    
        const reportRef = firestore().collectionGroup("updates");
    
        const unsubscribe = reportRef.onSnapshot((snapshot) => {
          updateCachedData((draft) => {
            // clear safely (immer-friendly)
            draft.splice(0, draft.length);
    
            snapshot.docs.forEach((doc) => {
              // Filter only this user's reports
              if (doc.ref.path.includes(`users/${userId}/`)) {
                draft.push({
                  id: doc.id,
                  ...doc.data(),
                });
              }
            });
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    getUpdatesRealtime: builder.query<any[], { userId?: string; date: string }>({
      async queryFn() {
        // initial cache value (required)
        return { data: [] };
      },
    
      async onCacheEntryAdded(
        { userId, date },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!userId || !date) return;
    
        await cacheDataLoaded;
    
        const updatesRef = attendanceRef(userId, date)
          .collection("updates");
    
        const unsubscribe = updatesRef.onSnapshot((snapshot) => {
          updateCachedData((draft) => {
            // clear safely (immer-safe)
            draft.splice(0, draft.length);
    
            snapshot.forEach((doc) => {
              draft.push({
                id: doc.id,
                ...doc.data(),
              });
            });
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),
    

    deleteReport: builder.mutation<any, { userId: string, date: string }>({
      async queryFn({ userId, date }) {
        try {
          await firestore()
                .collection("users")
                .doc(userId)
                .collection("attendance")
                .doc(date)
                .collection("report")
                .doc("today")
                .delete()

          return { data: true };
        } catch (err: any) {
          console.log(err)
            return {
              error: {
                status: err.code || "UNKNOWN",
                message: err.message || "Unexpected Firestore error",
              },
              };
            }
          },
    }),

    deleteLeave: builder.mutation<any, { userId: string, date: string }>({
      async queryFn({ userId, date }) {
        try {
          await firestore()
                .collection("users")
                .doc(userId)
                .collection("attendance")
                .doc(date)
                .collection("leave")
                .doc("today")
                .delete()

          return { data: true };
        } catch (err: any) {
          console.log(err)
            return {
              error: {
                status: err.code || "UNKNOWN",
                message: err.message || "Unexpected Firestore error",
              },
              };
            }
          },
    }),
  }),
});

export const {
  useAddCheckInMutation,
  useAddCheckOutMutation,
  useAddReportMutation,
  useAddLeaveMutation,
  useGetCheckInRealtimeQuery,
  useGetCheckOutRealtimeQuery,
  useGetAttendanceRealtimeQuery,
  useGetReportRealtimeQuery,
  useGetDaysWorkingRealTimeQuery,
  useGetLeaveRealtimeQuery,
  useGetLeaveDaysRealTimeQuery,
  useGetUpdatesDaysRealTimeQuery,
  useGetUpdatesRealtimeQuery,
  useDeleteReportMutation,
  useDeleteLeaveMutation
} = attendanceApi;
