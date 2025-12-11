import { COLORS } from '@/src/colors';
import Icon from '@expo/vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity } from "react-native";

interface AddTaskButton {
  onPress:() => void
}

export default function AddTaskButton({ onPress }: AddTaskButton) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon name="add-outline" size={40} color={'white'} />  
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: COLORS.primary, 
      position: 'absolute', 
      bottom: 20, 
      right: 20, 
      width: 60, 
      height: 60, 
      borderRadius: 50, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }
});
