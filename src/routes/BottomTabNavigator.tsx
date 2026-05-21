import AwesomeIcon from '@expo/vector-icons/FontAwesome5';
import Icon from '@expo/vector-icons/Ionicons';
import { getAuth } from '@react-native-firebase/auth';
import { doc, getFirestore, updateDoc } from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import Loading from '../components/atoms/Loading';
import ErrorComponent from '../components/molecules/ErrorComponent';
import { useUserDataRealTimeQuery } from '../redux/user';
import AttendanceScreen from '../screens/bottomNav/AttendanceScreen';
import CalendarScreen from '../screens/bottomNav/CalendarScreen';
import HomeScreen from '../screens/bottomNav/HomeScreen';
import Staff from '../screens/Staff/Staff';
import { COLORS } from '../utils/colors';

const Tab = createBottomTabNavigator<BottomNavigatorParamsList>();

export type BottomNavigatorParamsList = {
  Home: undefined,
  Attendance: undefined,
  Calendar: undefined,
  Staff: undefined
}

const auth = getAuth();
const db = getFirestore();

const BottomNavigator = () => {
  const uid = auth.currentUser?.uid ?? null;
  const { data, isLoading, isError } = useUserDataRealTimeQuery(uid);

  useEffect(() => { 
    setTimeout(() => { 
      if(!data?.fcmToken && auth.currentUser) { 
        getFcmToken(); 
      } 
    }, 2000); 
  },[data?.fcmToken, auth.currentUser])

  // Get the FCM token 
  async function getFcmToken() {
    let fcmToken = await messaging().getToken().catch((e) => console.log(e));
    console.log('FCM Token:', fcmToken);

    if (fcmToken !== data?.fcmToken) {
      await updateDoc(
        doc(db, 'users', uid as string),
        { fcmToken }
      ).then(() => {
        console.log('FCM token updated successfully');
      }).catch((e) => {
        console.log('Error updating FCM token:', e);
      });
    }

      // firestore()
      // .collection('users')
      // .doc(auth.currentUser?.uid)
      // .update({ fcmToken }).then(() => {
      //   console.log('updated')
      // }).catch((e) => {
      //   console.log('error ', e)
      // });


  }

  if(isLoading) return <Loading visible={true} />
  if(isError) return <ErrorComponent />

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused }) => (
               <AwesomeIcon name="tasks" size={28} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }} 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name="Staff" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused, color, size }) => (
              <AwesomeIcon name="users" size={26} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }}
        component={Staff} 
      />
      <Tab.Screen 
        name="Attendance" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused, color, size }) => (
               <Icon name="document-attach-outline" size={28} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }}
        component={AttendanceScreen} 
      />
      <Tab.Screen 
        name="Calendar" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused, color, size }) => (
               <Icon name="calendar-outline" size={30} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }}
        component={CalendarScreen} 
      />
    </Tab.Navigator>
  );
}

export default BottomNavigator