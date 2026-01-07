import notifee, { AndroidImportance } from '@notifee/react-native'
import firestore from '@react-native-firebase/firestore'
import messaging from '@react-native-firebase/messaging'
import { createStackNavigator } from "@react-navigation/stack"
import { useEffect, useState } from "react"
import { Linking, PermissionsAndroid, Platform } from 'react-native'
import Loading from '../components/Loading'
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
    const { data, loading } = useUserData();
    const [isVisible, setIsvisible] = useState(false)

    useEffect(() => {
      notifee.createChannel({
        id: 'newTask',
        name: 'New Task',
        importance: AndroidImportance.HIGH,
        vibration: true,
        //vibrationPattern: [0, 500, 200, 500],
      });
    }, []);

    useEffect(() => {
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('A new message arrived! (FORGROUND)', JSON.stringify(remoteMessage))
        await notifee.displayNotification({
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          android: {
            channelId: 'newTask',
          },
        });
      });
    
      const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log(
          'A new message arrived! (BACKGROUND)',
          JSON.stringify(remoteMessage),
        );
      });
      
      return () => {
        unsubscribe()
        unsubscribeBackground
      };
    }, []);

    useEffect(() => {
      if(data?.id){
        requestNotificationPermission() 
      }
    },[data?.id])

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

    // Get the FCM token
    async function getFcmToken() {
      let fcmToken = await messaging().getToken().catch((e) => console.log(e));
      console.log('fcmToken ', fcmToken)
      if (fcmToken && data?.id) {
        firestore()
        .collection('users')
        .doc(data?.id)
        .update({ fcmToken }).then(() => {
          console.log('updated')
        }).catch((e) => {
          console.log('error ', e)
        });
      }
    }

    async function requestNotificationPermission() {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
    
        const authStatus = await messaging().requestPermission({
          alert: true,
          sound: true,
          badge: true,
        });
    
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
        if (enabled) {
          getFcmToken();
        }
      }
    
      if (Platform.OS === 'android') {
        await requestAndroidPermission();
      }
    }

    async function requestAndroidPermission() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
    
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getFcmToken();
        }
      }
    }

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