import Geolocation from '@react-native-community/geolocation';
import React, { useCallback, useState } from "react";
import { Platform } from "react-native";
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
    setLoading(true);
    setError("");

    const ok = await requestPermission();
    if (!ok) {
      setError("Location permission denied.");
      setLoading(false);
      return null;
    }

    if (currentLocation) return;
    Geolocation.getCurrentPosition(info => {
      const { latitude, longitude } = info.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      if (!currentLocation?.latitude) {
        setCurrentLocation(newRegion)
        setLocation(newRegion)
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 2000);
          // setLocation(newRegion)
        }
      }
    });
    // return new Promise((resolve) => {
 

      // Geolocation.getCurrentPosition(
      //   (pos) => {
      //     console.log('jj ' , pos)
      //     const { latitude, longitude } = pos.coords;
          
      //     setCoords({ latitude, longitude });
      //     setLoading(false);
      //     resolve({ latitude, longitude });
      //   },
      //   (err) => {
      //     setError(err.message || "Location error");
      //     setLoading(false);

      //     // Suggest user to enable location services
      //     Linking.openSettings();

      //     resolve(null);
      //   },
      //   {
      //     enableHighAccuracy: true,
      //     timeout: 15000,
      //     maximumAge: 10000,
      //   }
      // );
    // });

  }, []);

  return { location,
    currentLocation, loading, error, getLocation };
}
