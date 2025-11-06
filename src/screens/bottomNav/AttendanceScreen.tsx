import Spacer from "@/src/components/atoms/Spacer";
import AttendanceCard from "@/src/components/AttendanceCard";
import Container from "@/src/components/Container";

export default function AttendanceScreen() {
  return (
    <Container>
      <AttendanceCard label='Your Note' title="Check In" caption="Notes" buttonText="Register" />
      <Spacer height={18}/>
      <AttendanceCard label="Your Note" title="Check Out" caption="Notes" buttonText="Register" />
      <Spacer height={18}/>
      <AttendanceCard label='Report' title="Today Report" caption="Tell us what did you do today" buttonText="Submit" />
      <Spacer height={18}/>
      <AttendanceCard label="Reason" title="Leave" caption="Tell us what's the reason" buttonText="Submit" />
    </Container>
  );
}