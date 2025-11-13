import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { usersRef } from '../utils/firestoreRefs'

interface UserListItem {
  id: string
  name: string
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
              name: data.fullname
            }
          })
          return { data: usersList }
        } catch (error: any) {
          return { error }
        }
      },
      providesTags: ['Users'],
    }),
  }),
})

export const { useGetUsersQuery } = usersApi
