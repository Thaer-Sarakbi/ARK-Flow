import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from "react-native-maps";

const MapViewComponent = ({ longitude, latitude }: { longitude: number | undefined, latitude: number | undefined }) => (
    <>
      <MapView
        style={styles.container}
        initialRegion={{
          longitude: longitude ? Number(longitude) : 0,
          latitude: latitude ? Number(latitude) : 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
            >
            <Marker
                coordinate={{
                longitude: longitude ? Number(longitude) : 0,
                latitude: latitude ? Number(latitude) : 0
                }}
                pinColor={"red"}
            />
        </MapView>
    </>
)

export default MapViewComponent

const styles = StyleSheet.create({
  container: {
    width: '100%', height: 300, marginVertical: 10, borderRadius: 5
  }
});