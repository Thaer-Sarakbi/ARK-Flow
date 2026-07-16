import Loading from "@/src/components/atoms/Loading";
import Spacer from "@/src/components/atoms/Spacer";
import ErrorComponent from "@/src/components/molecules/ErrorComponent";
import TaskCard from "@/src/components/molecules/TaskCard";
import { useGetTasksRealtimeQuery, useLazyGetTasksQuery } from "@/src/redux/tasks";
import { useUserDataRealTimeQuery } from "@/src/redux/user";
import { COLORS } from "@/src/utils/colors";
import { Places } from "@/src/utils/Constants";
import Icon from '@expo/vector-icons/Ionicons';
import { getAuth } from "@react-native-firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const auth = getAuth();

export default function CompletedTaskScreen() {
  const [isFetching, setIsFetching] = useState(false)
  const [isFocus, setIsFocus] = useState(false);
  const [placeId, setPlaceId] = useState<number | undefined>();
  const [place, setPlace] = useState<string | undefined>();
  const { data: user, isLoading, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
  const [getTasks] = useLazyGetTasksQuery()
  const { data: listOfTasks, isLoading: isLoadingTasks, isError } =  useGetTasksRealtimeQuery({ userId: user?.id }, { skip: !user?.id })

    useEffect(() => {
      setPlace(user?.placeName);
      setPlaceId(user?.placeId)
    },[]); 

  const completedTasks = useMemo(() => {
    if (!listOfTasks) return [];
  
    return listOfTasks
      .filter(task =>
        task.status === "Completed" &&
        (place === "All" || task.location === place)
      )
      .sort(
        (a, b) =>
          b.creationDate.seconds - a.creationDate.seconds
      );
  }, [listOfTasks, place]);

  const onRefresh = useCallback(async () => {
      if (!user?.id) return;
    
      setIsFetching(true);
    
      try {
        await getTasks({ userId: user.id }).unwrap();
      } finally {
        setIsFetching(false);
      }
  }, [user?.id, getTasks]);

  if(isLoading || isLoadingTasks) return <Loading visible={true} />
  if(isErrorUserData || isError) return <ErrorComponent />

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
          <Spacer height={12} />
          <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: COLORS.info }]}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={Places}
              search
              maxHeight={300}
              labelField="label"
                      valueField="value"
              searchPlaceholder="Search..."
              value={placeId}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setPlaceId(item.value);
                setPlace((item.label))
                setIsFocus(false);
              }}
              renderLeftIcon={() => (
                <Icon
                  style={styles.icon}
                  name="location-outline"
                  size={16}
                />
              )}
            />      
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
    </View>
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
  },
  dropdown: {
    borderColor: COLORS.neutral._500,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginHorizontal: 12
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 5,
  },
})