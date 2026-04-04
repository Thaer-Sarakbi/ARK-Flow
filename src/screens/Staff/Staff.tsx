import Container from '@/src/components/atoms/Container';
import Loading from '@/src/components/atoms/Loading';
import Spacer from '@/src/components/atoms/Spacer';
import ErrorComponent from '@/src/components/molecules/ErrorComponent';
import Place from '@/src/components/organisms/Place';
import { useGetUsersRealtimeQuery } from '@/src/redux/user';
import { Places } from '@/src/utils/Constants';
import React from 'react';
import { FlatList, View } from 'react-native';

const Staff = () => {
    const { data: listOfUsers, isLoading: isLoadingUsers, isError }= useGetUsersRealtimeQuery()

    if (isLoadingUsers) return <Loading visible={true} />
    if (isError) return <ErrorComponent />

    return (
      <Container headerMiddle="Staff" scrollable={false} drawer>
        <FlatList 
          data={Places}
          keyExtractor={(item, index) => item.value.toString() ?? index.toString()}
          numColumns={2}
          renderItem={({ item, index }) => {
            const isLast = index === Places.length - 1;
            if(isLast){
              return(
                <>
                  <Place label={item.label} image={item.image} users={listOfUsers} latitude={item.latitude} longitude={item.longitude} />
                  <View style={{ flex: 1, marginHorizontal: 8 }} />
                </>
               )
            } else {
                return(
                  <Place label={item.label} image={item.image} users={listOfUsers} latitude={item.latitude} longitude={item.longitude} />
                )
            }
          }}
        />
        <Spacer height={40} />
      </Container>
    )
}

export default Staff