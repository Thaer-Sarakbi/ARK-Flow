import firestore, { collection, getDocs, getFirestore, onSnapshot } from '@react-native-firebase/firestore';
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { attendanceRef } from '../utils/firestoreRefs';
import { Comment, Task, Update } from '../utils/types';

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

    getTasksRealtime: builder.query<any, string | undefined>({
      async queryFn(userId) {
        return { data: [] };
      },
      async onCacheEntryAdded(
        userId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        await cacheDataLoaded;
    
        const tasksRef = collection(db, `users/${userId}/tasks`);
    
        const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
          updateCachedData((draft) => {
            draft.length = 0;
            snapshot.docs.forEach((doc: any) => {
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

    getUpdate: builder.query<any, { userId: string | undefined, taskId: string, updateId: string }>({
      async queryFn({ userId, taskId, updateId }) {
        try {
          const docSnap = await firestore()
            .collection("users")
            .doc(userId)
            .collection("tasks")
            .doc(taskId)
            .collection("updates")
            .doc(updateId)
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

    getComments: builder.query<any, { userId: string | undefined, taskId: string, updateId: string }>({
      async queryFn({ userId, taskId, updateId }) {
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
              .doc(updateId)
              .collection("comments")
              .orderBy("creationDate", "desc")
              .get()
          
            const comments = docSnap.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data(),
            }));

           return { data: comments };   // ✅ IMPORTANT!
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

    addTask: builder.mutation<any, Task>({
      async queryFn({ assignedBy, assignedTo, assignedToId, duration, location, status = 'Not Started', title }) {
        try {
          await firestore()
                .collection("users")
                .doc(assignedToId)
                .collection("tasks")
                .add({
                  assignedBy, 
                  assignedTo, 
                  assignedToId, 
                  creationDate: new Date(), 
                  duration, 
                  location, 
                  status, 
                  title
                })
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

      addUpdate: builder.mutation<any, Update>({
        async queryFn({ id, assignedToId, taskId, title, description, latitude, longitude, date, userId }) {
          try {
              const batch = firestore().batch()

              // Task update ref
              const taskUpdateRef = firestore()
                .collection('users')
                .doc(assignedToId)
                .collection('tasks')
                .doc(taskId)
                .collection('updates')
                .doc(id)

              // Attendance update ref
              const attendUpdateRef = attendanceRef(userId, date)
                .collection('updates')
                .doc(id)

              const now = new Date()

              // Write task update
              batch.set(taskUpdateRef, {
                id,
                taskId,
                assignedToId,
                title,
                description,
                latitude,
                longitude,
                creationDate: now,
              })

              // Write attendance update
              batch.set(attendUpdateRef, {
                id,
                taskId,
                assignedToId,
                title,
                description,
                latitude,
                longitude,
                creationDate: now,
              })

              // Commit batch
              await batch.commit()

              return { data: true }
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

      addComment: builder.mutation<any, Comment>({
          async queryFn({ userId, taskId, updateId, comment, commenter }) {
            try {
                  await firestore()
                  .collection("users")
                  .doc(userId)
                  .collection("tasks")
                  .doc(taskId)
                  .collection("updates")
                  .doc(updateId)
                  .collection("comments")
                  .add({
                    comment,
                    commenter,
                    creationDate: new Date(), 
                  })
              
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
  useGetTasksQuery,
  useGetTasksRealtimeQuery,
  useLazyGetTasksQuery,
  useGetTaskQuery,
  useGetUpdatesQuery,
  useLazyGetUpdatesQuery,
  useGetUpdateQuery,
  useGetCommentsQuery,
  useLazyGetCommentsQuery,
  useAddTaskMutation,
  useAddUpdateMutation,
  useAddCommentMutation
} = tasksApi;
