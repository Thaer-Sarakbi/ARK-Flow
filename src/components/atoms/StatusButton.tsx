import { COLORS } from "@/src/utils/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SubmitButton {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Not Started' | 'In Progress' | 'Completed',
  onPress?:() => void
  disabled?: boolean
}

export default function StatusButton({ status, onPress, disabled }: SubmitButton) {

  return (
    <TouchableOpacity disabled={disabled} style={[styles.container, { borderColor: 
      status === 'Not Started' ? COLORS.info : 
      status === 'Pending' ? COLORS.primary : 
      status === 'In Progress' ?  COLORS.positive : 
      status === 'Approved' ?  COLORS.positive : 
      status === 'Rejected' ? COLORS.danger :
      status === 'Completed' ? COLORS.danger
      : 
      '' 
    }]} 
      onPress={onPress}
    >
      <Text style={[styles.text, { color:  
        status === 'Not Started' ? COLORS.info : 
        status === 'Pending' ? COLORS.primary : 
        status === 'In Progress' ?  COLORS.positive : 
        status === 'Approved' ?  COLORS.positive : 
        status === 'Rejected' ? COLORS.danger :
        status === 'Completed' ? COLORS.danger
        : 
        '' 
      }]}
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
