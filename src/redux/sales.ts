import firestore from '@react-native-firebase/firestore';
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Sale } from '../utils/types';

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    addSales: builder.mutation<any, Sale>({
      async queryFn({ totalSales, totalExpenses, banking, date, place, by, emptyRooms, onlineBooking }) {
        try {
          await firestore()
                .collection("sales")
                .doc(date)
                .collection(place as string)
                .doc("today")
                .set({
                  totalSales,
                  totalExpenses,
                  banking,
                  emptyRooms, 
                  onlineBooking,
                  by
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
  useAddSalesMutation
} = salesApi;
