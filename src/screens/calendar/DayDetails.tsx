import { COLORS } from "@/src/colors";
import Separator from "@/src/components/atoms/Separator";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import { useGetCheckInMorningRealtimeQuery, useGetCheckInNightRealtimeQuery, useGetCheckInRealtimeQuery, useGetCheckOutMorningRealtimeQuery, useGetCheckOutNightRealtimeQuery, useGetCheckOutRealtimeQuery, useGetLeaveRealtimeQuery, useGetReportRealtimeQuery, useGetUpdatesRealtimeQuery } from "@/src/redux/attendance";
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
  const { data: checkIn, isLoading: isLoadingCheckIn, isError: isErrorCheckIn } = useGetCheckInRealtimeQuery({ userId, date })
  const { data: checkInMorning, isLoading: isLoadingCheckInMorning, isError: isErrorCheckInMorning } = useGetCheckInMorningRealtimeQuery({ userId, date })
  const { data: checkInNight, isLoading: isLoadingCheckInNghit, isError: isErrorCheckInNight} = useGetCheckInNightRealtimeQuery({ userId, date })
  const { data: checkOut, isLoading: isLoadingCheckOut, isError: isErrorCheckOut } = useGetCheckOutRealtimeQuery({ userId, date })
  const { data: checkOutMorning, isLoading: isLoadingCheckOutMorning, isError: isErrorCheckOutMorning } = useGetCheckOutMorningRealtimeQuery({ userId, date })
  const { data: checkOutNight, isLoading: isLoadingCheckOutNghit, isError: isErrorCheckOutNight} = useGetCheckOutNightRealtimeQuery({ userId, date })
  const skipQueries = !userId || !date;
  const { data: reportData, isLoading: isLoadingReport, isError: isErrorGetReport, } = useGetReportRealtimeQuery({ userId, date }, { skip: skipQueries })
  const { data: leaveData, isLoading: leaveIsLoading, isError: LeaveIsError } = useGetLeaveRealtimeQuery({ userId, date })
  const { data: updates, isLoading: isLoadingUpdates, isError: isErrorUpdates } = useGetUpdatesRealtimeQuery({ userId, date })

  if (isLoadingReport || isLoadingCheckInMorning || isLoadingCheckInNghit || isLoadingCheckOutMorning || isLoadingCheckOutNghit  || isLoading ||leaveIsLoading || isLoadingUser || isLoadingUpdates ) return <Loading visible />;
  if (isErrorCheckOutMorning || isErrorCheckOutNight || isErrorCheckInMorning || isErrorCheckInNight || isErrorGetReport || LeaveIsError || isErrorUpdates) return <ErrorComponent />;

  return (
    <Container allowBack={true} headerMiddle='Day Details' backgroundColor={COLORS.neutral._100}>
      <Text style={styles.date}>{date}</Text>
      <Spacer height={10} />
      <Text style={styles.title}>Attendance</Text>
      { 
        // first
        (checkIn?.time || checkOut?.time) ? (
          <>
            <Spacer height={6} />
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
          </>
          ) : 
          
          // second
          (checkInMorning?.time || checkOutMorning?.time || checkInNight?.time || checkOutNight?.time) ? (
          <>
            {(checkInMorning?.time || checkOutMorning?.time) && (
            <>
              <Spacer height={10} />
              <Text>Morning</Text>
              <Spacer height={4} />
              <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('CheckInOut', { checkIn: checkInMorning, checkOut: checkOutMorning })}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                {
                  checkInMorning?.time ? <Text><Text style={styles.caption}>Check In:</Text> {moment(checkInMorning?.time.seconds * 1000 + checkInMorning?.time.nanoseconds / 1_000_000).format('h:mm a')}</Text> : undefined
                }
                <Separator marginVertical={6}/>
                {
                  checkOutMorning?.time ? <Text><Text style={styles.caption}>Check Out:</Text> {moment(checkOutMorning?.time.seconds * 1000 + checkOutMorning?.time.nanoseconds / 1_000_000).format('h:mm a')}</Text> : undefined
                }      
                </View>
                <Entypo name="chevron-small-right" size={24} color="black" />
              </TouchableOpacity>
            </>
          )}

          {(checkInNight?.time || checkOutNight?.time) && (
            <>
              <Spacer height={12} />
              <Text>Night</Text>
              <Spacer height={4} />
              <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('CheckInOut', { checkIn: checkInNight, checkOut: checkOutNight })}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  {
                    checkInNight?.time ? <Text><Text style={styles.caption}>Check In:</Text> {moment(checkInNight?.time.seconds * 1000 + checkInNight?.time.nanoseconds / 1_000_000).format('h:mm a')}</Text> : undefined
                  }
                  <Separator marginVertical={6}/>
                  {
                    checkOutNight?.time ? <Text><Text style={styles.caption}>Check Out:</Text> {moment(checkOutNight?.time.seconds * 1000 + checkOutNight?.time.nanoseconds / 1_000_000).format('h:mm a')}</Text> : undefined
                  }      
                </View>
                <Entypo name="chevron-small-right" size={24} color="black" />
              </TouchableOpacity> 
            </>
          )}
          </>
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