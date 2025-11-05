import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { View } from 'react-native';
import CompletedTaskScreen from '../screens/TopNav/CompletedTaskScreen';
import InProgressTasksScreen from '../screens/TopNav/InProgressTasksScreen';
import NotStartedListScreen from '../screens/TopNav/NotStartedListScreen';

const Tab = createMaterialTopTabNavigator();

export default function TopTab() {

  return (
    <>
      <View style={{ width: '100%', height: 50 }} />
      <Tab.Navigator 
      initialRouteName= "Not Started" 
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12 }
        }}
      >
        <Tab.Screen 
          name="Not Started" 
          component={NotStartedListScreen}
        />
        <Tab.Screen 
          name="In Progress" 
          component={InProgressTasksScreen}
        />
        <Tab.Screen 
          name="Completed" 
          component={CompletedTaskScreen}
        />
      </Tab.Navigator>
    </>
  );
}
