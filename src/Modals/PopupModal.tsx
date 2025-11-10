import React from 'react';
import { ColorValue, DimensionValue, KeyboardAvoidingView, Modal, Platform, StyleSheet, View, ViewProps } from 'react-native';
import { COLORS } from '../colors';

/**
 * Popup Modal
 */
interface PopupModalProps {
  isVisible: boolean;
  children?: React.ReactNode;
  width?: DimensionValue;
  padding?: DimensionValue,
  backgroundColor?: ColorValue;
  usingKeyboardAvoidingView?: boolean;
  styleModal?: ViewProps['style'];
  styleModalView?: ViewProps['style'];
  borderRadius?: number;
}

/**
 * 
 * @param param0 
 * @returns {*}
 */
const PopupModal = ({isVisible = false, usingKeyboardAvoidingView = false, children, width = 343, padding = 16, borderRadius = 8, backgroundColor= COLORS.white, styleModal, styleModalView
}: PopupModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}>
        <View style={[styles.modalContainer, styleModal]}>
        {usingKeyboardAvoidingView ? <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0} // Use the offset prop
        >
          <View style={[styles.modalView, { width, padding, backgroundColor, borderRadius}, styleModalView]}>
            {children}
          </View>
        </KeyboardAvoidingView> :
          <View style={[styles.modalView, { width, padding, backgroundColor, borderRadius}, styleModalView]}>
          {children}
        </View>
        }
        </View>
    </Modal>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: 'center',
  },
});

/**
 * Export
 */
export default PopupModal