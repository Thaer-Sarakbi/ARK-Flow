import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../colors";

interface Header {
    allowBack?: boolean,
    headerMiddle?: string,
    rightHeader?: React.ReactNode;
}

export default function Header({ allowBack = false, headerMiddle, rightHeader }: Header) {
  const navigation = useNavigation();
  const navigationBack = () => {
    navigation.goBack()
  }

  return (
   <View style={styles.container}>
     {
        allowBack ? (
            <TouchableOpacity onPress={navigationBack} style={{}}>
              <Icon name={'arrow-back-outline'} size={24} color={COLORS.white} />
           </TouchableOpacity>
        ) : <View />
     }
     <Text style={styles.title}>{headerMiddle}</Text>
     {
      rightHeader ? (
        rightHeader
      ) : <View />
     }
   </View>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: 10,
      paddingHorizontal: 12
    },
    title: {
        fontWeight: 'bold',
        fontSize: 25,
        color: COLORS.white
      },
      caption: {
        color: COLORS.caption,
        fontSize: 15
      }
});
