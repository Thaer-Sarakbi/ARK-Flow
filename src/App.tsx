import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import remoteConfig from '@react-native-firebase/remote-config';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AuthStack from './routes/AuthStack';
import MainStack from './routes/MainStack';
import { DeviceInformation } from './utils/Constants';

const auth = getAuth();

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [visibleForeUpdate, setVisibleForeUpdate] = useState(false);

  useEffect(() => {
    fetchAndActivateConfig()
      onAuthStateChanged(auth, u => {
          setCurrentUser(u)
      })
  },[])

  async function fetchAndActivateConfig() {
    try {
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 3000
      });

      await remoteConfig().fetchAndActivate()

      // Retrieve an updated config value
      const versionNumber = remoteConfig().getValue("min_version").asString();
      if (DeviceInformation.VERSION.toString() < versionNumber) {
        setVisibleForeUpdate(true)
      } else {
        setVisibleForeUpdate(false)
      }
    } catch (error) {
      setVisibleForeUpdate(false)

    }
  }

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