import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../colors";
import { MainStackParamsList } from '../routes/MainStack';
import { shadow } from "../utils/shadows";
import Separator from './atoms/Separator';
import Spacer from './atoms/Spacer';

interface TaskCard {
    title: string,
    status: string,
    taskId: string
}

export type RootStackNavigationProp = StackNavigationProp<MainStackParamsList>;

const data = [{icon: 'person-outline', text: 'Ali'},{ icon: 'hourglass-outline', text: '1 Day' },{ icon: 'location-outline', text: 'USJ 21' }]

export default function TaskCard({ title, status, taskId }: TaskCard) {
  const navigation = useNavigation<RootStackNavigationProp>()

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
    <TouchableOpacity style={[styles.container, shadow.cards]} onPress={() => navigation.navigate('TaskDetails', { taskId })}>
      <Text style={styles.caption}>February 6th 2024, 11:35 am</Text>
      <Separator marginVertical={10} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
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
