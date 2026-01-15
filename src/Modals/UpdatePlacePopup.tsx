import Ionicons from '@expo/vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { COLORS } from '../colors';
import Spacer from '../components/atoms/Spacer';
import SubmitButton from '../components/buttons/SubmitButton';
import { Places } from '../utils/Constants';
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
  primaryButtonDisabled?: boolean;
  id: string | undefined; 
  placeName: string | undefined;
  placeId: number | undefined;
  setPlaceName:(label: string) => void; 
  setPlaceId:(value: number) => void
  disable: any
}

const UpdatePlacePopup = ({isVisible = false, id, placeId, placeName, setPlaceName, setPlaceId, disable, gapBetween = 16, buttonTitle = 'Done', icon, title, paragraph1, extraButton, padding = 16, primaryButtonDisabled = false }: ConfirmationPopupProps) => {
  const { width } = useWindowDimensions();
  const [isFocus, setIsFocus] = useState(false)

  const onPress = async () => {
    await firestore()
    .collection('users')
    .doc(id)
    .update({
      placeName,
      placeId
    }).finally(
      disable()
    )
  }
  
  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={padding}>
      <View style={styles.body}>
      {icon}
      <Text style={styles.title}>{title}</Text>
      {paragraph1 && <Spacer height={16} />}
      {paragraph1 && <Text style={styles.caption}>{paragraph1}</Text>}
      <Spacer height={6} />
      <Dropdown
          style={[styles.dropdown, 
            isFocus && { borderColor: COLORS.info }
          ]} 
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={Places}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          searchPlaceholder="Search..."
          value={placeId}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setPlaceName(item.label)
            setPlaceId(item.value)
            setIsFocus(item)
          }}
          renderLeftIcon={() => (
            <Ionicons
              style={styles.icon}
              name="location-outline"
              size={16}
            />
          )}
        />
      <Spacer height={gapBetween} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SubmitButton disabled={primaryButtonDisabled} text={buttonTitle} onPress={placeName && placeName?.length > 0 ? onPress : undefined} />
        <Spacer width={10} />
        {extraButton}
      </View>
      
    </PopupModal>
  )
}

export default UpdatePlacePopup

const styles = StyleSheet.create({
  closeBox: { justifyContent: 'center', alignItems: 'flex-end' },
  body: {
    width: '100%',
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
  },
  dropdown: {
    width: '100%',
    borderColor: COLORS.neutral._500,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 5,
  },

})