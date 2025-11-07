import { createStackNavigator } from "@react-navigation/stack"
import ForgotPassword from "../screens/auth/ForgotPassword"
import LoginScreen from "../screens/auth/LoginScreen"
import SignUpScreen from "../screens/auth/SignUpScreen"

export type AuthStackParamsList = {
  Login: undefined,
  Signup: undefined,
  ForgotPassword: undefined
}

const Stack = createStackNavigator<AuthStackParamsList>()

const AuthStack = () => {
    return(
      <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{ headerShown: false }}
          />
      </Stack.Navigator>
    )
  }
  
  export default AuthStack