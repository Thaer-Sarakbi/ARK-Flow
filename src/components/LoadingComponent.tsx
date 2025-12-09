import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../colors';
import CircularProgress from './atoms/CircularProgress';

const LoadingComponent: React.FC = () => {
    return (
        <View style={styles.container}>
          <CircularProgress color={COLORS.primary} size={44} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
});

export default React.memo(LoadingComponent);
