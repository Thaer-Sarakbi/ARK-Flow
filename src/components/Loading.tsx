// LoadingScreen.tsx
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { COLORS } from '../colors';
import CircularProgress from './atoms/CircularProgress';

interface LoadingScreenProps {
    visible: boolean;
}

const Loading: React.FC<LoadingScreenProps> = ({ visible }) => {
    return (
        <Modal
            transparent={true}
            animationType="none"
            visible={visible}
        >
            <View style={styles.container}>
                <CircularProgress color={COLORS.primary} size={88} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default React.memo(Loading);
