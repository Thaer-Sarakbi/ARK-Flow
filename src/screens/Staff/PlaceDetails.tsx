import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import MapViewComponent from '@/src/components/molecule/MapViewComponent';
import TaskCard from '@/src/components/molecule/TaskCard';
import User from '@/src/components/User';
import { useGetTasksRealtimeQuery } from '@/src/redux/tasks';
import { useGetUsersRealtimeQuery, useUserDataRealTimeQuery } from '@/src/redux/user';
import { Places } from '@/src/utils/Constants';
import { Task } from '@/src/utils/types';
import { getAuth } from '@react-native-firebase/auth';
import React, { useMemo } from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, View } from 'react-native';

const auth = getAuth();

const PlaceDetails = ({ route: { params: { place, latitude, longitude } } }: { route: { params: { place: string, latitude: number, longitude: number } } }) => {
    const { data: user, isLoading, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
    const { data: listOfUsers, isLoading: isLoadingUsers, isError: isErrorUsers }= useGetUsersRealtimeQuery()
    const { data: listOfTasks, isLoading: isLoadingTasks, isError } =  useGetTasksRealtimeQuery({ userId: user?.id }, { skip: !user?.id })

    const filteredUsers = useMemo(() => {
      if (!listOfUsers || !place) return [];
      return listOfUsers.filter(user => user.placeName === place);
    }, [listOfUsers, place]);

    const issues = useMemo(() => {
      if (!listOfTasks) return [];
      
      return [...listOfTasks]
        .filter((t: Task) => t.location === place)
        .sort(
          (a, b) => b.creationDate.seconds - a.creationDate.seconds
        );
    }, [listOfTasks, place]);

    if(isLoadingTasks || isLoading || isLoadingUsers) return <Loading visible={true} />
    if(isErrorUserData || isErrorUsers || isError) return <ErrorComponent />

    return (
      <Container headerMiddle="Place Details" allowBack noPadding drawer>
        <ImageBackground source={Places.find(placeIn => placeIn.label === place)?.image} resizeMode='stretch' style={styles.backgroundImage} />
        <View style={styles.container}>
          <Text style={styles.title}>{place}</Text>
          <Spacer height={6} />
          <Text style={styles.caption}>{filteredUsers.length} Workers</Text>
          <Spacer height={10} />
          <FlatList 
            data={filteredUsers}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyExtractor={(item, index) => item.id.toString() ?? index.toString()}
            renderItem={({ item }) => {
              return(
                <>
                  <User id={item.id} name={item.name} role={item.role} admin={item.admin} place={item.placeName} email={item.email} phone={item.phone} />
                  <Spacer height={10} />
                </>
              )    
            }}
          />
          {(longitude || latitude) &&<MapViewComponent longitude={longitude} latitude={latitude}/>}
          <Spacer height={8} />
          <Text style={[styles.title, { fontSize: 26 }]}>Issues</Text>
          <FlatList 
            scrollEnabled={false}
            data={issues}
            renderItem={({ item }) =>  <TaskCard title={item.title} status={item.status} taskId={item.id} assignedTo={item.assignedTo} duration={item.duration} location={item.location} creationDate={item.creationDate} assignedToId={item.assignedToId}/>}
          />
        </View>     
      </Container>
    )
}

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    padding: 16
  },
  image: { 
    width: '100%', 
    height: 200 
  },
  title: { fontWeight: 'bold', color: COLORS.title,fontSize: 20 },
  caption: { color: COLORS.caption, fontSize: 13 },
  backgroundImage: { width: '100%', height: 200 }
});

export default PlaceDetails