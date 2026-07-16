import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import MapView, { Region } from "react-native-maps";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";

export default function useCurrentLocation(mapRef: React.RefObject<MapView>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<Region | any>(null);
  const [currentLocation, setCurrentLocation] = useState<Region | any>(null);

  const requestPermission = async () => {
    const permission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    let result = await check(permission);
    if (result === RESULTS.GRANTED) return true;

    result = await request(permission);
    return result === RESULTS.GRANTED;
  };

  const getLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const ok = await requestPermission();

      if (!ok) {
        setError("Location permission denied.");
        return;
      }

      const info = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      setCurrentLocation(info.coords);
    } catch (e) {
      setError("Failed to get location");
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:Privacy&path=LOCATION')
    } else {
        Linking.openSettings();
    }
  };

  return { location, requestPermission,
    currentLocation, loading, error, openSettings, getLocation };
}
