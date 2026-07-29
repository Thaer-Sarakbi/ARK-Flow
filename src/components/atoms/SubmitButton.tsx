import { COLORS } from "@/src/utils/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import CircularProgress from "./CircularProgress";

interface SubmitButton {
  text: string, 
  mode?: 'normal' | 'outlined', 
  disabled?: boolean,
  onPress?:() => void
  loading?: boolean
}

export default function SubmitButton({ text, mode = 'normal', onPress, loading, disabled }: SubmitButton) {
  return (
    <TouchableOpacity disabled={disabled} style={[styles.container, { backgroundColor: mode === 'normal' ? COLORS.primary : COLORS.white }]} onPress={onPress}>
      <Text style={[styles.text, { color: mode === 'normal' ? COLORS.white : COLORS.primary }]}>{text}</Text>
      {loading && <CircularProgress size={40} color={COLORS.white} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
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
