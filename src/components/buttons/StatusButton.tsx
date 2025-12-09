import { COLORS } from "@/src/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SubmitButton {
  status: 'Not Started' | 'In Progress' | 'Completed',
  onPress?:() => void
}

export default function StatusButton({ status, onPress }: SubmitButton) {

  return (
    <TouchableOpacity style={[styles.container, { borderColor: 
      status === 'Not Started' ? COLORS.info : 
      status === 'In Progress' ?  COLORS.positive : 
      status === 'Completed' ? COLORS.danger : '' }]} onPress={onPress}
    >
      <Text style={[styles.text, { color:  status === 'Not Started' ? COLORS.info : 
        status === 'In Progress' ?  COLORS.positive : 
        status === 'Completed' ? COLORS.danger : '' }]}
      >{status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1
    },
    text: {
      fontWeight: 'bold',
      fontSize: 18
    }
});
