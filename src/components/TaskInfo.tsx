import { COLORS } from '@/src/colors';
import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Spacer from './atoms/Spacer';
import CarouselSlider from './CarouselSlider';
import LoadingComponent from './LoadingComponent';

const TaskInfo = ({ title, value, sliderimages, setIsVisible, index, setIndex, loadingVisible }: any) => (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Spacer height={10} />
      <Text style={styles.caption}>{value}</Text>
      {loadingVisible && <LoadingComponent />}
      {sliderimages?.length > 0 && (<>
        <Spacer height={10} />
        <TouchableHighlight onPress={() => setIsVisible(true)}>
          <CarouselSlider index={index} images={sliderimages} setIndex={setIndex}/>
        </TouchableHighlight>
        <Spacer height={10}/>
      </>)}
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