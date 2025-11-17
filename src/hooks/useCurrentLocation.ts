import Geolocation from "@react-native-community/geolocation";
import { useCallback, useState } from "react";
import { Linking, PermissionsAndroid, Platform } from "react-native";

export default function useCurrentLocation() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ask for permission
  const requestPermission = async () => {
    if (Platform.OS === "ios") return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  // Get latest location
  const getLocation = useCallback(async () => {
    setLoading(true);
    setError("");

    const ok = await requestPermission();
    if (!ok) {
      setError("Location permission denied.");
      setLoading(false);
      return null;
    }

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ latitude, longitude });
          setLoading(false);
          resolve({ latitude, longitude });
        },
        (err) => {
          setError(err.message);
          setLoading(false);

          // If user disabled location services
          if (err.code === 2) {
            if (Platform.OS === "ios") {
              Linking.openURL("App-Prefs:root=Privacy&path=LOCATION");
            } else {
              Linking.openSettings();
            }
          }

          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    coords,
    loading,
    error,
    getLocation,
  };
}
