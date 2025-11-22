import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { usersRef } from '../utils/firestoreRefs'

interface UserListItem {
  id: string
  name: string
}

interface AddUser {
    fullName: string
    email: string
    phoneNumber: string
  }

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
              name: data.fullName
            }
          })
          return { data: usersList }
        } catch (error: any) {
          return { error }
        }
      },
      providesTags: ['Users'],
    }),

    addUser: builder.mutation<any, AddUser>({
        async queryFn({ fullName, email, phoneNumber }) {
          try {
            const res = await usersRef.add({
              fullName,
              email,
              phoneNumber,
              admin: false,
              creationDate: new Date(),
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
  }),
})

export const { useGetUsersQuery, useAddUserMutation } = usersApi
