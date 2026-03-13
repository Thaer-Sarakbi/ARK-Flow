import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import ProfileScreen from '../screens/bottomNav/ProfileScreen';
import MainStack from './MainStack';

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
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
      </Drawer.Navigator>
    );
  }

  export default MainDrawer