import notifee, { AndroidImportance } from '@notifee/react-native'
import { getAuth } from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import messaging from '@react-native-firebase/messaging'
import { createStackNavigator } from "@react-navigation/stack"
import { useEffect, useState } from "react"
import { Linking, PermissionsAndroid, Platform } from 'react-native'
import { requestNotifications } from 'react-native-permissions'
import Loading from '../components/Loading'
import ConfirmationPopup from '../Modals/ConfirmationPopup'
import UpdatePlacePopup from '../Modals/UpdatePlacePopup'
import { useUserDataRealTimeQuery } from '../redux/user'
import CheckInOut from "../screens/calendar/CheckInOut"
import DayDetails from "../screens/calendar/DayDetails"
import LeaveDetails from "../screens/calendar/LeaveDetails"
import ReportDetails from "../screens/calendar/ReportDetails"
import ChatScreen from '../screens/mainHeader/ChatScreen'
import NotificationsScreen from '../screens/mainHeader/NotificationsScreen'
import SearchScreen from '../screens/mainHeader/SearchScreen'
import TaskDetails from '../screens/task/TaskDetails'
import UpdateDetails from '../screens/task/UpdateDetails'
import { Places } from '../utils/Constants'
import { sendSignInLink } from '../utils/sendEmailLink'
import BottomNavigator from "./BottomTabNavigator"
import { MainStackParamsList } from './params'

const auth = getAuth();
const Stack = createStackNavigator<MainStackParamsList>()

const MainStack = () => { 
    // const { data, loading } = useUserData();
    const { data, isLoading, isError } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
    const [placeName, setPlaceName] = useState<string | undefined>('')
    const [placeId, setPlaceId] = useState<number | undefined>()
    const [isVisible, setIsvisible] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [showPlaceAlert, setShowPlaceAlert] = useState(false)
    const [removedAccount, setRemovedAccount] = useState(false)
   
    useEffect(() => {
      if(data && Places.filter(place => place.label === data?.placeName).length < 1) {
        setRemovedAccount(true)
      }
    },[data])

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
        const ok = await requestNotificationPermission();
        console.log(ok)
        if(!ok){
          setShowAlert(true)
        }
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
        const ok = await requestNotificationPermission();
        console.log(ok)
        if(!ok){
          setShowAlert(true)
        }
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
      setTimeout(() => {
        if(data?.fcmToken === '' && auth.currentUser){
          getFcmToken();
        }
      }, 2000);
    },[data?.fcmToken])

    useEffect(() => {
      requestNotificationPermission() ;
      if(data?.id){
        checkPlace()
      }
    },[data?.id])

    useEffect(() => {
      if(data?.id && !data?.verified && Platform.OS === 'android'){
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

        return enabled
      } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        await requestNotifications(['alert', 'sound', 'badge'])
        const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        const hasPermission = await PermissionsAndroid.check(permission);

        return hasPermission
      }
    }

    const checkPlace = async () => {
      const result = await firestore()
        .collection('users')
        .doc(data?.id)
        .get()

      if(!result.data()?.placeName){
        setShowPlaceAlert(true)
      }
    }

    const openSettings = () => {
      if(Platform.OS === 'ios'){
        Linking.openURL('App-Prefs:NOTIFICATIONS_ID&path=com.ark.deglory.arkflow')
      } else {
        Linking.openSettings();
      }
    }

    if(isLoading) return <Loading visible />
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
      <ConfirmationPopup isVisible={showAlert} title="Permission Needed" paragraph1="Please enable notifications" onPress={() => {
        openSettings()
        
        setShowAlert(false)
      }} onPressClose={() => setShowAlert(false)} buttonTitle="Enable"/>
      <ConfirmationPopup isVisible={removedAccount} title="Removed Account" paragraph1="Your account has been deleted from database" buttonTitle="Okay"/>
      <UpdatePlacePopup isVisible={showPlaceAlert} id={data?.id} placeName={placeName} placeId={placeId} setPlaceName={setPlaceName} setPlaceId={setPlaceId} title="Your Place" paragraph1="Please choose your place" disable={() => setShowPlaceAlert(false)} buttonTitle="Submit"/>
      </>
    )
  }
  
  export default MainStack