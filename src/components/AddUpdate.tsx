import Feather from "@expo/vector-icons/Feather";
import { DocumentPickerResponse } from "@react-native-documents/picker";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Asset } from "react-native-image-picker";
import MapView from "react-native-maps";
import uuid from 'react-native-uuid';
import ConfirmationPopup from "../Modals/ConfirmationPopup";
import { COLORS } from "../colors";
import useCurrentLocation from "../hooks/useCurrentLocation";
import { useLazyGetUpdatesDaysQuery } from "../redux/attendance";
import { useAddUpdateMutation } from "../redux/updates";
import Input from "./Input";
import Spacer from "./atoms/Spacer";
import SubmitButton from "./buttons/SubmitButton";
interface AddUpdate {
  setIsVisible: (isVisible: boolean) => void,
  setUploadPopupVisible: (isVisible: boolean) => void,
  taskId: string, 
  assignedToId: string,
  assignedById: string
  images: Asset[],
  userId: string | undefined,
  documents: DocumentPickerResponse[]
  uploadAll:(path: string) => any
  removeDocument:(url: string) => void
  removeImage:(url: string) => void
  uploading: boolean
}

export default function AddUpdate({ setIsVisible, setUploadPopupVisible, taskId, assignedToId, assignedById, images, documents, removeDocument, removeImage, uploadAll, userId, uploading }: AddUpdate) {
  const mapRef = useRef<MapView | null>(null);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [isVisibleFailed, setIsVisibleFailed] = useState(false)
  const [showLocationAndroid, setShowLocationAndroid] = useState(false)
  const [addUpdate, { isSuccess, isError }] = useAddUpdateMutation()
  const { currentLocation, error: locationError, openSettings, getLocation } = useCurrentLocation(mapRef as any)
  // const [AddUpdateAttend, { isLoading: isLoadingAddUpdateAttend }] = useAddUpdateAttendMutation()
  const [getUpdatesDays] = useLazyGetUpdatesDaysQuery()

  const date = moment().format("DD-MM-YYYY");
  const id = uuid.v4();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    mode: 'onTouched',
  })

  useEffect(() => {
    if(errors.title || errors.description){
      setIsVisibleConfirm(false)
    }
  },[errors])

  const handleSubmitAddUpdate = handleSubmit (async ({ title, description }) => {
    setIsLoading(true)

    if (errors.title || errors.description) {
      setIsVisibleConfirm(false);
      setIsLoading(true)
      return;
    }

    await getLocation()
    if(locationError === 'Location permission denied.'){
        setIsVisibleConfirm(false);
        setShowAlert(true)
        setIsLoading(false)
        return;
      }
  
      if(locationError === 'Please enable location in your phone'){
        setIsVisibleConfirm(false);
        setShowLocationAndroid(true)
        setIsLoading(false)
        return;
      }
  
      if (!currentLocation?.latitude || !currentLocation?.longitude) {
        console.log("Missing location");
      }

    const result = await addUpdate({
      id, 
      assignedToId,
      assignedById, 
      taskId, 
      title, 
      description, 
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      date, 
      userId
    } as any)

    if (result.data && (documents.length > 0 || images.length > 0)) {
      const uploadResult = await uploadAll(`users/${userId}/tasks/${taskId}/updates/${id}/files`)
      if (!uploadResult || uploadResult.length === 0) {
      console.log("Upload error");
      setIsVisibleFailed(true);
      return;
    }
  }

    if ('error' in result) {
      console.log("Adding update error:", result.error);
      setIsLoading(false)
      return;
    }

    setIsLoading(false)
    setIsVisible(false)
    console.log("Adding update success");
    getUpdatesDays({ userId })
  })

  //don't add any loading here
  // if(isLoading || uploading) return <Loading visible={true} />

  return (
    <>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
    <ScrollView style={{ maxHeight: 600 }}>
      <Text style={styles.title}>Title</Text>
      <Spacer height={6} />
      <Controller
        name="title"
        control={control}
        rules={{
            required: {
              value: true,
              message: 'Title is required'
            }
          }}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
          <Input 
            autoCapitalize="none"
            label="Update Title" 
            borderColor={COLORS.neutral._300} 
            inputColor={COLORS.title} 
            labelColor={COLORS.neutral._400} 
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            errorText={error?.message}
          />
        )}
      />
      <Spacer height={20} />
      <Text style={styles.title}>Description</Text>
      <Spacer height={6} />
      <Controller
        name="description"
        control={control}
        rules={{
          required: {
            value: true,
            message: 'Description is required'
          }
        }}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
          <Input 
            autoCapitalize="none"
            label="Description" 
            borderColor={COLORS.neutral._300} 
            inputColor={COLORS.title} 
            labelColor={COLORS.neutral._400} 
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            errorText={error?.message}
            multiline
            numberOfLines={5} 
            heightContainer={60} 
            iIHeight={70}
          />
        )}
      />
      {
        documents?.map((doc, i: number) => (
          <View key={i} style={styles.uploadButton}>
            <Text>{doc.name}</Text>
            {removeDocument && <TouchableOpacity onPress={() => removeDocument(doc.uri)}>
              <Feather name="x" size={20} color={'black'} />
            </TouchableOpacity>}
          </View>
        ))
      }
      {
        images?.map((image: Asset, i: number) => (
          <View key={i} style={styles.uploadButton}>
            <Text>{image.fileName}</Text>
            {removeImage && <TouchableOpacity onPress={() => removeImage(image.uri as string)}>
              <Feather name="x" size={20} color={'black'} />
            </TouchableOpacity>}
        </View>
      ))
      }
      <Spacer height={20} />
      <SubmitButton text='Upload' mode='outlined' onPress={() => setUploadPopupVisible(true)}/>
      <Spacer height={6} />
      <SubmitButton text="Add Update" onPress={() => {
         if (!errors.title && !errors.description) {
           getLocation()
           setIsVisibleConfirm(true);
          }
        }}
      />
      <Spacer height={6} />
      </ScrollView>
    </KeyboardAvoidingView>
    <ConfirmationPopup isVisible={showAlert} title="Permission Needed" paragraph1="Please enable location access" onPress={() => {
        openSettings()
        setShowAlert(false)
      }} onPressClose={() => setShowAlert(false)} buttonTitle="Enable"/>
      <ConfirmationPopup isVisible={showLocationAndroid} title="Location Needed" paragraph1="Please enable location in your phone" onPress={() => {
        Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        setShowLocationAndroid(false)
      }} onPressClose={() => setShowLocationAndroid(false)} buttonTitle="Ok"/>
    <ConfirmationPopup 
      isVisible={isVisibleFailed} 
      title="Error" 
      paragraph1="Could't submit your Update"
      paragraph2="try again later"
      icon={<Image style={{ width: 50, height: 50 }} 
      source={require('../../assets/icons/Cancel.png')} />} 
      onPressClose={() => setIsVisibleFailed(false)} 
      buttonTitle="Okay" 
      onPress={() => setIsVisibleFailed(false)} 
    />
    <ConfirmationPopup 
      isVisible={isVisibleConfirm} 
      title="Confirm" 
      paragraph1="Are you sure you want to submit your update"
      onPressClose={() => setIsVisibleConfirm(false)} 
      buttonTitle="Yes" 
      extraButton={<SubmitButton text="No" mode='outlined' onPress={() => setIsVisibleConfirm(false)}/>}
      onPress={handleSubmitAddUpdate} 
    />
    </>
  );
}

const styles = StyleSheet.create({
    text: {
      fontWeight: 'bold',
      fontSize: 18
    },
    icon: {
      marginRight: 5,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    dropdown: {
      borderColor: COLORS.neutral._500,
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 12
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    title: {
      color: COLORS.neutral._600,
      fontWeight: '400',
      fontSize: 16
    },
    uploadButton: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }
});
