import { COLORS } from "@/src/colors";
import Separator from "@/src/components/atoms/Separator";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import { useGetCheckInQuery, useGetCheckOutQuery, useGetLeaveRealtimeQuery, useGetReportRealtimeQuery, useGetUpdatesRealtimeQuery } from "@/src/redux/attendance";
import { useUserDataRealTimeQuery } from "@/src/redux/user";
import { MainStackParamsList } from "@/src/routes/params";
import Entypo from '@expo/vector-icons/Entypo';
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import moment from "moment";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
interface DayDetails {
    route: {
      params: {
        date: number,
        userId: string
      }
    }
}
  
const auth = getAuth();
type HomeScreenNavigationProp = StackNavigationProp<MainStackParamsList, 'DayDetails'>;

export default function DayDetails({ route }: DayDetails) {
  const date = moment(route.params.date).format("DD-MM-YYYY")
  const userId = route.params.userId
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const isLoading = useSelector((state: any) => state.ui.loading);
  const { data: user, isLoading: isLoadingUser, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
  const { data: checkIn, isLoading: isLoadingCheckIn, isError: isErrorCheckIn } = useGetCheckInQuery({ userId, date })
  const { data: checkOut, isLoading: isLoadingCheckOut, isError: isErrorCheckOut } = useGetCheckOutQuery({ userId, date })
  const skipQueries = !userId || !date;
  const { data: reportData, isLoading: isLoadingReport, isError: isErrorGetReport, } = useGetReportRealtimeQuery({ userId, date }, { skip: skipQueries })
  const { data: leaveData, isLoading: leaveIsLoading, isError: LeaveIsError } = useGetLeaveRealtimeQuery({ userId, date })
  const { data: updates, isLoading: isLoadingUpdates, isError: isErrorUpdates } = useGetUpdatesRealtimeQuery({ userId, date })

  if (isLoadingReport || isLoadingCheckIn || isLoadingCheckOut || isLoading ||leaveIsLoading || isLoadingUser || isLoadingUpdates ) return <Loading visible />;
  if (isErrorCheckOut || isErrorCheckIn || isErrorGetReport || LeaveIsError || isErrorUpdates) return <ErrorComponent />;

  return (
    <Container allowBack={true} headerMiddle='Day Details' backgroundColor={COLORS.neutral._100}>
      <Text style={styles.date}>{date}</Text>
      <Spacer height={10} />
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
        reportData?.note ? (
          <TouchableOpacity onPress={() => navigation.navigate('ReportDetails', { date, report: reportData, userId })} style={styles.container}>
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
      <Text style={styles.title}>Task Updates</Text>
      {
        (updates?.length ?? 0) > 0 ? updates?.map((update: any) => (
            <TouchableOpacity key={update.id} style={styles.updateComponent} onPress={() => navigation.navigate('UpdateDetails', { updateId: update.id, taskId: update.taskId, assignedToId: update.assignedToId, userName: user?.fullName, assignedBy: update.assignedBy, assignedById: update.assignedById, userId: user?.id })}>
              <Text style={[styles.caption, { fontSize: 18, textAlign: 'left' }]}>{update.title}</Text>
              <Entypo name="chevron-small-right" size={24} color="black" />
            </TouchableOpacity>
        ))  
        : (
          <Text style={styles.caption}>No Tasks for today</Text>
        )
      } 
      <Spacer height={8}/>
      <Text style={styles.title}>Leave Report</Text>
      {
        leaveData?.note ? (
          <TouchableOpacity onPress={() => navigation.navigate('LeaveDetails', { date, leave: leaveData, userId })} style={styles.container}>
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
   updateComponent: { 
    backgroundColor: COLORS.white, 
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    borderRadius: 8,
    padding: 10,  
    marginBottom: 10
  },
  date: { textAlign: 'center', fontWeight: 'bold', fontSize: 20 }
});