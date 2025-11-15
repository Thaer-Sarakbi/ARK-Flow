import Geolocation from "@react-native-community/geolocation";
import { useState } from "react";
import { Linking, Platform } from "react-native";

export default function useCurrentLocation(){
    const [showAlert, setShowAlert] = useState(false)
    const [showAlertAndroid, setShowAlertAndroid] = useState(false)
    const [latitude, setLatitude] = useState<number>()
    const [longitude, setLongitude] = useState<number>()
  
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition((info: {coords:{latitude: number, longitude: number}}) => {
        setLatitude(info.coords.longitude)
        setLongitude(info.coords.longitude)
      }, async(err) => {
        console.log(err)
        if(err.code === 1){
          setShowAlert(true);
        } else if(err.code === 2){
          setShowAlertAndroid(true)
        }
      })
    }
  
    const openSettings = () => {
      if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:Privacy&path=LOCATION')
      } else {
        if(showAlert){
          Linking.openSettings();
        } else if(showAlertAndroid){
          Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        }
       
      }
    };

    return { 
      latitude, 
      longitude, 
      showAlert, 
      showAlertAndroid, 
      getCurrentLocation, 
      openSettings, 
      setShowAlert, 
      setShowAlertAndroid 
    }
}