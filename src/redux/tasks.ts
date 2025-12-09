import firestore, { collection, getDocs, getFirestore } from '@react-native-firebase/firestore';
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

const db = getFirestore();

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({

    getTasks: builder.query<any, { userId: string | undefined }>({
      async queryFn({ userId }) {
        try {
            if (!userId) {
              return { data: [] }; // prevents invalid Firestore paths
            }

            const tasksRef = collection(db, `users/${userId}/tasks`);
            const snapshot = await getDocs(tasksRef);
          
            const tasks = snapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data(),
            }));

           return { data: tasks };   // ✅ IMPORTANT!
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

    getTask: builder.query<any, { userId: string | undefined, taskId: string }>({
      async queryFn({ userId, taskId }) {
        try {
          const docSnap = await firestore()
            .collection("users")
            .doc(userId)
            .collection("tasks")
            .doc(taskId)
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

    getUpdates: builder.query<any, { userId: string | undefined, taskId: string }>({
      async queryFn({ userId, taskId }) {
        try {
            if (!userId || !taskId) {
              return { data: [] }; // prevents invalid Firestore paths
            }

            const docSnap = await firestore()
              .collection("users")
              .doc(userId)
              .collection("tasks")
              .doc(taskId)
              .collection("updates")
              .get()
          
            const updates = docSnap.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data(),
            }));

           return { data: updates };   // ✅ IMPORTANT!
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
  useGetTasksQuery,
  useGetTaskQuery,
  useGetUpdatesQuery
} = tasksApi;
