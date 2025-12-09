import { COLORS } from '@/src/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Spacer from './atoms/Spacer';

const TaskInfo = ({ title, value }: { title: string, value: string | number | undefined }) => (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Spacer height={10} />
      <Text style={styles.caption}>{value}</Text>
    </View>
)

const styles = StyleSheet.create({ 
   container: {
    flex: 1,
     backgroundColor: COLORS.white,
     padding: 10,
     borderRadius: 10
   },
   title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: COLORS.title
  },
  caption: {
    color: COLORS.caption,
    fontSize: 15
  }
});

export default TaskInfo