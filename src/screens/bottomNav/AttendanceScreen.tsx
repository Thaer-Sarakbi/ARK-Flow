import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import AttendanceCard from "@/src/components/AttendanceCard";
import SubmitButton from "@/src/components/buttons/SubmitButton";
import Container from "@/src/components/Container";
import Loading from "@/src/components/Loading";
import useCurrentLocation from "@/src/hooks/useCurrentLocation";
import useDocumentPicker from "@/src/hooks/useDocumentPicker";
import { useUserData } from "@/src/hooks/useUserData";
import BottomSheet from "@/src/Modals/BottomSheet";
import ConfirmationPopup from "@/src/Modals/ConfirmationPopup";
import { useAddCheckInMutation, useAddCheckOutMutation, useAddLeaveMutation, useAddReportMutation, useLazyGetDaysWorkingQuery, useLazyGetLeaveDaysQuery } from "@/src/redux/attendance";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Image, ImageProps, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { launchCamera } from "react-native-image-picker";
import MapView from 'react-native-maps';
interface BoxUploadProps extends ImageProps {
  title: string;
  onPress?: () => void;
}

const BoxUpload = ({ title, source, onPress }: BoxUploadProps) => {
  return (
    <TouchableOpacity style={styles.boxUploadContainer} onPress={onPress}>
      <Image style={styles.imgIcon} source={source} />
      <Spacer height={8}/>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

export default function AttendanceScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [showAlert, setShowAlert] = useState(false)
  const [showLocationAndroid, setShowLocationAndroid] = useState(false)
  const [uploadPopupVisible, setUploadPopupVisible] = useState(false)
  const [uploadPopupLeaveVisible, setUploadPopupLeaveVisible] = useState(false)
  const [isVisibleReportSuccess, setIsVisibleReportSuccess] = useState(false)
  const [isVisibleReportFailed, setIsVisibleReportFailed] = useState(false)
  const [isVisibleLeaveSuccess, setIsVisibleLeaveSuccess] = useState(false)
  const [isVisibleLeaveFailed, setIsVisibleLeaveFailed] = useState(false)
  const [isVisibleConfirmCheckIn, setIsVisibleConfirmCheckIn] = useState(false)
  const [isVisibleCheckInSuccess, setIsVisibleCheckInSuccess] = useState(false)
  const [isVisibleCheckInFailed, setIsVisibleCheckInFailed] = useState(false)
  const [isVisibleConfirmCheckOut, setIsVisibleConfirmCheckOut] = useState(false);
  const [isVisibleCheckOutSuccess, setIsVisibleCheckOutSuccess] = useState(false)
  const [isVisibleCheckOutFailed, setIsVisibleCheckOutFailed] = useState(false)
  const [isVisibleEmptyReport, setIsVisibleEmptyReport] = useState(false)
  const [isVisibleEmptyLeave, setIsVisibleEmptyLeave] = useState(false)
  const [checkInNote, setCheckInNote] = useState("")
  const [checkOutNote, setCheckOutNote] = useState("")
  const [report, setReport] = useState("")
  const [leaveText, setLeaveText] = useState("")
  const { location, currentLocation, loading, error, openSettings, getLocation } = useCurrentLocation(mapRef as any)
  const [addCheckIn, { isLoading, error: checkInError }] = useAddCheckInMutation();
  const [addCheckOut] = useAddCheckOutMutation();
  const { data, loading: userDataLoading } = useUserData();
  const [getDaysWorking, resGetDaysWorking] = useLazyGetDaysWorkingQuery()
  const [getLeaveDays, resGetLeaveDays] = useLazyGetLeaveDaysQuery()
  
  const [addReport] = useAddReportMutation()
  const [addLeave] =   useAddLeaveMutation()
  const { documents, leaveDocuments, images, uploading, leaveImages, handleDocumentSelection, handleLeaveDocumentSelection, handleSelectImage, handleSelectLeaveImage, removeDocument, removeLeaveDocument, removeImage, removeLeaveImage, uploadAll, uploadLeaveAll } = useDocumentPicker()
  const date = moment().format("DD-MM-YYYY");

  useEffect(() => {
    getLocation(); // fetch when screen opens
  },[])

  const submitCheckIn = async () => {
    getLocation()
    setIsVisibleConfirmCheckIn(false)
    if(error === 'Location permission denied.'){
      setShowAlert(true)
      return;
    }

    console.log(error)
    if(error === 'Please enable location in your phone'){
      setShowLocationAndroid(true)
      return;
    }

    if (!data?.id || !currentLocation?.latitude || !currentLocation?.longitude) {
      console.log("Missing location or userId");
      return setIsVisibleCheckInFailed(true);
    }
  
    const result = await addCheckIn({
      userId: data.id,
      date,
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      note: checkInNote,
    });
  
    if ('error' in result) {
      console.log("Check-in error:", result.error);
      setIsVisibleCheckInFailed(true);
      return;
    }
  
    setIsVisibleCheckInSuccess(true)
    setCheckInNote('')
    console.log("Check-in success");
  }

  const submitCheckOut = async () => {
    getLocation()
    setIsVisibleConfirmCheckOut(false)

    if(error === 'Location permission denied.'){
      setShowAlert(true)
      return;
    }

    if(error === 'Please enable location in your phone'){
      setShowLocationAndroid(true)
      return;
    }

    if (!data?.id || !currentLocation?.latitude || !currentLocation?.longitude) {
      console.log("Missing location or userId");
      return setShowAlert(true);
    }
  
    const result = await addCheckOut({
      userId: data.id,
      date,
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      note: checkOutNote,
    });
  
    if ('error' in result) {
      console.log("Check-out error:", result.error);
      setIsVisibleCheckOutFailed(true);
      return;
    }
  
    setIsVisibleCheckOutSuccess(true)
    setCheckOutNote('')
    console.log("Check-out success");
  };
  
  const submitReport = async () => {
    if (!report) {
      setIsVisibleEmptyReport(true)
      return;
    }
    if (!data?.id) return;

    if(documents.length > 0 || images.length > 0){
      const result = await uploadAll(`users/${data.id}/attendance/${date}/report/today/files`)
      if (!result || result.length === 0) {
        console.log("Upload error");
        setIsVisibleReportFailed(true);
        setReport('');
        return;
      }
    }
    
    const resultAddReport = await addReport({ userId: data.id, date, note: report });
    if ('error' in resultAddReport) {
      console.log("Report error:", resultAddReport.error);
      setIsVisibleReportFailed(true)
      setReport('')
      return;
    }

    setIsVisibleReportSuccess(true)
    setReport('')
    console.log("Report success");
    getDaysWorking({ userId: data.id })
  };

  const submitLeave = async () => {
    if (!leaveText) {
      setIsVisibleEmptyLeave(true)
      return;
    }
    if (!data?.id) return;

    if(leaveDocuments.length > 0 || leaveImages.length > 0){
      const result = await uploadLeaveAll(`users/${data.id}/attendance/${date}/leave/today/files`)
      if (!result || result.length === 0) {
        console.log("Upload error");
        setIsVisibleLeaveFailed(true);
        setLeaveText('');
        return;
      }
    }


    const resultAddLeave = await addLeave({ userId: data.id, date, note: leaveText });
    if ('error' in resultAddLeave) {
      console.log("Leave error:", resultAddLeave.error);
      setIsVisibleLeaveFailed(true)
      setLeaveText('')
      return;
    }

    setIsVisibleLeaveSuccess(true)
    setLeaveText('')
    console.log("Leave success");
    getLeaveDays({ userId: data.id })
  };

  const handleDocument = async () => {
    await handleDocumentSelection().then((result) => {
     setUploadPopupVisible(false)
    }).catch((e) => console.log(e))
   };

  const handleGallery = async () => {
    await handleSelectImage().then(() => {
      setUploadPopupVisible(false)
    }).catch((e) => console.log(e))
  };

  const handleCamera = async () => {
    await launchCamera({
      mediaType: 'photo',
      presentationStyle: 'pageSheet',
    }).then(() => {
      setUploadPopupVisible(false)
    }).catch((e) => console.log(e))
  };

  const handleLeaveDocument = async () => {
    await handleLeaveDocumentSelection().then((result) => {
     setUploadPopupLeaveVisible(false)
    }).catch((e) => console.log(e))
   };

  const handleLeaveGallery = async () => {
    await handleSelectLeaveImage().then(() => {
      setUploadPopupLeaveVisible(false)
    }).catch((e) => console.log(e))
  };

  const handleLeaveCamera = async () => {
    await launchCamera({
      mediaType: 'photo',
      presentationStyle: 'pageSheet',
    }).then(() => {
      setUploadPopupLeaveVisible(false)
    }).catch((e) => console.log(e))
  };

  return (
    <>
    <Container headerMiddle="Attendance">
      <Loading visible={uploading ? true : false}/>
      <AttendanceCard value={checkInNote} onChangeText={setCheckInNote} label='Your Note' title="Check In" caption="Notes" buttonText="Register" onPress={() => setIsVisibleConfirmCheckIn(true)} />
      <Spacer height={18}/>
      <AttendanceCard value={checkOutNote} onChangeText={setCheckOutNote} label="Your Note" title="Check Out" caption="Notes" buttonText="Register" onPress={() => setIsVisibleConfirmCheckOut(true)} />
      <Spacer height={18}/>
      <AttendanceCard value={report} onChangeText={setReport} label='Report' title="Today Report" caption="Tell us what did you do today" buttonText="Submit" imagesList={images} docsList={documents} onPress={submitReport} uploadButton onPressUploadButton={() => setUploadPopupVisible(true)} removeDoc={removeDocument} removeImage={removeImage} />
      <Spacer height={18}/>
      <AttendanceCard value={leaveText} onChangeText={setLeaveText} label="Reason" title="Leave" caption="Tell us what's the reason" buttonText="Submit" onPress={submitLeave} imagesList={leaveImages} docsList={leaveDocuments} uploadButton onPressUploadButton={() => setUploadPopupLeaveVisible(true)} removeDoc={removeLeaveDocument} removeImage={removeLeaveImage}/>
      <ConfirmationPopup isVisible={showAlert} title="Permission Needed" paragraph1="Please enable location access" onPress={() => {
        openSettings()
        setShowAlert(false)
      }} onPressClose={() => setShowAlert(false)} buttonTitle="Enable"/>
      <ConfirmationPopup isVisible={showLocationAndroid} title="Location Needed" paragraph1="Please enable location in your phone" onPress={() => {
        Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        setShowLocationAndroid(false)
      }} onPressClose={() => setShowLocationAndroid(false)} buttonTitle="Ok"/>
      <Spacer height={90} />
    </Container>
    <BottomSheet visible={uploadPopupVisible} onPress={() => setUploadPopupVisible(false)}>
      <View style={{ flexDirection: 'row' }}>
        <BoxUpload title='Camera' source={require("../../../assets/camera.png")} onPress={handleCamera}/>
        <Spacer width={10} />
        <BoxUpload title='Gallery' source={require("../../../assets/gallery.png")} onPress={handleGallery} />
        <Spacer width={10} />
        <BoxUpload title='Document' source={require("../../../assets/document.png")} onPress={handleDocument}/>
      </View>
    </BottomSheet>
    <ConfirmationPopup 
      isVisible={isVisibleConfirmCheckIn} 
      title="Confirm" 
      paragraph1="Are you sure you want to do check in"
      onPressClose={() => setIsVisibleConfirmCheckIn(false)} 
      buttonTitle="Yes" 
      extraButton={<SubmitButton text="No" mode='outlined' onPress={() => setIsVisibleConfirmCheckIn(false)}/>}
      onPress={submitCheckIn} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleCheckInSuccess}
      title="Submitted Successfully" 
      paragraph1="Your check in registered" 
      icon={<Image style={{ width: 50, height: 50 }} source={require('../../../assets/icons/Success.png')} />} 
      onPressClose={() => setIsVisibleCheckInSuccess(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleCheckInSuccess(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleCheckInFailed} 
      title="Error" 
      paragraph1="Could't submit your check in"
      paragraph2="try again later"
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Cancel.png')} />} 
      onPressClose={() => setIsVisibleCheckInFailed(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleCheckInFailed(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleConfirmCheckOut} 
      title="Confirm" 
      paragraph1="Are you sure you want to do check out"
      onPressClose={() => setIsVisibleConfirmCheckOut(false)} 
      buttonTitle="Yes" 
      extraButton={<SubmitButton text="No" mode='outlined' onPress={() => setIsVisibleConfirmCheckOut(false)}/>}
      onPress={submitCheckOut} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleCheckOutSuccess}
      title="Submitted Successfully" 
      paragraph1="Your check out registered" 
      icon={<Image style={{ width: 50, height: 50 }} source={require('../../../assets/icons/Success.png')} />} 
      onPressClose={() => setIsVisibleCheckOutSuccess(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleCheckOutSuccess(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleCheckOutFailed} 
      title="Error" 
      paragraph1="Could't submit your check out"
      paragraph2="try again later"
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Cancel.png')} />} 
      onPressClose={() => setIsVisibleCheckOutFailed(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleCheckOutFailed(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleReportSuccess} 
      title="Submitted Successfully" 
      paragraph1="Your daily report uploaded" 
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Success.png')} />} 
      onPressClose={() => setIsVisibleReportSuccess(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleReportSuccess(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleReportFailed} 
      title="Error" 
      paragraph1="Could't submit your report"
      paragraph2="try again later"
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Cancel.png')} />} 
      onPressClose={() => setIsVisibleReportFailed(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleReportFailed(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleLeaveSuccess} 
      title="Submitted Successfully" 
      paragraph1="Your leave uploaded" 
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Success.png')} />} 
      onPressClose={() => setIsVisibleLeaveSuccess(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleLeaveSuccess(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleLeaveFailed} 
      title="Error" 
      paragraph1="Could't submit your leave"
      paragraph2="try again later"
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Cancel.png')} />} 
      onPressClose={() => setIsVisibleLeaveFailed(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleLeaveFailed(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleEmptyReport} 
      title="Alert" 
      paragraph1="You can't submit an empty report"
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Warning.png')} />} 
      onPressClose={() => setIsVisibleEmptyReport(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleEmptyReport(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleEmptyLeave} 
      title="Alert" 
      paragraph1="You can't submit an empty leave text"
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../../assets/icons/Warning.png')} />} 
      onPressClose={() => setIsVisibleEmptyLeave(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleEmptyLeave(false)} 
    />
    <BottomSheet visible={uploadPopupLeaveVisible} onPress={() => setUploadPopupLeaveVisible(false)}>
      <View style={{ flexDirection: 'row' }}>
        <BoxUpload title='Camera' source={require("../../../assets/camera.png")} onPress={handleLeaveCamera}/>
        <Spacer width={10} />
        <BoxUpload title='Gallery' source={require("../../../assets/gallery.png")} onPress={handleLeaveGallery} />
        <Spacer width={10} />
        <BoxUpload title='Document' source={require("../../../assets/document.png")} onPress={handleLeaveDocument}/>
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
  boxUploadContainer: { alignItems: 'center', borderWidth: 2, borderRadius: 8, borderColor: COLORS.info, paddingVertical: 10, paddingHorizontal: 4 },
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