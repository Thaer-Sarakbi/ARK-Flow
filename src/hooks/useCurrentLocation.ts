import * as Location from 'expo-location';
import { useCallback, useState } from "react";
import { Linking, Platform } from "react-native";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";

export default function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestPermission = useCallback(async () => {
    const permission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    let result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.BLOCKED) {
      return false;
    }

    result = await request(permission);

    return result === RESULTS.GRANTED;
  }, []);

  const getLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const granted = await requestPermission();

      if (!granted) {
        setError("Location permission denied.");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return location.coords;
    } catch (error) {
      console.error(error);
      setError("Unable to get current location.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:Privacy&path=LOCATION')
    } else {
        Linking.openSettings();
    }
  }, []);

  return { requestPermission, loading, error, openSettings, getLocation };
}
