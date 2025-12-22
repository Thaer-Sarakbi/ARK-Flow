import firestore, { collection, collectionGroup, getDocs, getFirestore, onSnapshot } from '@react-native-firebase/firestore';
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { attendanceRef } from '../utils/firestoreRefs';
import { Comment, Update } from '../utils/types';

const db = getFirestore();

export const updatesApi = createApi({
  reducerPath: "updatesApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getUpdates: builder.query<any, { userId: string | undefined, taskId: string }>({
      async queryFn({ userId, taskId }) {
        try {
            if (!userId || !taskId) {
              return { data: [] }; // prevents invalid Firestore paths
            }

            const updatesRef = collection(db, `users/${userId}/tasks/${taskId}/updates`);
            const snapshot = await getDocs(updatesRef);

            const updates = snapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data(),
            }));

           return { data: updates };
          //   const docSnap = await firestore()
          //     .collection("users")
          //     .doc(userId)
          //     .collection("tasks")
          //     .doc(taskId)
          //     .collection("updates")
          //     .get()
          
          //   const updates = docSnap.docs.map((doc: any) => ({
          //     id: doc.id,
          //     ...doc.data(),
          //   }));

          //  return { data: updates };   // ✅ IMPORTANT!
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

    getUpdatesRealtime: builder.query<any[], { userId?: string; taskId: string; admin?: boolean }>({
          async queryFn() {
            // Required initial cache value
            return { data: [] };
          },
          async onCacheEntryAdded(
            { userId, taskId, admin },
            { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
          ) {
            if (!admin && !userId) return;
    
            await cacheDataLoaded;
        
            const updatesRef = admin
            ? collectionGroup(db, "updates")
            : collection(db, `users/${userId}/tasks/${taskId}/updates`);
           
            const unsubscribe = onSnapshot(updatesRef, (snapshot) => {
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

      getRealUpdateComments: builder.query<any[], { userId: string | undefined; taskId: string; updateId: string }>({
        async queryFn() {
          // initial empty state
          return { data: [] };
        },
      
        async onCacheEntryAdded(
          { userId, taskId, updateId },
          { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
        ) {
          if (!userId || !taskId || !updateId) return;
      
          await cacheDataLoaded;
      
          const commentsRef = collection(
            db,
            `users/${userId}/tasks/${taskId}/updates/${updateId}/comments`
          );
      
          const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
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

      addUpdateComment: builder.mutation<any, Comment>({
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
  useGetUpdatesQuery,
  useLazyGetUpdatesQuery,
  useGetUpdatesRealtimeQuery,
  useGetUpdateQuery,
  useAddUpdateMutation,
  useGetRealUpdateCommentsQuery,
  useAddUpdateCommentMutation
} = updatesApi;
