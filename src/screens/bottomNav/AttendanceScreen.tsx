import Spacer from "@/src/components/atoms/Spacer";
import AttendanceCard from "@/src/components/AttendanceCard";
import Container from "@/src/components/Container";
import useCurrentLocation from "@/src/hooks/useCurrentLocation";
import ConfirmationPopup from "@/src/Modals/ConfirmationPopup";

export default function AttendanceScreen() {
  const { latitude, longitude, showAlert, showAlertAndroid, getCurrentLocation, openSettings, setShowAlert, setShowAlertAndroid} = useCurrentLocation()
  console.log(latitude, longitude)

  return (
    <Container headerMiddle="Attendance">
      <AttendanceCard label='Your Note' title="Check In" caption="Notes" buttonText="Register" onPress={getCurrentLocation} />
      <Spacer height={18}/>
      <AttendanceCard label="Your Note" title="Check Out" caption="Notes" buttonText="Register" onPress={getCurrentLocation} />
      <Spacer height={18}/>
      <AttendanceCard label='Report' title="Today Report" caption="Tell us what did you do today" buttonText="Submit" onPress={getCurrentLocation} />
      <Spacer height={18}/>
      <AttendanceCard label="Reason" title="Leave" caption="Tell us what's the reason" buttonText="Submit" onPress={getCurrentLocation} />
      <ConfirmationPopup isVisible={showAlert} title="Permission Needed" paragraph1="Please enable location access" onPress={() => {
        setShowAlert(false)
        openSettings()
      }} onPressClose={() => setShowAlert(false)} buttonTitle="Enable"/>
      <ConfirmationPopup isVisible={showAlertAndroid} title="Location is not enabled" paragraph1="Please enable location service" onPress={() => {
        setShowAlertAndroid(false)
        openSettings()
      }} onPressClose={() => setShowAlertAndroid(false)} buttonTitle="Enable"/>
    </Container>
  );
}