import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AuthStack from './routes/AuthStack';
import MainStack from './routes/MainStack';

const auth = getAuth();

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null)
 
  useEffect(() => {
      onAuthStateChanged(auth, u => {
          setCurrentUser(u)
      })
  },[])

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Provider store={store}>
          {currentUser ? <MainStack /> : <AuthStack />}
        </Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}