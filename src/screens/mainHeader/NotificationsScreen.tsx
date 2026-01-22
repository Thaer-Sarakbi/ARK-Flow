import Separator from '@/src/components/atoms/Separator';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import Notification from '@/src/components/Notification';
import { useGetNotificationsRealtimeQuery } from '@/src/redux/notifications';
import { useUserDataRealTimeQuery } from '@/src/redux/user';
import { getAuth } from '@react-native-firebase/auth';
import { FlatList, Image, StyleSheet, View } from 'react-native';

const auth = getAuth();

const NotificationsScreen = () => {
    // const { data: user, loading, isError: isErrorUserData } = useUserData();
    const { data: user, isLoading, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
    const {data: notificationsList, isLoading: isLoadingNots, isError} = useGetNotificationsRealtimeQuery({ userId: user?.id }, { skip: !user?.id })
    if(isLoading || isLoadingNots) return <Loading visible={true} />
    if(isErrorUserData || isError || !notificationsList) return <ErrorComponent />

    return (
      <Container allowBack headerMiddle='Notifications' scrollable={false} noPadding>
        {notificationsList?.length > 0 ? (<FlatList 
          data={notificationsList}
          ItemSeparatorComponent={() => <Separator marginVertical={0} />}
          keyExtractor={(item, index) => item.id ?? index.toString()}
           renderItem={({ item }) => (
             <Notification item={item}/>
           )}
        />) : (
          <View style={styles.imageContainer}>
            <Image source={require('../../../assets/emptyNotifications.png')} style={styles.image} />
          </View>
        )}
      </Container>
    )
}

const styles = StyleSheet.create({
  imageContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  image: {  width: 200, height: 200  }
});

export default NotificationsScreen