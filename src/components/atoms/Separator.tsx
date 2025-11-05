import { COLORS } from '@/src/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const Separator = ({ marginVertical }: { marginVertical: number }) => {
    return (
      <View style = {[styles.container, { marginVertical }]} />
    )
}


const styles = StyleSheet.create({ 
  container: {
    height: 1, 
    width: '100%', 
    backgroundColor: COLORS.neutral._300
  }
});

export default Separator