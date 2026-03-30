import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import Container from '@/src/components/Container';
import ProfileInfo from '@/src/components/ProfileInfo';
import ImageViewModal from '@/src/Modals/ImageViewModal';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserDetailsProps{
  route: {
    params: {
      image: string;
      name: string;
      role: string;
      place: string;
      email: string;
      phone: string;
    }
  }
}

const UserDetails = ({ route: { params: { image, name, role, place, email, phone } } }: UserDetailsProps) => {
  const [isImageViewVisible, setIsImageViewVisible] = useState<boolean>(false);

    const fields = useMemo(
      () => [
        { id: 1, title: 'Email', value: email },
        { id: 2, title: 'Mobile Number', value: phone },
        { id: 4, title: 'Role', value: role },
        { id: 5, title: 'Place', value: place },
      ],
      [email, phone, role, place]
    );

    return (
      <Container headerMiddle='User Details' allowBack>
        <Spacer height={20} />
        {
          image ? <TouchableOpacity onPress={() => setIsImageViewVisible(true)} accessibilityLabel='View Profile Image'>
            <Image source={{ uri: image }} style={styles.profilePhoto} />
          </TouchableOpacity>  : (
          <Image source={require('../../../assets/default-profile-picture.png')} style={styles.profilePhoto} />
          )
        }   
        <Spacer height={10} />
        <Text style={styles.title}>{name}</Text>
        <Spacer height={10} />
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity accessibilityLabel="Send Message">
            <Image source={require('@/assets/icons/message.png')} style={styles.icon} />
          </TouchableOpacity> 
          <Spacer width={25} />
          <TouchableOpacity accessibilityLabel="Make Call">
            <Image source={require('@/assets/icons/call.png')} style={styles.icon} />
          </TouchableOpacity>     
        </View>
        <Spacer height={20} />
        {
          fields.map(field => (
            <ProfileInfo key={field.id} title={field.title} value={field.value} />
          ))
        }
        <ImageViewModal index={0} visible={isImageViewVisible} images={[{ url: image }]} setIsVisible={setIsImageViewVisible} />
      </Container>
    )
}

const styles = StyleSheet.create({ 
  profilePhoto: { 
    width: 180, 
    height: 180, 
    borderRadius: 90, 
    alignSelf: 'center' 
  },
  title: {
    fontWeight: 'bold', 
    color: COLORS.title,
    fontSize: 20,
    textAlign: 'center'
  },
  icon : {
    width: 40,
    height: 40
  }
});

export default UserDetails