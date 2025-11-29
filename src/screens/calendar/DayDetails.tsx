import { COLORS } from "@/src/colors";
import Separator from "@/src/components/atoms/Separator";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import { useUserData } from "@/src/hooks/useUserData";
import { useGetCheckInQuery, useGetCheckOutQuery, useGetLeaveQuery, useGetReportQuery } from "@/src/redux/attendance";
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
  const { data: user, loading, isError } = useUserData();
  const { data: checkIn, isLoading: isLoadingCheckIn, isError: isErrorCheckIn } = useGetCheckInQuery({ userId: user?.id, date }, { skip: !user?.id })
  const { data: checkOut, isLoading: isLoadingCheckOut, isError: isErrorCheckOut } = useGetCheckOutQuery({ userId: user?.id, date }, { skip: !user?.id })
  const { data: reportData, isLoading, isError: isErrorGetReport, } = useGetReportQuery({ userId: user?.id, date }, { skip: !user?.id });
  const { data: leaveData, isLoading: leaveIsLoading, isError: LeaveIsError } = useGetLeaveQuery({ userId: user?.id, date }, { skip: !user?.id })

  if (loading || isLoading || isLoadingCheckIn || isLoadingCheckOut ||leaveIsLoading ) return <Loading visible />;
  if (isError || isErrorCheckOut || isErrorCheckIn || isErrorGetReport || LeaveIsError) return <ErrorComponent />;

  return (
    <Container allowBack={true} headerMiddle='Day Details' backgroundColor={COLORS.neutral._100}>
      <Text style={styles.title}>Attendance</Text>
      {
        (checkIn?.time || checkOut?.time) ? (
        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('CheckInOut', { checkIn, checkOut })}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            {
              checkIn?.time ? <Text><Text style={styles.caption}>Check In:</Text> {moment(checkIn?.time.seconds * 1000 + checkIn?.time.nanoseconds / 1_000_000).format('h:mm a')}</Text> : undefined
            }
            <Separator marginVertical={6}/>
            {
              checkOut?.time ? <Text><Text style={styles.caption}>Check Out:</Text> {moment(checkOut?.time.seconds * 1000 + checkOut?.time.nanoseconds / 1_000_000).format('h:mm a')}</Text> : undefined
            }      
          </View>
          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>
        ) : (
          <Text style={styles.caption}>No Attendance data for today</Text>
        )
      }
      <Spacer height={8}/>
      <Text style={styles.title}>Report</Text>
      {
        (reportData?.length ?? 0) > 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate('ReportDetails', { date, report: reportData[0] })} style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.caption}>{moment(new Date(route.params.date)).format('MMMM Do')}  </Text>
              <Text>Report</Text>
            </View>
            <Entypo name="chevron-small-right" size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <Text style={styles.caption}>No Report for today</Text>
        )
      }
      <Spacer height={8}/>
      <Text style={styles.title}>Tasks Done</Text>
      <Text style={styles.caption}>No Tasks for today</Text>
      <Spacer height={8}/>
      <Text style={styles.title}>Leave Report</Text>
      {
        (leaveData?.length ?? 0) > 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate('LeaveDetails', { date, leave: leaveData[0] })} style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.caption}>{moment(new Date(route.params.date)).format('MMMM Do')}  </Text>
              <Text>Leave Report</Text>
            </View>
            <Entypo name="chevron-small-right" size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <Text style={styles.caption}>No Leave Report for today</Text>
        )
      }
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 10, 
    borderRadius: 8 
  },
   title: {
     fontWeight: 'bold',
     fontSize: 25,
   },
   caption: {
     color: COLORS.caption,
     fontSize: 15,
     textAlign: 'center'
   },
});