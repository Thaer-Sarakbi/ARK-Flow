import { COLORS } from '@/src/colors';
import { Image, StyleSheet, Text, View } from "react-native";
import Spacer from '../atoms/Spacer';

export default function ErrorComponent() {
  return (
     <View style={styles.container}>
      <Image source={require('../../../assets/icons/Cancel.png')} style={styles.image}/>
      <Spacer height={10} />
      <Text style={styles.title}>Something Wrong</Text>
      <Spacer height={6} />
      <Text style={styles.caption}>Check you connection or try again later</Text>
     </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center'
    },
    image: {
      width: 100, 
      height: 100
    },
    title: {
        fontWeight: 'bold',
        fontSize: 25,
      },
      caption: {
        color: COLORS.caption,
        fontSize: 15
      },
});
