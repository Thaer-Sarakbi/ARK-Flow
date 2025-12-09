import Spacer from "@/src/components/atoms/Spacer";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import TaskCard from "@/src/components/TaskCard";
import { useUserData } from "@/src/hooks/useUserData";
import { useGetTasksQuery } from "@/src/redux/tasks";
import { Task } from "@/src/utils/types";
import { useMemo } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

export default function CompletedTaskScreen() {
  const { data: user, loading, isError: isErrorUserData } = useUserData();
  const { data: listOfTasks, isLoading: isLoadingTasks, isError } = useGetTasksQuery({ userId: user?.id }, { skip: !user?.id })

  const completedTasks = useMemo(
    () => listOfTasks?.filter((t: Task) => t.status === "Completed") || [],
    [listOfTasks]
  );

  if(loading || isLoadingTasks) return <Loading visible={true} />

  if(isErrorUserData || isError) return <ErrorComponent />
  return (
    <>
      {
        completedTasks.length > 0 ? (
          <View style={styles.container}>
            <FlatList 
              data={completedTasks}
              renderItem={({ item }) => <TaskCard title={item.title} status={item.status} taskId={item.id}/>}
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