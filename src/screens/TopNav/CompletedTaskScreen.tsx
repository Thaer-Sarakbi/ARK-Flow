import Spacer from "@/src/components/atoms/Spacer";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import TaskCard from "@/src/components/TaskCard";
import { useGetTasksRealtimeQuery, useLazyGetTasksQuery } from "@/src/redux/tasks";
import { useUserDataRealTimeQuery } from "@/src/redux/user";
import { Task } from "@/src/utils/types";
import { getAuth } from "@react-native-firebase/auth";
import { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const auth = getAuth();

export default function CompletedTaskScreen() {
  const [isFetching, setIsFetching] = useState(false)
  // const { data: user, loading, isError: isErrorUserData } = useUserData();
  const { data: user, isLoading, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
  const [getTasks] = useLazyGetTasksQuery()
  const { data: listOfTasks, isLoading: isLoadingTasks, isError } =  useGetTasksRealtimeQuery({ userId: user?.id }, { skip: !user?.id })

  const completedTasks = useMemo(() => {
    if (!listOfTasks) return [];
  
    return [...listOfTasks]
      .filter((t: Task) => t.status === "Completed")
      .sort(
        (a, b) => b.creationDate.seconds - a.creationDate.seconds
      );
  }, [listOfTasks]);

  const onRefresh = () => {
    setIsFetching(true)
    getTasks({ userId: user?.id })
    setIsFetching(false)
  }

  if(isLoading || isLoadingTasks) return <Loading visible={true} />
  if(isErrorUserData || isError) return <ErrorComponent />

  return (
    <>
      {
        completedTasks.length > 0 ? (
          <View style={styles.container}>
            <FlatList 
              data={completedTasks}
              renderItem={({ item }) =>  <TaskCard title={item.title} status={item.status} taskId={item.id} assignedTo={item.assignedTo} duration={item.duration} location={item.location} creationDate={item.creationDate} assignedToId={item.assignedToId}/>}
              onRefresh= {() => onRefresh()}
              refreshing={isFetching}
            />
          </View>      
        ) : (
          <View style={styles.blank}>
            <Image style={{ width: 120 , height: 120 }} source={require('@/assets/icons/noTasks.png')} />
            <Spacer height={8} />
            <Text style={{ alignSelf: 'center' }}>No Tasks Completed</Text>
          </View>
        )
      }    
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white', 
    paddingHorizontal: 12
  },
  blank: { 
    flex: 1, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center'  
  }
})