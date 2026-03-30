import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../colors';
import { MainStackParamsList } from '../routes/params';
import { shadow } from '../utils/shadows';
import { User } from '../utils/types';
import Spacer from './atoms/Spacer';

interface Place {
  label: string
  image: ImageSourcePropType
  users: any;
  latitude: number | undefined;
  longitude: number | undefined
}

export type RootStackNavigationProp = StackNavigationProp<MainStackParamsList>;

const Place = ({ label, image, users, latitude, longitude }: Place) => {
    const navigation = useNavigation<RootStackNavigationProp>()

    return (
      <TouchableOpacity style={[styles.container, shadow.cards]} onPress={() => navigation.navigate('PlaceDetails', { place: label, latitude, longitude })}>
        <Image source={image ?? require('@/assets/images/places/empty.jpg')} resizeMode='cover' style={styles.image} />
        <Spacer height={6} />
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.caption}>{users.filter((user: User) => user.placeName === label).length} Workers</Text>
        <Spacer height={6} />
      </TouchableOpacity>
    )
}


const styles = StyleSheet.create({ 
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  image: { 
    width: '100%', 
    height: 200 
  },
  title: { fontWeight: 'bold', color: COLORS.title,fontSize: 18 },
  caption: { color: COLORS.caption, fontSize: 13 }
});

export default Place