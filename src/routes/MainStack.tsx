import firestore from '@react-native-firebase/firestore'
import { createStackNavigator } from "@react-navigation/stack"
import { useEffect, useState } from "react"
import { Linking } from 'react-native'
import Loading from '../components/Loading'
import { useUserData } from '../hooks/useUserData'
import ConfirmationPopup from '../Modals/ConfirmationPopup'
import CheckInOut from "../screens/calendar/CheckInOut"
import DayDetails from "../screens/calendar/DayDetails"
import LeaveDetails from "../screens/calendar/LeaveDetails"
import ReportDetails from "../screens/calendar/ReportDetails"
import { sendSignInLink } from '../utils/sendEmailLink'
import { Report } from "../utils/types"
import BottomNavigator from "./BottomTabNavigator"

export type MainStackParamsList = {
  BottomNav: undefined,
  DayDetails: {
    date: number;
  },
  ReportDetails: {
    date: string;
    report: Report
  },
  LeaveDetails: {
    date: string;
    leave: Report
  },
  CheckInOut: {
    checkIn: {
      time: Date
    },
    checkOut: {
      time: Date
    }
  }      
}

const Stack = createStackNavigator<MainStackParamsList>()

const MainStack = () => { 
    const { data, loading } = useUserData();
    const [isVisible, setIsvisible] = useState(false)
 
    useEffect(() => {
      if(data?.id && !data.profile?.verified){
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
      </Stack.Navigator>
      <ConfirmationPopup isVisible={isVisible} buttonTitle='Resend' title="Verify your email" paragraph1={`Open the link your received in email: \n\n ${data?.email}`} paragraph2='Make sure the email is correct' onPress={() => sendSignInLink(data?.email)}/>
      </>
    )
  }
  
  export default MainStack