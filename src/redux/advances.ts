import firestore, {
  collection,
  collectionGroup,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from "@react-native-firebase/firestore";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Advance } from "../utils/types";

const db = getFirestore();

export const advancesApi = createApi({
  reducerPath: "advancesApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getAdvances: builder.query<any, { userId: string | undefined }>({
      async queryFn({ userId }) {
        try {
          if (!userId) {
            return { data: [] }; // prevents invalid Firestore paths
          }

          const advancesRef = collection(db, `users/${userId}/advances`);
          const snapshot = await getDocs(advancesRef);

          const tasks = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          }));

          return { data: tasks }; // ✅ IMPORTANT!
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
    getAdvancesRealtime: builder.query<any[], { userId?: string }>({
      async queryFn() {
        // Required initial cache value
        return { data: [] };
      },
      async onCacheEntryAdded(
        { userId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!userId) return;

        await cacheDataLoaded;

        const advancesRef = collectionGroup(db, "advances");

        const unsubscribe = onSnapshot(advancesRef, (snapshot) => {
          updateCachedData((draft) => {
            // Correct RTKQ mutation-safe clearing
            draft.splice(0, draft.length);

            snapshot.forEach((doc: any) => {
              draft.push({
                id: doc.id,
                ...{ userId: doc.ref.parent.parent?.id },
                ...doc.data(),
              });
            });
          });
        });

        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    getAdvanceRealtime: builder.query<
      any | null,
      { userId?: string; advanceId: string }
    >({
      async queryFn() {
        // Initial cache value
        return { data: null };
      },

      async onCacheEntryAdded(
        { userId, advanceId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!userId || !advanceId) return;

        await cacheDataLoaded;

        const advanceRef = firestore()
          .collection("users")
          .doc(userId)
          .collection("advances")
          .doc(advanceId);

        const unsubscribe = advanceRef.onSnapshot((docSnap) => {
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

    addAdvance: builder.mutation<any, Advance>({
      async queryFn({
        requestedBy,
        requestedById,
        amount,
        location,
        status = "Pending",
        statusId = 1,
        title,
        description,
      }) {
        try {
          const data = await firestore()
            .collection("users")
            .doc(requestedById)
            .collection("advances")
            .add({
              requestedBy,
              requestedById,
              creationDate: new Date(),
              amount,
              location,
              status,
              statusId,
              title,
              description,
            });
          return { data: data.id };
        } catch (err: any) {
          console.log(err);
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    updateAdvanceStatus: builder.mutation<
      any,
      {
        userId: string | undefined;
        advanceId: string;
        status: string;
        statusId: string;
      }
    >({
      async queryFn({ userId, advanceId, status, statusId }) {
        try {
          await firestore()
            .collection("users")
            .doc(userId)
            .collection("advances")
            .doc(advanceId)
            .update({
              status,
              statusId,
            });
          return { data: true };
        } catch (err: any) {
          console.log(err);
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    updateAdvanceBalance: builder.mutation<
      any,
      { updatedBalance: number | undefined; id: string | undefined }
    >({
      async queryFn({ updatedBalance, id }) {
        try {
          await firestore().collection("users").doc(id).update({
            salaryAdvance: updatedBalance,
          });
          return { data: true };
        } catch (err: any) {
          console.log(err);
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    getBalanceHistoryRealtime: builder.query<any[], { userId?: string }>({
      async queryFn() {
        return { data: [] };
      },

      async onCacheEntryAdded(
        { userId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!userId) return;

        await cacheDataLoaded;

        const advancesRef = collectionGroup(db, "balanceHistory");

        const unsubscribe = onSnapshot(advancesRef, (snapshot) => {
          const history = snapshot.docs
            .filter((doc: any) => doc.ref.parent.parent?.id === userId)
            .map((doc: any) => ({
              id: doc.id,
              userId: doc.ref.parent.parent?.id,
              ...doc.data(),
            }));

          updateCachedData((draft) => {
            draft.splice(0, draft.length);
            draft.push(...history);
          });
        });

        await cacheEntryRemoved;
        unsubscribe();
      },
    }),

    addAdvanceComment: builder.mutation<
      any,
      { userId: string; advanceId: string; comment: string; commenter: string }
    >({
      async queryFn({ userId, advanceId, comment, commenter }) {
        try {
          await firestore()
            .collection("users")
            .doc(userId)
            .collection("advances")
            .doc(advanceId)
            .collection("comments")
            .add({
              comment,
              commenter,
              creationDate: new Date(),
            });
          return { data: true };
        } catch (err: any) {
          console.log(err);
          return {
            error: {
              status: err.code || "UNKNOWN",
              message: err.message || "Unexpected Firestore error",
            },
          };
        }
      },
    }),

    getRealAdvanceComments: builder.query<
      any[],
      { userId: string | undefined; advanceId: string }
    >({
      async queryFn() {
        // initial empty state
        return { data: [] };
      },

      async onCacheEntryAdded(
        { userId, advanceId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!userId || !advanceId) return;
        await cacheDataLoaded;

        const commentsRef = collection(
          db,
          `users/${userId}/advances/${advanceId}/comments`,
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
  }),
});

export const {
  useAddAdvanceMutation,
  useGetAdvancesRealtimeQuery,
  useLazyGetAdvancesQuery,
  useGetAdvanceRealtimeQuery,
  useUpdateAdvanceStatusMutation,
  useUpdateAdvanceBalanceMutation,
  useGetBalanceHistoryRealtimeQuery,
  useAddAdvanceCommentMutation,
  useGetRealAdvanceCommentsQuery,
} = advancesApi;
