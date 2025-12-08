import { collection, getDocs, getFirestore } from '@react-native-firebase/firestore';
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

  }),
});

export const {
  useGetTasksQuery
} = tasksApi;
