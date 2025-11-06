import Icon from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../colors';
import AttendanceScreen from '../screens/bottomNav/AttendanceScreen';
import CalendarScreen from '../screens/bottomNav/CalendarScreen';
import HomeScreen from '../screens/bottomNav/HomeScreen';
import ProfileScreen from '../screens/bottomNav/ProfileScreen';

const Tab = createBottomTabNavigator<BottomNavigatorParamsList>();

export type BottomNavigatorParamsList = {
  Home: undefined,
  Attendance: undefined,
  Calendar: undefined,
  Profile: undefined
}

const BottomNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused }) => (
               <Icon name="home-outline" size={30} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }} 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name="Attendance" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused, color, size }) => (
               <Icon name="document-attach-outline" size={28} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }}
        component={AttendanceScreen} 
      />
      <Tab.Screen 
        name="Calendar" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused, color, size }) => (
               <Icon name="calendar-outline" size={30} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }}
        component={CalendarScreen} 
      />
      <Tab.Screen 
        name="Profile" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused, color, size }) => (
               <Icon name="person-outline" size={30} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }}
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}

export default BottomNavigator