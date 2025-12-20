import firestore, { collection, collectionGroup, getDocs, getFirestore, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Comment, Task } from '../utils/types';

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

    getTasksRealtime: builder.query<any[], { userId?: string; admin?: boolean }>({
      async queryFn() {
        // Required initial cache value
        return { data: [] };
      },
      async onCacheEntryAdded(
        { userId, admin },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!admin && !userId) return;

        await cacheDataLoaded;
    
        const tasksRef = admin
        ? collectionGroup(db, "tasks")
        : collection(db, `users/${userId}/tasks`);
       
        const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
          updateCachedData((draft) => {
            // Correct RTKQ mutation-safe clearing
            draft.splice(0, draft.length);
    
            snapshot.forEach((doc: any) => {
              draft.push({
                id: doc.id,
                ...(admin && { userId: doc.ref.parent.parent?.id }),
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

    getTaskRealtime: builder.query<any | null, { userId?: string; taskId: string }>({
      async queryFn() {
        // Initial cache value
        return { data: null };
      },

      async onCacheEntryAdded(
        { userId, taskId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
      if (!userId || !taskId) return;

      await cacheDataLoaded;

      const taskRef = firestore()
        .collection("users")
        .doc(userId)
        .collection("tasks")
        .doc(taskId);

      const unsubscribe = taskRef.onSnapshot((docSnap) => {
      updateCachedData(() => {
        if (!docSnap.exists) return null;

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
          const data = await firestore()
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
             return { data: data.id };
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

      addTaskComment: builder.mutation<any, Comment>({
            async queryFn({ userId, taskId, comment, commenter }) {
              try {
                    await firestore()
                    .collection("users")
                    .doc(userId)
                    .collection("tasks")
                    .doc(taskId)
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

        getRealTaskComments: builder.query<any[], { userId: string | undefined; taskId: string }>({
        async queryFn() {
          // initial empty state
          return { data: [] };
        },
      
        async onCacheEntryAdded(
          { userId, taskId },
          { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
        ) {
          if (!userId || !taskId) return;
          await cacheDataLoaded;
      
          const commentsRef = collection(
            db,
            `users/${userId}/tasks/${taskId}/comments`
          );
      
          const q = query(commentsRef, orderBy("creationDate", "desc")); 
          const unsubscribe = onSnapshot(q, (snapshot) => {
            updateCachedData((draft: any[]) => {
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

      updateTaskStatus: builder.mutation<any, {userId: string | undefined, taskId: string, status: string}>({
        async queryFn({ userId, taskId, status }) {
              try {
                await firestore()
                  .collection("users")
                  .doc(userId)
                  .collection("tasks")
                  .doc(taskId)
                  .update({
                    status
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
        }
      })
  }),
});

export const {
  useGetTasksQuery,
  useGetTasksRealtimeQuery,
  useLazyGetTasksQuery,
  useGetTaskQuery,
  useGetTaskRealtimeQuery,
  useLazyGetTaskQuery,
  useGetCommentsQuery,
  useLazyGetCommentsQuery,
  useAddTaskMutation,
  useAddCommentMutation,
  useAddTaskCommentMutation,
  useGetRealTaskCommentsQuery,
  useUpdateTaskStatusMutation
} = tasksApi;
