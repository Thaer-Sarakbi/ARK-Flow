import { getAuth } from '@react-native-firebase/auth';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useEffect, useMemo, useState } from 'react';
import AddTaskButton from '../components/atoms/AddTaskButton';
import LoadingComponent from '../components/atoms/LoadingComponent';
import ErrorComponent from '../components/molecules/ErrorComponent';
import AddTask from '../components/organisms/AddTask';
import MainHeader from '../components/organisms/MainHeader';
import BottomSheet from '../Modals/BottomSheet';
import { useGetNotificationsRealtimeQuery } from '../redux/notifications';
import { useLazyGetTasksQuery } from '../redux/tasks';
import { useGetUsersRealtimeQuery, useUserDataRealTimeQuery } from '../redux/user';
import CompletedTaskScreen from '../screens/TopNav/CompletedTaskScreen';
import InProgressTasksScreen from '../screens/TopNav/InProgressTasksScreen';
import MyTasksScreen from '../screens/TopNav/MyTasksScreen';
import NotStartedListScreen from '../screens/TopNav/NotStartedListScreen';
import { COLORS } from '../utils/colors';

const auth = getAuth();
const Tab = createMaterialTopTabNavigator();

export default function TopTab() {
  const { data: user, isLoading: isLoadingUser, isError: isErrorUserData } =useUserDataRealTimeQuery(auth.currentUser?.uid!, { skip: !auth.currentUser?.uid });
  const { data: listOfUsers, isLoading: isLoadingUsers, isError }= useGetUsersRealtimeQuery()
  const [getTasks, {isLoading, isError: isErrorGetTasks}] = useLazyGetTasksQuery()
  const {data: notificationsList, isLoading: isLoadingNots, isError: isErrorNots} = useGetNotificationsRealtimeQuery({ userId: user?.id }, { skip: !user?.id })
  const [isVisible, setIsVisible] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(notificationsList?.filter((n: any) => !n.readed).length ?? 0)
  },[notificationsList])

  useEffect(() => {
    if (!user?.id) return;
    getTasks({ userId: user.id });
  }, [isVisible, user?.id]);

  const dropdownData = useMemo(() => {
    return listOfUsers?.map(item => ({
      value: item.id,
      label: item.name,
      fcmToken: item.fcmToken
    }));
  }, [listOfUsers]);

  if(isLoadingUser || isLoadingUsers || isLoading || isLoadingNots) return <LoadingComponent />
  if(isErrorUserData || isError || isErrorGetTasks || isErrorNots) return <ErrorComponent />

  return (
    <>
      <MainHeader unreadCount={unreadCount} />
      <Tab.Navigator 
      initialRouteName= "My Tasks" 
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIndicatorStyle: { backgroundColor: COLORS.primary }
        }}
      >
        <Tab.Screen 
          name="My Tasks" 
          component={MyTasksScreen}
        />
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
      {user?.admin && <AddTaskButton onPress={() => setIsVisible(true)} />}
      <BottomSheet visible={isVisible} onPress={() => setIsVisible(false)}>
        {user && dropdownData && (
          <AddTask
            listOfUsers={dropdownData}
            setIsVisible={setIsVisible}
            user={user}
          />
        )}
      </BottomSheet>
    </>
  );
}
