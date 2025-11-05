import React from 'react';
import { View } from 'react-native';

const Spacer = ({ height, width }: { height?: number, width?: number }) => {
    return (
      <View style={{height, width }} />
    )
}

export default Spacer