import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import ProfileScreen from '../screens/bottomNav/ProfileScreen';
import MainStack from './MainStack';
import SalaryAdvanceStack from './SalaryAdvanceStack';

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  SalaryAdvance: undefined;
};

export type DrawerNavigation = DrawerNavigationProp<DrawerParamList>;

const Drawer = createDrawerNavigator();

function MainDrawer() {
  
    return (
      <Drawer.Navigator>
        <Drawer.Screen
          name="Home"
          component={MainStack}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="Salary Advance"
          component={SalaryAdvanceStack}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    );
  }

  export default MainDrawer