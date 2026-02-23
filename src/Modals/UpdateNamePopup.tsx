import Feather from '@expo/vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { COLORS } from '../colors';
import Spacer from '../components/atoms/Spacer';
import SubmitButton from '../components/buttons/SubmitButton';
import Input from '../components/Input';
import PopupModal from './PopupModal';

/**
 * Popup modal props
 */
export interface ConfirmationPopupProps {
  isVisible: boolean;
  title: string;
  paragraph1?: string;
  buttonTitle?: string;
  onPress?: () => void;
  onPressClose?: () => void;
  gapBetween?: number;
  padding?: number;
  id: string | undefined; 
  disable: any;
  updatedName: string | undefined;
  setUpdatedName: (name: string) => void
}

const UpdateNamePopup = ({isVisible = false, id, updatedName, setUpdatedName, disable, gapBetween = 16, buttonTitle = 'Done', title, paragraph1, padding = 16 }: ConfirmationPopupProps) => {
  const { width } = useWindowDimensions();

  const onPress = async () => {
    await firestore()
    .collection('users')
    .doc(id)
    .update({
      fullName: updatedName
    }).finally(
      disable()
    )
  }
  
  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={padding}>
      <View style={styles.body}>
      <View style={{ width: '100%'}}>
          <TouchableOpacity style={styles.closeBox} onPress={() => disable()} >
              <Feather name="x" size={24} color={'black'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{title}</Text>
        {paragraph1 && <Spacer height={16} />}
        {paragraph1 && <Text style={styles.caption}>{paragraph1}</Text>}
        <Spacer height={6} />
        <Input 
          label="Full Name" 
          borderColor={COLORS.neutral._300} 
          inputColor={COLORS.title} 
          labelColor={COLORS.neutral._400} 
          value={updatedName}
          onChangeText={setUpdatedName}
        />
        <Spacer height={gapBetween} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SubmitButton text={buttonTitle} onPress={onPress} />
      </View>  
    </PopupModal>
  )
}

export default UpdateNamePopup

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