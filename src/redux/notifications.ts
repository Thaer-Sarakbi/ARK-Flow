import firestore, { collection, getFirestore, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Notifications } from '../utils/types';

const db = getFirestore();

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({

    getNotifications: builder.query<any, { userId: string | undefined }>({
      async queryFn({ userId }) {
        try {
            if (!userId) {
              return { data: [] }; // prevents invalid Firestore paths
            }

            const docSnap = await firestore()
            .collection("users")
            .doc(userId)
            .collection("notifications")
            .orderBy("creationDate", "desc")
            .get()
          
            const notifications = docSnap.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data(),
            }));

           return { data: notifications };   // ✅ IMPORTANT!
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

    getNotificationsRealtime: builder.query<any[], { userId?: string | undefined }>({
      async queryFn() {
        // Required initial cache value
        return { data: [] };
      },
      async onCacheEntryAdded(
        { userId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!userId) return;

        await cacheDataLoaded;
    
        //const notificationsRef = collection(db, `users/${userId}/notifications`);
        const notificationsRef = query(
          collection(db, `users/${userId}/notifications`),
          orderBy('creationDate', 'desc')
        );
       
        const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
          updateCachedData((draft) => {
            // Correct RTKQ mutation-safe clearing
            draft.splice(0, draft.length);
    
            snapshot.forEach((doc: any) => {
              draft.push({
                id: doc.id,
                ...({ userId: doc.ref.parent.parent?.id }),
                ...doc.data(),
              });
            });
          });
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    addNotification: builder.mutation<any, Notifications>({
        async queryFn({ userId, title, message, screenId, screenName, by, assignedToId, taskId, assignedById }) {
          try {
            await firestore()
                  .collection("users")
                  .doc(userId)
                  .collection("notifications")
                  .add({
                    readed: false,
                    title,
                    message, 
                    screenId, 
                    screenName,
                    by,
                    assignedToId,
                    taskId,
                    assignedById,
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

    updateNotificationStatus: builder.mutation<any, {userId: string | undefined, notificationId: string}>({
        async queryFn({ userId, notificationId }) {
            try {
              await firestore()
                    .collection("users")
                    .doc(userId)
                    .collection("notifications")
                    .doc(notificationId)
                    .update({
                      readed: true
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
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useAddNotificationMutation,
  useGetNotificationsRealtimeQuery,
  useUpdateNotificationStatusMutation
} = notificationsApi;
