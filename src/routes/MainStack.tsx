import { createStackNavigator } from "@react-navigation/stack"
import DayDetails from "../screens/calendar/DayDetails"
import ReportDetails from "../screens/calendar/ReportDetails"
import { Report } from "../utils/types"
import BottomNavigator from "./BottomTabNavigator"

export type MainStackParamsList = {
  BottomNav: undefined,
  DayDetails: {
    date: number;
  },
  ReportDetails: {
    date: string;
    reportData: Report
  }        
}

const Stack = createStackNavigator<MainStackParamsList>()

const MainStack = () => {
    return(
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
      </Stack.Navigator>
    )
  }
  
  export default MainStack