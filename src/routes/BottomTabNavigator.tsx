import AwesomeIcon from '@expo/vector-icons/FontAwesome5';
import Icon from '@expo/vector-icons/Ionicons';
import { getAuth } from '@react-native-firebase/auth';
import { doc, getFirestore, updateDoc } from '@react-native-firebase/firestore';
import { getMessaging, getToken, onNotificationOpenedApp, onTokenRefresh } from '@react-native-firebase/messaging';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import branch from 'react-native-branch';
import Loading from '../components/atoms/Loading';
import ErrorComponent from '../components/molecules/ErrorComponent';
import { useUserDataRealTimeQuery } from '../redux/user';
import AttendanceScreen from '../screens/bottomNav/AttendanceScreen';
import CalendarScreen, { RootStackNavigationProp } from '../screens/bottomNav/CalendarScreen';
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
const messaging = getMessaging();

const BottomNavigator = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const uid = auth.currentUser?.uid ?? null;
  const { data, isLoading, isError } = useUserDataRealTimeQuery(uid);

  useEffect(() => {
    // Handles link when app is already open (foreground)
    const unsubscribe = branch.subscribe(({ error, params, uri }) => {
      if (error) {
        console.error('Branch error:', error);
        return;
      }
    
      if (!params?.['+clicked_branch_link']) return;
    
      const taskId = params.taskId as string | undefined;
      const assignedToId = params.assignedToId as string | undefined;
    
      if (taskId && assignedToId) {
        navigation.navigate('TaskDetails', { taskId, assignedToId });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onNotificationOpenedApp(messaging, (remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      // Perform navigation or update UI based on remoteMessage.data
    });

    return () => {
      unsubscribe();
    };
  },[])

  useEffect(() => {
    let timeout: NodeJS.Timeout;
  
    const setupFcm = async () => {
      if (!auth.currentUser || !uid) return;
  
      await getFcmToken();
    };
  
    timeout = setTimeout(() => {
      setupFcm();
    }, 2000);
  
    // Listen for token refresh
    const unsubscribe = onTokenRefresh(
      messaging,
      async (newToken) => {
        console.log('New FCM Token:', newToken);
  
        await saveTokenToServer(newToken);
      }
    );
  
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [uid]);
  
  
  // Get the FCM token
  async function getFcmToken() {
    try {
      const fcmToken = await getToken(messaging);
  
      console.log('FCM Token:', fcmToken);
  
      if (!fcmToken) return;
  
      // Update only if changed
      if (fcmToken !== data?.fcmToken) {
        await saveTokenToServer(fcmToken);
      }
    } catch (e) {
      console.log('Error getting FCM token:', e);
    }
  }
  
  
  async function saveTokenToServer(fcmToken: string) {
    try {
      if (!uid) return;
  
      await updateDoc(
        doc(db, 'users', uid),
        {
          fcmToken,
        }
      );
  
      console.log('FCM token updated successfully');
    } catch (e) {
      console.log('Error updating FCM token:', e);
    }
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