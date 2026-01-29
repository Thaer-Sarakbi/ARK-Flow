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
          await attendanceRef(userId, date)
            .collection("checkIn")
            .doc("today")
            .set({
              time: new Date(),
              latitude,
              longitude,
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

    addCheckOut: builder.mutation<any, CheckInOut>({
      async queryFn({ userId, date, latitude, longitude, note }) {
        try {
          await attendanceRef(userId, date)
            .collection("checkOut")
            .doc("today")
            .set({
              time: new Date(),
              latitude,
              longitude,
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

    getCheckIn: builder.query<any, { userId: string | undefined; date: string }>({
      async queryFn({ userId, date }) {
        try {
          const docSnap = await attendanceRef(userId, date)
            .collection("checkIn")
            .doc("today")
            .get();

          if (!docSnap.exists) {
            return { data: null };
          }
    
          return {
            data: {
              id: docSnap.id,
              ...docSnap.data(),
            }
          };
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

    getCheckOut: builder.query<any, { userId: string | undefined; date: string }>({
      async queryFn({ userId, date }) {
        try {
          const docSnap = await attendanceRef(userId, date)
            .collection("checkOut")
            .doc("today")
            .get();

          if (!docSnap.exists) {
            return { data: null };
          }
    
          return {
            data: {
              id: docSnap.id,
              ...docSnap.data(),
            }
          };
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

    // getLeaveDays: builder.query<any, { userId: string | undefined }>({
    //   async queryFn({ userId }) {
    //     try{
    //       const snapshot = await firestore()
    //       .collectionGroup("leave")
    //       .get();
    
    //       const userLeaves = snapshot.docs.filter(doc => 
    //         doc.ref.path.includes(`users/${userId}/`)
    //       );

    //       return { data: userLeaves };   // ✅ IMPORTANT!
    //     } catch(err: any){
    //       return {
    //         error: {
    //           status: err.code || "UNKNOWN",
    //           message: err.message || "Unexpected Firestore error",
    //         },
    //       };
    //     }
    //   }
    // }),

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

    getUpdatesDays: builder.query<any, { userId: string | undefined }>({
      async queryFn({ userId }) {
        try{
          const snapshot = await firestore()
          .collectionGroup("updates")
          .get();
    
          const userUpdates = snapshot.docs.filter(doc => 
            doc.ref.path.includes(`users/${userId}/`)
          );

          return { data: userUpdates };   // ✅ IMPORTANT!
        } catch(err: any){
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      }
    }),

    getUpdates: builder.query<any, { userId: string | undefined, date: string }>({
      async queryFn({ userId, date }) {
        try{
          const snapshot = await attendanceRef(userId, date)
          .collection("updates")
          .get();
    
          const userUpdates = snapshot.docs.filter(doc => 
            doc.ref.path.includes(`users/${userId}/`)
          );

          return { data: userUpdates };   // ✅ IMPORTANT!
        } catch(err: any){
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      }
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
  useGetCheckInQuery,
  useGetCheckOutQuery,
  useGetReportRealtimeQuery,
  useGetDaysWorkingRealTimeQuery,
  useGetLeaveRealtimeQuery,
  useGetLeaveDaysRealTimeQuery,
  useGetUpdatesDaysQuery,
  useLazyGetUpdatesDaysQuery,
  useGetUpdatesQuery,
  useDeleteReportMutation,
  useDeleteLeaveMutation
} = attendanceApi;
