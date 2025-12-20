import Ionicons from "@expo/vector-icons/Ionicons";
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../colors";

interface AddComment { 
    comment: string, 
    setComment: (text: string) => void, 
    onSubmitComment: () => void
  }

  export default function AddComment ({ comment, setComment, onSubmitComment }: AddComment){
  const isCommentValid = comment.trim().length > 0;

  return (
    <View style={styles.commentContainer}>
       <TextInput
         value={comment}
         onChangeText={(text) => setComment(text)}
         onSubmitEditing={Keyboard.dismiss}
         style={styles.input}
       />
       <TouchableOpacity 
        onPress={isCommentValid ? onSubmitComment : undefined}
         style={styles.button}
       >
         <Ionicons name="send-outline" size={25} color={'white'}  />
       </TouchableOpacity>
     </View>
  )
}

const styles = StyleSheet.create({ 
    commentContainer: { 
        flex: 1,
        width: '100%', 
        borderRadius: 8,
        backgroundColor: COLORS.neutral._400, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingLeft: 10, 
        paddingRight: 5 
    },
    input: { 
        flex: 1, 
        backgroundColor: 'white', 
        padding: 10,
        borderRadius: 10, 
        marginVertical: 5, 
        marginRight: 5, 
        fontSize: 15 
    },
    button: { 
        backgroundColor: COLORS.primary, 
        borderRadius: 50, 
        width: 50, 
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center' 
    }
});