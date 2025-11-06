import Spacer from "@/src/components/atoms/Spacer";
import AttendanceCard from "@/src/components/AttendanceCard";
import Container from "@/src/components/Container";
import Geolocation from "@react-native-community/geolocation";
import { Platform } from "react-native";
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

export default function AttendanceScreen() {
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition((info: {coords:{latitude: number, longitude: number}}) => {
      console.log(info)
    }, async(err) => {
      if (Platform.OS === 'android') {
        try{
          const enableResult = await promptForEnableLocationIfNeeded();
          console.log('enableResult', enableResult);
        } catch(err){
          console.log(err)
        }
        
      }
    })
  }

  return (
    <Container>
      <AttendanceCard label='Your Note' title="Check In" caption="Notes" buttonText="Register" onPress={getCurrentLocation} />
      <Spacer height={18}/>
      <AttendanceCard label="Your Note" title="Check Out" caption="Notes" buttonText="Register" onPress={getCurrentLocation} />
      <Spacer height={18}/>
      <AttendanceCard label='Report' title="Today Report" caption="Tell us what did you do today" buttonText="Submit" onPress={getCurrentLocation} />
      <Spacer height={18}/>
      <AttendanceCard label="Reason" title="Leave" caption="Tell us what's the reason" buttonText="Submit" onPress={getCurrentLocation} />
    </Container>
  );
}