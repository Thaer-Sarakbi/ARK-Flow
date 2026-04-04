import Feather from '@expo/vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Input from '../components/atoms/Input';
import Spacer from '../components/atoms/Spacer';
import SubmitButton from '../components/atoms/SubmitButton';
import { COLORS } from '../utils/colors';
import PopupModal from './PopupModal';

/**
 * Popup modal props
 */
export interface UpdateProfilePopupProps {
  isVisible: boolean;
  title: string;
  paragraph1?: string;
  paragraph2?: string;
  buttonTitle?: string;
  onPress?: () => void;
  onPressClose?: () => void;
  gapBetween?: number;
  padding?: number;
  id: string | undefined; 
  disable: any;
  enableCloseIcone?: boolean;
  data: string;
  value: string | undefined;
  setUpdate: (data: string) => void;
  placeholder: string
}

const UpdateProfilePopup = ({isVisible = false, id, data, value, setUpdate, disable, enableCloseIcone = true, gapBetween = 16, buttonTitle = 'Done', title, paragraph1, paragraph2, padding = 16, placeholder }: UpdateProfilePopupProps) => {
  const { width } = useWindowDimensions();

  const onPress = async () => {
    if(value){
      await firestore()
      .collection('users')
      .doc(id)
      .update({
        [data]: value
      }).finally(
        disable()
      )
    }
   
  }
  
  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={padding}>
      <View style={styles.body}>
      {enableCloseIcone && <View style={{ width: '100%'}}>
          <TouchableOpacity style={styles.closeBox} onPress={() => disable()} >
              <Feather name="x" size={24} color={'black'} />
          </TouchableOpacity>
        </View>}
        <Text style={styles.title}>{title}</Text>
        {paragraph1 && <Spacer height={16} />}
        {paragraph1 && <Text style={styles.caption}>{paragraph1}</Text>}
        {paragraph2 && <Spacer height={2} />}
        {paragraph2 && <Text style={styles.caption}>{paragraph2}</Text>}
        <Spacer height={6} />
        <Input 
          label={!value ? placeholder : ''} 
          borderColor={COLORS.neutral._300} 
          inputColor={COLORS.title} 
          labelColor={COLORS.neutral._400} 
          value={value}
          onChangeText={setUpdate}
        />
        <Spacer height={gapBetween} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SubmitButton text={buttonTitle} onPress={onPress} />
      </View>  
    </PopupModal>
  )
}

export default UpdateProfilePopup

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