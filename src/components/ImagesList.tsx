import Feather from '@expo/vector-icons/Feather';
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../colors";

interface ImagesList {
    removeImage: (uri: string) => void, 
    imageUri: string | undefined
}

export default function ImagesList({ removeImage, imageUri }: ImagesList) {

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      {removeImage && <TouchableOpacity style={styles.removeIcone} onPress={() => removeImage(imageUri as string)}>
        <Feather name="x" size={20} color={'black'} />
      </TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginRight: 10
  },
  image: { 
    width: 90, 
    height: 90, 
    borderRadius: 10 
  },
  removeIcone: { 
    position: 'absolute', 
    right: 4, 
    top: 2, 
    backgroundColor: COLORS.white, 
    borderRadius: 50 
  }
});
