import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import MapViewComponent from "@/src/components/molecule/MapViewComponent";
import moment from "moment";
import { StyleSheet, Text, View } from "react-native";

interface DayDetails {
    route: {
      params: {
        checkIn: {
          time: Date
        },
        checkOut: {
          time: Date
        }
      }
    }
}

const AttendanceCard = ({ check }: any) => (
  <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 8 }}>
    <Text style={styles.title}>Time:</Text>
    <Text style={styles.caption}> {moment(check?.time.seconds * 1000 + check?.time.nanoseconds / 1_000_000).format('h:mm a')}</Text>
    <Spacer height={8} />
    <Text style={styles.title}>Note:</Text>
    <Text style={styles.caption}>{check.note}</Text>
    <Spacer height={8} />
    <Text style={styles.title}>Location:</Text>
    <MapViewComponent longitude={check.longitude} latitude={check.latitude}/>
  </View>
)

export default function CheckInOut({ route }: DayDetails) {

  const checkIn = route.params.checkIn
  const checkOut = route.params.checkOut

  console.log(checkOut)
  return (
    <Container allowBack={true} headerMiddle='Attendance Details' backgroundColor={COLORS.neutral._100}>
      {
        checkIn.time ? (
          <>
            <Text style={[styles.title, { fontSize: 26 }]}>Check In</Text>
            <Spacer height={8} />
            <AttendanceCard check={checkIn}/>
            <Spacer height={30} />
          </>
        ) : undefined
      }
      {
        checkOut.time ? (
          <>
            <Text style={[styles.title, { fontSize: 26 }]}>Check Out</Text>
            <Spacer height={8} />
            <AttendanceCard check={checkOut}/>
          </>
        ) : undefined
      }
    </Container>
  );
}

const styles = StyleSheet.create({
   title: {
     fontWeight: 'bold',
     fontSize: 22
   },
   caption: {
     color: COLORS.caption,
     fontSize: 15
   },
});