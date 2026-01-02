import firestore from '@react-native-firebase/firestore'
import { createStackNavigator } from "@react-navigation/stack"
// import * as Notifications from 'expo-notifications'
import { useEffect, useRef, useState } from "react"
import { Linking, Platform } from 'react-native'
// import { Notifications, Registered, RegistrationError } from 'react-native-notifications'
import MapView from 'react-native-maps'
import Loading from '../components/Loading'
import useCurrentLocation from '../hooks/useCurrentLocation'
import useDocumentPicker from '../hooks/useDocumentPicker'
import { useUserData } from '../hooks/useUserData'
import ConfirmationPopup from '../Modals/ConfirmationPopup'
import CheckInOut from "../screens/calendar/CheckInOut"
import DayDetails from "../screens/calendar/DayDetails"
import LeaveDetails from "../screens/calendar/LeaveDetails"
import ReportDetails from "../screens/calendar/ReportDetails"
import ChatScreen from '../screens/mainHeader/ChatScreen'
import NotificationsScreen from '../screens/mainHeader/NotificationsScreen'
import SearchScreen from '../screens/mainHeader/SearchScreen'
import TaskDetails from '../screens/task/TaskDetails'
import UpdateDetails from '../screens/task/UpdateDetails'
import { sendSignInLink } from '../utils/sendEmailLink'
import BottomNavigator from "./BottomTabNavigator"
import { MainStackParamsList } from './params'

const Stack = createStackNavigator<MainStackParamsList>()

const MainStack = () => { 
    const mapRef = useRef<MapView | null>(null);
    const { data, loading } = useUserData();
    const [isVisible, setIsvisible] = useState(false)
    const { requestPermission } = useCurrentLocation(mapRef as any)
    const { requestCameraPermission } = useDocumentPicker()
    // const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    // const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    //   undefined
    // );
 
    // async function getMyChannels() {
    //   const channels = await Notifications.getNotificationChannelsAsync();
    //   console.log(channels); // Returns an object of channels
    // }

    useEffect(() => {
      if (Platform.OS === 'android') {
        // Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
        // getMyChannels()
      }
      // const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      //   console.log(notification)
      //   setNotification(notification);
      // });
  
      // const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      //   console.log(response);
      // });
  
      // return () => {
      //   notificationListener.remove();
      //   responseListener.remove();
      // };
    }, []);

    useEffect(() => {
      //registerForExpoPushToken()
      //schedulePushNotification()
      requestPermission()
      if(Platform.OS === 'ios'){
        requestCameraPermission()
      }
    },[])

    useEffect(() => {
      if(data?.id && !data.profile?.verified && Platform.OS === 'android'){
        setIsvisible(true)
      }
    
      const handleDeepLink = (event: { url: string }) => {
        const url = event.url;
        processDeepLink(url); // Handle the URL with a separate function
      };

    const checkInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL(); // Fetch the initial URL
      if (initialUrl) {
        processDeepLink(initialUrl);
      }
    };

    const processDeepLink = async (url: string) => {
      // const url = event.url;
      console.log("Deep Link Event:", url);
  
      if(data?.id && url.includes('flawless-helper-317308.firebaseapp.com')){
        firestore()
        .collection('users')
        .doc(data?.id)
        .update({ verified: true }).then(() => {
          setIsvisible(false)
        }).catch((e) => {
          console.log(e)
          setIsvisible(true)
        });
      }
    }

    checkInitialURL()
    Linking.addEventListener('url', handleDeepLink);
    }, [data]);

    if(loading) return <Loading visible />
    return(
      <>
      <Stack.Navigator>
        <Stack.Screen
          name="BottomNav"
          component={BottomNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="DayDetails"
          component={DayDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ReportDetails"
          component={ReportDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="LeaveDetails"
          component={LeaveDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CheckInOut"
          component={CheckInOut}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TaskDetails"
          component={TaskDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="UpdateDetails"
          component={UpdateDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SearchScreen"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="NotificationsScreen"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <ConfirmationPopup isVisible={isVisible} buttonTitle='Resend' title="Verify your email" paragraph1={`Open the link your received in email: \n\n ${data?.email}`} paragraph2='Make sure the email is correct' paragraph3='Check Spam if not founded' onPress={() => sendSignInLink(data?.email)}/>
      </>
    )
  }
  
  export default MainStack