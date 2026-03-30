import Entypo from '@expo/vector-icons/Entypo';
import { getStorage, ref } from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import { COLORS } from '../colors';
import { shadow } from '../utils/shadows';
import Loading from './Loading';
import Spacer from './atoms/Spacer';

interface UserComponentProps {
  id: string, 
  name: string, 
  role: string | undefined, 
  admin: boolean | undefined;
  place: string | undefined;
  email: string | undefined;
  phone: string | undefined;  
}

const storage = getStorage();

const User = ({ id, name, role, admin, place, email, phone }: UserComponentProps) => {
    const navigation = useNavigation()
    const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<IImageInfo[]>([])

    const folderPath = `users/${id}/profile/files`;

    useEffect(() => {
      const loadFiles = async () => {
        setIsLoadingVisible(true)
        loadAllFiles()
      };
    
      loadFiles()
    },[])

    async function loadAllFiles() {
        const folderRef = ref(storage, folderPath);
        const result = await folderRef.listAll();
        if(result.items.length < 1){
          setIsLoadingVisible(false)
        }
        const url = await result.items[0].getDownloadURL();
        setProfileImage([{url}])
        setIsLoadingVisible(false)
    }

    if(loadingVisible) return <Loading visible={true} />

    return (
      <TouchableOpacity style={[styles.container, shadow.cards]} onPress={() => navigation.navigate('UserDetails', { image: profileImage[0]?.url, name, role, place, email, phone })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {
            profileImage.length > 0 ? <View>
                <Image source={{ uri: profileImage[0]?.url }} style={styles.profilePhoto} />
            </View>  :
            <Image source={require('@/assets/default-profile-picture.png')} style={styles.profilePhoto} />
          }  
          <Spacer width={6} />
          <View>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.caption}>{role}</Text>
          </View>        
        </View>
        <View style={{ flexDirection: 'row' }}>
          {
            admin && (<View style={{ backgroundColor: COLORS.positive, padding: 6, borderRadius: 16 }}>
              <Text style={{ color: COLORS.white }}>Admin</Text>
            </View>)
          }
          <Entypo name="chevron-small-right" size={24} color="black" /> 
        </View>
        
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({ 
  container: {
    backgroundColor: COLORS.white,
    marginHorizontal: 6,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 50
  },
  title: {
    fontWeight: 'bold', color: COLORS.title,fontSize: 15
  },
  caption: { color: COLORS.caption, fontSize: 13 }
});

export default User