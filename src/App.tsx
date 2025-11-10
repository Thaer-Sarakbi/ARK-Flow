import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigator from './routes/BottomTabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <BottomNavigator />
        {/* <AuthStack /> */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}