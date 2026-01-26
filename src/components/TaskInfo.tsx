import { COLORS } from '@/src/colors';
import Entypo from '@expo/vector-icons/Entypo';
import React from 'react';
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import Spacer from './atoms/Spacer';
import CarouselSlider from './CarouselSlider';
import LoadingComponent from './LoadingComponent';

const TaskInfo = ({ title, value, sliderimages, setIsVisible, index, setIndex, loadingVisible, pressable = false, onPress }: any) => (
    <TouchableOpacity disabled={pressable ? false : true} style={[styles.container, { backgroundColor: pressable ? COLORS.neutral._300  :  COLORS.white }]} onPress={onPress}>
      <View>
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
      {pressable && <Entypo name="chevron-small-right" size={24} color="black" />}
    </TouchableOpacity>
)

const styles = StyleSheet.create({ 
   container: {
    flex: 1,
     padding: 10,
     borderRadius: 10,
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center'
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