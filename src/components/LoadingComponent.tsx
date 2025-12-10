import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const LoadingComponent: React.FC = () => {
    return (
        <View style={styles.container}>
          <LottieView source={require("../../assets/loading.json")} style={styles.icon} autoPlay loop />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      width: '100%', 
      height: 100
    }
});

export default React.memo(LoadingComponent);
