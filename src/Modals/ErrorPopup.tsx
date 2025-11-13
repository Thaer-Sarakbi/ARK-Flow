import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { COLORS } from '../colors';
import Spacer from '../components/atoms/Spacer';
import SubmitButton from '../components/buttons/SubmitButton';
import PopupModal from './PopupModal';


/**
 * Popup modal props
 */
interface ErrorPopupProps {
  /**
   * If the popup is visible
   */
  isVisible: boolean;
  /**
   * Icon to display in the popup
   */
  icon?: React.ReactNode;
  title: string;
  buttonTitle?: string;
  description: string;
  onPress?: () => void;
  onPressClose?: () => void;
  closeIconDisable?: boolean;
  /**
   * Extra element to display in the popup
   */
  extraElement?: React.ReactNode;
  gapBetweenIconAndCloseIcon?: number;
  gapBetweenTitleAndExtraElement?: number;
  gapBetweenExtraElementAndButton?: number;
}

const ErrorPopup = ({isVisible = false, closeIconDisable = false, onPressClose, onPress = () => {}, buttonTitle = "Got It", icon, title, description, gapBetweenIconAndCloseIcon = 0, gapBetweenTitleAndExtraElement = 0, gapBetweenExtraElementAndButton = 24, extraElement }: ErrorPopupProps) => {
  const { width } = useWindowDimensions();

  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={24} borderRadius={16}>
      {!closeIconDisable && 
        <View style={{ width: '100%'}}>
          <TouchableOpacity style={styles.closeBox} onPress={onPressClose} >
              <Feather name="x" size={24} color={'black'} />
          </TouchableOpacity>
        </View>
      }
      <Spacer height={gapBetweenIconAndCloseIcon} />
      <View style={styles.body}>
      {icon}
      <Spacer height={24} />
      <Text style={styles.title}>{title}</Text>
      <Spacer height={16} />
      <Text style={styles.caption}>{description}</Text>
      <Spacer height={gapBetweenTitleAndExtraElement} />
      {extraElement}
      <Spacer height={gapBetweenExtraElementAndButton} />
      </View>
      <SubmitButton text={buttonTitle} onPress={onPress}/>
    </PopupModal>
  )
}

export default ErrorPopup

const styles = StyleSheet.create({
  closeBox: { justifyContent: 'center', alignItems: 'flex-end' },
  body: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  caption: {
    color: COLORS.caption,
    fontSize: 15
  }
})