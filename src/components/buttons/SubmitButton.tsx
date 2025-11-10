import { COLORS } from "@/src/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SubmitButton {
  text: string, 
  mode?: 'normal' | 'outlined', 
  disabled?: boolean,
  onPress?:() => void
}

export default function SubmitButton({ text, mode = 'normal', onPress }: SubmitButton) {
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: mode === 'normal' ? COLORS.primary : COLORS.white }]} onPress={onPress}>
      <Text style={[styles.text, { color: mode === 'normal' ? COLORS.white : COLORS.primary }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: COLORS.primary
    },
    text: {
      fontWeight: 'bold',
      fontSize: 18
    }
});
