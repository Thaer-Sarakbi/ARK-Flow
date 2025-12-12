import { Image, ImageProps, StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../colors";
import Spacer from "./atoms/Spacer";

const BoxUpload = ({ title, source, onPress }: { title: string, source: ImageProps, onPress:() => void }) => {
  return (
    <TouchableOpacity style={styles.boxUploadContainer} onPress={onPress}>
      <Image style={styles.imgIcon} source={source} />
      <Spacer height={8}/>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({ 
   boxUploadContainer: { 
        alignItems: 'center', 
        borderWidth: 2, 
        borderRadius: 8, 
        borderColor: COLORS.info, 
        paddingVertical: 10, 
        paddingHorizontal: 4 
    },
    imgIcon: {
        height: 24,
        width: 24,
    },
    title: {
        color: COLORS.info,
        fontWeight: 'bold',
        fontSize: 25,
    },
});

export default BoxUpload