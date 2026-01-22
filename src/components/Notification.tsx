import { getAuth } from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../colors";
import { useUserDataRealTimeQuery } from "../redux/user";
import { Notifications } from "../utils/types";

const auth = getAuth();
interface Props { 
    item: Notifications
  }

export default function Notification ({ item }: Props){
  const navigation = useNavigation()
  // const { data: user, loading, isError: isErrorUserData } = useUserData();
  const { data: user, isLoading, isError } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: !item.readed ? COLORS.secondary : undefined }]} onPress={() => navigation.navigate(item.screenName, { updateId: item.screenId, assignedToId: item.assignedToId, notificationId: item.id, notificationStatus: item.readed, taskId: item.taskId, assignedById: item.assignedById, userName: user?.fullName, userId: user?.id })}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.caption}>{item.message}<Text style={{ fontWeight: 'bold' }}> {item.by}</Text></Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({ 
  container: {
    padding: 16, 
  },
  title: {
    color: COLORS.neutral._600,
    fontWeight: 'bold',
    fontSize: 20
  },
  caption: {
    color: COLORS.caption,
    fontSize: 15
  }
});