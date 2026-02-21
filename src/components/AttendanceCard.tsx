import Feather from '@expo/vector-icons/Feather';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { Asset } from 'react-native-image-picker';
import { COLORS } from "../colors";
import { shadow } from '../utils/shadows';
import Spacer from "./atoms/Spacer";
import SubmitButton from "./buttons/SubmitButton";
import ImagesList from './ImagesList';
import Input from "./Input";

interface AttendanceCard {
  value: string,
  title: string, 
  caption: string, 
  buttonText: string,
  label: string,
  docsList?: DocumentPickerResponse[],
  imagesList?: Asset[],
  uploadButton?: boolean,
  shift?: 'Morning' | 'Night';
  onPress:() => void,
  onPressUploadButton?:() => void,
  removeDoc?:(uri: string) => void,
  removeImage?:(uri: string) => void,
  onChangeText:(text: string) => void;
  setShift?:((shift: 'Morning' | 'Night') => void) | any;
}

const shifts = [{value: 1, label: 'Morning'}, {value: 2, label: 'Night'}];

export default function AttendanceCard({ value, title, caption, buttonText, label, docsList, imagesList, uploadButton = false, shift, onPress, onPressUploadButton, onChangeText, removeDoc, removeImage, setShift }: AttendanceCard) {
  const [shiftId, setShiftId] = useState<number | undefined>(1);
  const [isFocus, setIsFocus] = useState(false);

  return (
   <View style={[styles.container, shadow.cards]}>
     <Text style={styles.title}>{title}</Text>
     <Spacer height={4}/>
     {(title === 'Check In' || title === 'Check Out') && (<>
     <Text style={styles.caption}>Shift</Text>
     <Spacer height={4}/>
     <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: COLORS.info }]}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={shifts}
        maxHeight={200}
        labelField="label"
        valueField="value"
        searchPlaceholder="Search..."
        value={shiftId}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setShiftId(item.value);
          setShift((item.label))
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <Feather
            style={styles.icon}
            name={shift === 'Morning' ? "sun" : "moon"}
            size={16}
          />
        )}
      />
     <Spacer height={10}/>
     </>)}
     <Text style={styles.caption}>{caption}</Text>
     <Spacer height={4}/>
     <Input value={value} label={label} backgroundColor={COLORS.neutral._400} multiline numberOfLines={5} heightContainer={60} iIHeight={70} onChangeText={onChangeText}/>
     <Spacer height={5}/>
     <View>
     {
      docsList?.map((doc, i: number) => (
        <View key={i} style={styles.uploadButton}>
          <Text>{doc.name}</Text>
          {removeDoc && <TouchableOpacity onPress={() => removeDoc(doc.uri)}>
            <Feather name="x" size={20} color={'black'} />
          </TouchableOpacity>}
        </View>
      ))
     }
      <FlatList 
        data={imagesList}
        horizontal
        nestedScrollEnabled={true}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({ item }) => (
          <ImagesList removeImage={removeImage as any} imageUri={item.uri} />
        )}
      />
     </View>
     {uploadButton && (
        <>
          <Spacer height={4}/>
          <SubmitButton text='Upload' mode='outlined' onPress={onPressUploadButton}/>
          <Spacer height={6} />
        </>
      )}
     <SubmitButton text={buttonText} onPress={onPress}/>
   </View>
  );
}

const styles = StyleSheet.create({
   container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white
   },
   title: {
     fontWeight: 'bold',
     fontSize: 25,
   },
   caption: {
     color: COLORS.caption,
     fontSize: 15
   },
   uploadButton: { 
     flexDirection: 'row', 
     justifyContent: 'space-between', 
     alignItems: 'center' 
   },
   dropdown: {
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
});
