// services/attendanceApi.ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { attendanceRef } from "../utils/firestoreRefs";

interface CheckInOut {
  userId: string;
  date: string;
  latitude: number;
  longitude: number;
  note: string;
}

interface Report {
  userId: string;
  date: string;
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
  }),
});

export const {
  useAddCheckInMutation,
  useAddCheckOutMutation,
  useAddReportMutation,
  useAddLeaveMutation,
} = attendanceApi;
