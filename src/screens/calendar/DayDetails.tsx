import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import { useUserData } from "@/src/hooks/useUserData";
import { useGetLeaveQuery, useGetReportQuery } from "@/src/redux/attendance";
import { MainStackParamsList } from "@/src/routes/MainStack";
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import moment from "moment";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DayDetails {
    route: {
      params: {
        date: number
      }
    }
}
  
type HomeScreenNavigationProp = StackNavigationProp<MainStackParamsList, 'DayDetails'>;

export default function DayDetails({ route }: DayDetails) {
  const date = moment(route.params.date).format("DD-MM-YYYY")
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const { data: user, loading } = useUserData();
  const { data: reportData, isLoading, isError, error } = useGetReportQuery({ userId: user?.id, date }, { skip: !user?.id });
  const { data: leaveData, isLoading: leaveIsLoading, isError: LeaveIsError, error: leaveError } = useGetLeaveQuery({ userId: user?.id, date })
  
  if (isLoading) return <Text>Loading...</Text>;

  if (isError) return <Text>Error: {error.message}</Text>;
  
  return (
    <Container allowBack={true} headerMiddle='Day Details' backgroundColor={COLORS.neutral._100}>
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.caption}>No Attendance data for today</Text>
      <Spacer height={8}/>
      <Text style={styles.title}>Report</Text>
      <Text style={styles.caption}>No Report for today</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ReportDetails', { date, reportData })} style={{ backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderRadius: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.caption}>{moment(new Date(route.params.date* 1000)).format('MMMM Do')} </Text>
        <Text>Report</Text>
        </View>
        
        <Entypo name="chevron-small-right" size={24} color="black" />
      </TouchableOpacity>
      <Spacer height={8}/>
      <Text style={styles.title}>Tasks Done</Text>
      <Text style={styles.caption}>No Tasks for today</Text>
      <Spacer height={8}/>
      <Text style={styles.title}>Leave Report</Text>
      <Text style={styles.caption}>No Leave Report for today</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
   title: {
     fontWeight: 'bold',
     fontSize: 25
   },
   caption: {
     color: COLORS.caption,
     fontSize: 15,
     textAlign: 'center'
   },
});