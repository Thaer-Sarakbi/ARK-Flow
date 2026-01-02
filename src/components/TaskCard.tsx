import Icon from '@expo/vector-icons/Ionicons';
import { Timestamp } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../colors";
import { MainStackParamsList } from '../routes/params';
import { shadow } from "../utils/shadows";
import Separator from './atoms/Separator';
import Spacer from './atoms/Spacer';

interface TaskCard {
    title: string,
    status: string,
    taskId: string
    assignedTo: string
    duration: number
    location: string
    creationDate: Timestamp
    assignedToId: string
}

export type RootStackNavigationProp = StackNavigationProp<MainStackParamsList>;

function addNewlinesToString(text: string, maxLength: number) {
  const words = text.split(' ');
  let result = '';
  let currentLineLength = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // If the word itself is longer than maxLength, just append it with a newline
    if (word.length > maxLength && currentLineLength === 0) {
        result += word + '\n';
        currentLineLength = 0;
        continue;
    }

    // If adding the next word exceeds the max length, start a new line
    if (currentLineLength + word.length + (currentLineLength > 0 ? 1 : 0) > maxLength) {
      result += '\n' + word;
      currentLineLength = word.length;
    } else {
      // Otherwise, add a space if it's not the very first word
      if (currentLineLength > 0) {
        result += ' ';
        currentLineLength += 1;
      }
      result += word;
      currentLineLength += word.length;
    }
  }

  return result;
}

export default function TaskCard({ title, status, taskId, assignedTo, assignedToId, duration, location, creationDate }: TaskCard) {
  const navigation = useNavigation<RootStackNavigationProp>()

  const data = [{icon: 'person-outline', text: assignedTo},{ icon: 'hourglass-outline', text: `${duration} Day` },{ icon: 'location-outline', text: location }]

  const getStyle = (status: string) => {
    if(status === 'In Progress'){
      return{
        borderColor: COLORS.positive,
        color: COLORS.positive,
      }
    } else if(status === 'Not Started'){
      return{
        borderColor: COLORS.info,
        color: COLORS.info,
      } 
    } else if(status === 'Completed'){
      return{
        borderColor: COLORS.danger,
        color: COLORS.danger,
      }
    }
  }

  return (
    <TouchableOpacity style={[styles.container, shadow.cards]} onPress={() => navigation.navigate('TaskDetails', { taskId, assignedToId })}>
      <Text style={styles.caption}>{moment(new Date(creationDate?.seconds * 1000)).format('MMMM Do YYYY, h:ss a')}</Text>
      <Separator marginVertical={10} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{addNewlinesToString(title, 17)}</Text>
        <View style={[styles.statusContainer, getStyle(status)]}>
          <Text style={[styles.statusText, getStyle(status)]}>{status}</Text>
        </View>
      </View>
      {
        data.map((item, index) => (
          <View key={index} style={styles.info}>
            <Icon name={item.icon as any} size={20} color={COLORS.neutral._400} />
            <Spacer width={7} />
            <Text style={styles.caption}>{item.text}</Text>
          </View>
        ))
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      marginTop: 14,
      marginHorizontal: 4,
      borderRadius: 10,
      padding: 8
    },
    titleContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    statusContainer:{
      borderWidth: 2,
      borderRadius: 6,
      paddingHorizontal: 22,
      paddingVertical: 10
    },
    statusText: {
      fontSize: 16
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
    info: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 6 
    }
});
