import { Platform, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../colors";
import Spacer from "./atoms/Spacer";
import SubmitButton from "./buttons/SubmitButton";
import Input from "./Input";

interface AttendanceCard {
  title: string, 
  caption: string, 
  buttonText: string,
  label: string
}

export default function AttendanceCard({ title, caption, buttonText, label }: AttendanceCard) {
  return (
   <View style={styles.container}>
     <Text style={styles.title}>{title}</Text>
     <Text style={styles.caption}>{caption}</Text>
     <Spacer height={4}/>
     <Input label={label} backgroundColor={COLORS.neutral._400} multiline numberOfLines={5} heightContainer={60} iIHeight={70}/>
     <Spacer height={5}/>
     <SubmitButton text={buttonText}/>
   </View>
  );
}

const styles = StyleSheet.create({
   container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
          shadowColor: COLORS.title,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 5, 
        },
        android: {
          elevation: 4,
        },
    }),
   },
   title: {
     fontWeight: 'bold',
     fontSize: 25,
   },
   caption: {
     color: COLORS.caption,
     fontSize: 15
   }
});
