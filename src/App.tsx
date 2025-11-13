import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './redux/store';
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
        <Provider store={store}>
          {currentUser ? <BottomNavigator /> : <AuthStack />}
        </Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}