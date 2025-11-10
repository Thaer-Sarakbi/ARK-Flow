import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { COLORS } from '../colors';
import Spacer from '../components/atoms/Spacer';
import SubmitButton from '../components/buttons/SubmitButton';
import PopupModal from './PopupModal';

/**
 * Popup modal props
 */
export interface ConfirmationPopupProps {
  isVisible: boolean;
  icon?: React.ReactNode;
  title: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  buttonTitle?: string;
  onPress?: () => void;
  onPressClose?: () => void;
  closeIconDisable?: boolean;
  extraElement?: React.ReactNode;
  extraButton?: React.ReactNode;
  gapBetween?: number;
  gapBetweenIconAndCloseBtn?: number;
  padding?: number;
  primaryButtonDisabled?: boolean
}

const ConfirmationPopup = ({isVisible = false, closeIconDisable = false, gapBetween = 16, onPressClose, onPress, buttonTitle = 'Done', icon, title, paragraph1, paragraph2, paragraph3, extraElement, extraButton, padding = 16, gapBetweenIconAndCloseBtn = 16, primaryButtonDisabled = false }: ConfirmationPopupProps) => {
  const { width } = useWindowDimensions();

  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={padding}>
      {!closeIconDisable && 
        <View style={{ width: '100%'}}>
          <TouchableOpacity style={styles.closeBox} onPress={onPressClose} >
              <Feather name="x" size={24} color={'black'} />
          </TouchableOpacity>
        </View>
      }
      {/* <Spacer height={gapBetweenIconAndCloseBtn} /> */}
      <View style={styles.body}>
      {icon}
      {/* <Spacer height={gapBetween} /> */}
      <Text style={styles.title}>{title}</Text>
      {paragraph1 && <Spacer height={16} />}
      {paragraph1 && <Text style={styles.caption}>{paragraph1}</Text>}
      {paragraph2 && <Spacer height={16} />}
      {paragraph2 && <Text style={styles.caption}>{paragraph2}</Text>}
      {paragraph3 && <Spacer height={16} />}
      {paragraph3 && <Text style={styles.caption}>{paragraph3}</Text>}
      {extraElement}
      <Spacer height={gapBetween} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SubmitButton disabled={primaryButtonDisabled} text={buttonTitle} onPress={onPress} />
        <Spacer width={10} />
        {extraButton}
      </View>
      
    </PopupModal>
  )
}

export default ConfirmationPopup

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