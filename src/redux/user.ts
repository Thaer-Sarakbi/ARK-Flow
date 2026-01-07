import firestore, { getFirestore } from '@react-native-firebase/firestore'
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { usersRef } from '../utils/firestoreRefs'
interface UserListItem {
  id: string
  name: string
  fcmToken: string
}

interface AddUser {
    fullName: string
    email: string,
    password: string,
    phoneNumber: string
    userId: string
  }

const db = getFirestore();

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getUsers: builder.query<UserListItem[], void>({
      async queryFn() {
        try {
          const snapshot = await usersRef.get()

          const usersList: UserListItem[] = snapshot.docs.map(doc => {
            const data = doc.data()
            return{
              id: doc.id,
              name: data.fullName,
              fcmToken: data.fcmToken
            }
          })
          return { data: usersList }
        } catch (error: any) {
          return { error }
        }
      },
      providesTags: ['Users'],
    }),

    getUsersRealtime: builder.query<UserListItem[], void>({
      queryFn: async () => ({ data: [] }),
    
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        await cacheDataLoaded;
    
        const unsubscribe = usersRef.onSnapshot(snapshot => {
          const usersList: UserListItem[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.fullName,
              fcmToken: data.fcmToken,
            };
          });
    
          updateCachedData(() => usersList);
        });
    
        await cacheEntryRemoved;
        unsubscribe();
      },
    
      providesTags: ['Users'],
    }),
    
  

    addUser: builder.mutation<any, AddUser>({
        async queryFn({ fullName, email, phoneNumber, password, userId }) {
          try {
            const res = await usersRef.doc(userId).set({
              fullName,
              email,
              password,
              phoneNumber,
              admin: false,
              creationDate: new Date(),
              verified: false
            }).then((res) => {
               console.log(res)
            }).catch((e) => {
                console.log(e)
            })
            console.log('✅ User Added')
            return { data: { res } }
          } catch (error: any) {
            console.log('Error adding user:', error)
            return { error: { status: 'CUSTOM_ERROR', data: error.message || 'Unknown error' } }
          }
        },
        invalidatesTags: ['Users'], // so cached user lists auto-refresh
      }),

      deleteUser: builder.mutation<any, { userId:string }>({
        async queryFn({ userId }) {
          try {
            await firestore()
                  .collection("users")
                  .doc(userId)
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
})

export const { useGetUsersRealtimeQuery, useGetUsersQuery, useAddUserMutation, useDeleteUserMutation } = usersApi
