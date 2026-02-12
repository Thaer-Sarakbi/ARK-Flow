import Feather from '@expo/vector-icons/Feather';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  onPress:() => void,
  onPressUploadButton?:() => void,
  removeDoc?:(uri: string) => void,
  removeImage?:(uri: string) => void,
  onChangeText:(text: string) => void
}

export default function AttendanceCard({ value, title, caption, buttonText, label, docsList, imagesList, uploadButton = false, onPress, onPressUploadButton, onChangeText, removeDoc, removeImage }: AttendanceCard) {
  
  return (
   <View style={[styles.container, shadow.cards]}>
     <Text style={styles.title}>{title}</Text>
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
   }
});
