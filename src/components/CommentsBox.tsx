import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../colors";
import { Comment } from "../utils/types";
import AddComment from "./AddComment";
import Spacer from "./atoms/Spacer";

interface CommentsBox { 
    comments: Comment[] | undefined, 
    comment: string 
    setComment: (text: string) => void, 
    onSubmitComment: () => void
  }

  export default function CommentsBox ({ comments, comment, setComment, onSubmitComment }: CommentsBox){

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments: </Text>
      <Spacer height={10} />
      {
        comments?.map((comment: Comment) => (
          <View key={comment.id} style={styles.commentContainer}>
            <Text style={[styles.title, { fontSize: 17, color: COLORS.neutral._600 }]}>{comment.commenter}</Text>
            <Text style={styles.caption}>{comment.comment}</Text>
          </View>
        ))
      }
      <Spacer height={10} />
      <AddComment comment={comment} setComment={setComment} onSubmitComment={onSubmitComment} />
    </View>
  )
}

const styles = StyleSheet.create({ 
    container: { 
      backgroundColor: COLORS.white, 
      borderRadius: 10, 
      padding: 10
    },
    title: {
        fontWeight: 'bold',
        fontSize: 25,
        color: COLORS.title
      },
    caption: {
      color: COLORS.caption,
      fontSize: 15
    },
    commentContainer: { 
      marginBottom: 4, 
      marginLeft: 7 
    }
});