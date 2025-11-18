import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import AttendanceCard from "@/src/components/AttendanceCard";
import Container from "@/src/components/Container";
import useCurrentLocation from "@/src/hooks/useCurrentLocation";
import useDocumentPicker from "@/src/hooks/useDocumentPicker";
import { useUserData } from "@/src/hooks/useUserData";
import BottomSheet from "@/src/Modals/BottomSheet";
import ConfirmationPopup from "@/src/Modals/ConfirmationPopup";
import { useAddCheckInMutation, useAddCheckOutMutation, useAddLeaveMutation, useAddReportMutation } from "@/src/redux/attendance";
import moment from "moment";
import { useEffect, useState } from "react";
import { Image, ImageProps, StyleSheet, Text, TouchableOpacity, View } from "react-native";
interface BoxUploadProps extends ImageProps {
  title: string;
  onPress?: () => void;
}

const BoxUpload = ({ title, source, onPress }: BoxUploadProps) => {
  return (
    <TouchableOpacity style={{ alignItems: 'center', borderWidth: 2, borderRadius: 8, borderColor: COLORS.info, paddingVertical: 10, paddingHorizontal: 4 }} onPress={onPress}>
      <Image style={styles.imgIcon} source={source} />
      <Spacer height={8}/>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

export default function AttendanceScreen() {
  const [showAlert, setShowAlert] = useState(false)
  const [uploadPopupVisible, setUploadPopupVisible] = useState(false)
  const [checkInNote, setCheckInNote] = useState("")
  const [checkOutNote, setCheckOutNote] = useState("")
  const [report, setReport] = useState("")
  const [leaveText, setLeaveText] = useState("")
  const { coords, loading, error, getLocation } = useCurrentLocation()
  const [addCheckIn, { isLoading, error: checkInError }] = useAddCheckInMutation();
  const [addCheckOut] = useAddCheckOutMutation();
  const { data, loading: userDataLoading } = useUserData();
  const [addReport] = useAddReportMutation()
  const [addLeave] =   useAddLeaveMutation()
  const { documents, handleDocumentSelection, removeDocument, uploadAll } = useDocumentPicker()

  const date = moment().format("DD-MM-YYYY");

  useEffect(() => {
    getLocation(); // fetch when screen opens
  },[])

  const submitCheckIn = async () => {
    if (!data?.id || !coords?.latitude || !coords?.longitude) {
      console.log("Missing location or userId");
      return setShowAlert(true);
    }
  
    const result = await addCheckIn({
      userId: data.id,
      date,
      latitude: coords.latitude,
      longitude: coords.longitude,
      note: checkInNote,
    });
  
    if ('error' in result) {
      console.log("Check-in error:", result.error);
      return;
    }
  
    console.log("Check-in success");
  }

  const submitCheckOut = async () => {
    if (!data?.id || !coords?.latitude || !coords?.longitude) {
      console.log("Missing location or userId");
      return setShowAlert(true);
    }
  
    const result = await addCheckOut({
      userId: data.id,
      date,
      latitude: coords.latitude,
      longitude: coords.longitude,
      note: checkOutNote,
    });
  
    if ('error' in result) {
      console.log("Check-out error:", result.error);
      return;
    }
  
    console.log("Check-out success");
  };
  

  const submitReport = async () => {
    if (!data?.id) return;
  
    uploadAll(`users/${data.id}/attendance/${date}/report/today/files`)
    const result = await addReport({ userId: data.id, date, note: report });
  
    if ('error' in result) {
      console.log("Report error:", result.error);
      return;
    }
  
    console.log("Report success");
  };

  const submitLeave = async () => {
    if (!data?.id) return;
  
    const result = await addLeave({
      userId: data.id,
      date,
      note: leaveText,
    });
  
    if ('error' in result) {
      console.log("Leave error:", result.error);
      return;
    }
  
    console.log("Leave success");
  };
  
  const handleDocument = async () => {
   await handleDocumentSelection().then((result) => {
    setUploadPopupVisible(false)
   }).catch((e) => console.log(e))
  };

  return (
    <>
    <Container headerMiddle="Attendance">
      <AttendanceCard value={checkInNote} onChangeText={setCheckInNote} label='Your Note' title="Check In" caption="Notes" buttonText="Register" onPress={submitCheckIn} />
      <Spacer height={18}/>
      <AttendanceCard value={checkOutNote} onChangeText={setCheckOutNote} label="Your Note" title="Check Out" caption="Notes" buttonText="Register" onPress={submitCheckOut} />
      <Spacer height={18}/>
      <AttendanceCard value={report} onChangeText={setReport} label='Report' title="Today Report" caption="Tell us what did you do today" buttonText="Submit" docsList={documents} onPress={submitReport} uploadButton onPressUploadButton={() => setUploadPopupVisible(true)} removeDoc={removeDocument}/>
      <Spacer height={18}/>
      <AttendanceCard value={leaveText} onChangeText={setLeaveText} label="Reason" title="Leave" caption="Tell us what's the reason" buttonText="Submit" onPress={submitLeave} uploadButton/>
      <ConfirmationPopup isVisible={showAlert} title="Permission Needed" paragraph1="Please enable location access" onPress={() => {
        setShowAlert(false)
      }} onPressClose={() => setShowAlert(false)} buttonTitle="Enable"/>
      {/* <ConfirmationPopup isVisible={showAlertAndroid} title="Location is not enabled" paragraph1="Please enable location service" onPress={() => {
        setShowAlertAndroid(false)
        openSettings()
      }} onPressClose={() => setShowAlertAndroid(false)} buttonTitle="Enable"/> */}
    </Container>
    <BottomSheet visible={uploadPopupVisible} onPress={() => setUploadPopupVisible(false)}>
      <View style={{ flexDirection: 'row' }}>
        <BoxUpload title='Camera' source={require("../../../assets/camera.png")} onPress={() => {}}/>
        <Spacer width={10} />
        <BoxUpload title='Gallery' source={require("../../../assets/gallery.png")} />
        <Spacer width={10} />
        <BoxUpload title='Document' source={require("../../../assets/document.png")} onPress={handleDocument}/>
      </View>
    </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: COLORS.white,
    left: 0,
    right: 0,
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 1,
    shadowOffset: {
      height: -2,
      width: 0,
    },
    shadowOpacity: 0.05,
    elevation: 10,
    shadowColor: 'rgba(0, 0, 0, 1)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  /**
   * Style Box Upload
   */
  boxUploadContainer: {
    flexDirection: 'row',
    flex: 1,
    gap:16
  },
  modalBox: {
    flex:1,
    borderRadius: 8,
    paddingVertical: 24,
    borderWidth: 2,
    flexGrow: 1,
    borderStyle: "dotted",
    alignItems: "center", // Center items horizontally
    //borderColor: COLORS.secondary.lightBlue500,
    backgroundColor: COLORS.primary,
  },
  imgIcon: {
    height: 24,
    width: 24,
  },
  title: {
    color: COLORS.info,
    fontWeight: 'bold',
    fontSize: 25,
  },
  caption: {
    color: COLORS.caption,
    fontSize: 15
  }
})