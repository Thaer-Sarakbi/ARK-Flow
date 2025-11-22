// services/attendanceApi.ts
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

    getReport: builder.query<any, { userId: string | undefined; date: string }>({
      async queryFn({ userId, date }) {
        try {
          const snapshot = await attendanceRef(userId, date)
            .collection("report")
            .get();
    
          const reports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          return { data: reports[0] };
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

    getLeave: builder.query<any, { userId: string | undefined; date: string }>({
      async queryFn({ userId, date }) {
        try {
          const snapshot = await attendanceRef(userId, date)
            .collection("leave")
            .get();
    
          const leave = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          return { data: leave };
        } catch (err: any) {
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    })
  }),
});

export const {
  useAddCheckInMutation,
  useAddCheckOutMutation,
  useAddReportMutation,
  useAddLeaveMutation,
  useGetReportQuery,
  useGetLeaveQuery
} = attendanceApi;
