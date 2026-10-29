import { createStackNavigator } from "@react-navigation/stack"
import AdvanceDetails from "../screens/drawerNav/AdvanceDetails"
import AdvancesHistory from "../screens/drawerNav/AdvancesHistory"
import SalaryAdvanced from "../screens/drawerNav/SalaryAdvanced"

export type SalaryAdvanceParamsList = {
  SalaryAdvanced: undefined,
  AdvanceDetails: {
    advanceId: string, 
    requestedById: string, 
    notificationId: string, 
    notificationStatus: string
  },
  AdvancesHistory: undefined
}

const Stack = createStackNavigator<SalaryAdvanceParamsList>()

const SalaryAdvanceStack = () => {
    return(
      <Stack.Navigator>
        <Stack.Screen
          name="SalaryAdvanced"
          component={SalaryAdvanced}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdvanceDetails"
          component={AdvanceDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdvancesHistory"
          component={AdvancesHistory}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    )
  }
  
  export default SalaryAdvanceStack