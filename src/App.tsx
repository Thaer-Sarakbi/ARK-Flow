import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthStack from './routes/AuthStack';
import BottomNavigator from './routes/BottomTabNavigator';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null)

  // const dispatch = useDispatch<AppDispatch>()
 
  useEffect(() => {
      auth().onAuthStateChanged(u => {
          // dispatch(setUser(u))
          setCurrentUser(u)
      })
  },[])

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {currentUser ? <BottomNavigator /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}