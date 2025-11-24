// src/components/BackgroundWithGradient.tsx

import React from 'react';
import { Image, Platform } from 'react-native';

interface ValidationIconProps {
    variant: boolean
}

const ValidationIcon: React.FC<ValidationIconProps> = ({ variant = true }) => {
    const imageSource = variant ? require('../../assets/icons/checked.png') : require('../../assets/icons/checkGrey.png');

    return (
        <Image source={imageSource} style={{ marginTop: Platform.OS == 'android' ? 3.5 : 0, width: 14, height: 14 }}/>
    );
};

export default ValidationIcon;
