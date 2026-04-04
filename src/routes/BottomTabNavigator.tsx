import AwesomeIcon from '@expo/vector-icons/FontAwesome5';
import Icon from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AttendanceScreen from '../screens/bottomNav/AttendanceScreen';
import CalendarScreen from '../screens/bottomNav/CalendarScreen';
import HomeScreen from '../screens/bottomNav/HomeScreen';
import Staff from '../screens/Staff/Staff';
import { COLORS } from '../utils/colors';

const Tab = createBottomTabNavigator<BottomNavigatorParamsList>();

export type BottomNavigatorParamsList = {
  Home: undefined,
  Attendance: undefined,
  Calendar: undefined,
  Staff: undefined
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
               <AwesomeIcon name="tasks" size={28} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }} 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name="Staff" 
        options={{ 
            headerShown: false, 
            tabBarLabelStyle: { display: 'none'},
            tabBarIcon: ({ focused, color, size }) => (
              <AwesomeIcon name="users" size={26} color={focused ? COLORS.info : COLORS.neutral._500} />
            )
        }}
        component={Staff} 
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
    </Tab.Navigator>
  );
}

export default BottomNavigator