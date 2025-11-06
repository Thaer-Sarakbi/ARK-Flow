import { COLORS } from "@/src/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SubmitButton {
  text: string, 
}

export default function SubmitButton({ text }: SubmitButton) {
  return (
    <TouchableOpacity style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      padding: 12
    },
    text: {
      fontWeight: 'bold',
      color: COLORS.white,
      fontSize: 18
    }
});
