import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthStack from './routes/AuthStack';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* <BottomNavigator /> */}
        <AuthStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}