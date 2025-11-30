// src/components/BackgroundWithGradient.tsx

import Icon from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../colors';

const MainHeader = () => {
    return(
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={styles.title}>Tasks</Text>
        </View>
        <View style={styles.right}>
            <TouchableOpacity onPress={() => {}}>
            <Icon name= {'search-outline'} size={35} color={'white'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
            <Icon name= {'notifications-outline'} size={35} color={'white'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
            <Icon name= {'chatbubbles-outline'} size={35} color={'white'} />
            </TouchableOpacity>
        </View>
      </View>
    )
};

export default MainHeader;

const styles = StyleSheet.create({
    container:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: COLORS.primary,
      paddingHorizontal: 10,
      height: 100,
      alignItems: 'flex-end',
      paddingBottom: 10
    },
    right:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1
    },
    left:{
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2
    },
    title:{
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        marginHorizontal: 15
    },
    notificationIconBadge: { 
      backgroundColor: 'red', 
      position: 'absolute', 
      top: -5, 
      left: 15, 
      zIndex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      borderRadius: 10 
    }
  })