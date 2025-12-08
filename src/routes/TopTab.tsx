import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { COLORS } from '../colors';
import AddTaskButton from '../components/buttons/AddTaskButton';
import MainHeader from '../components/MainHeader';
import CompletedTaskScreen from '../screens/TopNav/CompletedTaskScreen';
import InProgressTasksScreen from '../screens/TopNav/InProgressTasksScreen';
import NotStartedListScreen from '../screens/TopNav/NotStartedListScreen';

const Tab = createMaterialTopTabNavigator();

export default function TopTab() {
  
  return (
    <>
      <MainHeader />
      <Tab.Navigator 
      initialRouteName= "Not Started" 
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIndicatorStyle: { backgroundColor: COLORS.primary }
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
      <AddTaskButton />
    </>
  );
}
