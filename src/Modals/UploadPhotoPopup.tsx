import Feather from '@expo/vector-icons/Feather';
import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import LoadingComponent from '../components/atoms/LoadingComponent';
import Spacer from '../components/atoms/Spacer';
import SubmitButton from '../components/atoms/SubmitButton';
import useDocumentPicker from '../hooks/useDocumentPicker';
import { COLORS } from '../utils/colors';
import PopupModal from './PopupModal';

/**
 * Popup modal props
 */
export interface UploadPhotoPopup {
  isVisible: boolean 
  setProfileImage:(url: any) => void 
  enableCloseIcone?: boolean
  id: string | undefined
  disable: any  
}

const UploadPhotoPopup = ({ isVisible = false, setProfileImage, enableCloseIcone = true, id, disable }: UploadPhotoPopup) => {
  const { width } = useWindowDimensions();
  const { images, handleSelectImage, uploadAll, removeImage } = useDocumentPicker()
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);

  const handleGallery = useCallback(async () => {
    await handleSelectImage(1)
  }, [handleSelectImage])

  // const handleSubmitImage = async () => {
  //   if (!images?.length) return;

  //   try {
  //     setIsLoadingVisible(true)

  //     await uploadAll(`users/${id}/profile/files`)

  //     setProfileImage([{ url: images[0].uri }])

  //     disable()
  //   } catch (error) {
  //     console.log('Upload error', error)
  //   } finally {
  //     setIsLoadingVisible(false)
  //   }
  // }

  const handleSubmitImage = useCallback(async () => {
    if (!images?.length) return;
  
    try {
      setIsLoadingVisible(true)
  
      await uploadAll(`users/${id}/profile/files`)
  
      setProfileImage([{ url: images[0].uri }])
  
      disable()
    } catch (error) {
      console.log('Upload error', error)
    } finally {
      setIsLoadingVisible(false)
    }
  }, [images, uploadAll, id, setProfileImage, disable])
  
  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={16}>
      {loadingVisible ? <LoadingComponent /> :
      <>
       <View style={styles.body}>
       {enableCloseIcone && <View style={{ width: '100%'}}>
         <TouchableOpacity style={styles.closeBox} onPress={() => {
           disable() 
           if (images[0]?.uri) {
            removeImage(images[0].uri)
          }
         }}>
             <Feather name="x" size={24} color={'black'} />
         </TouchableOpacity>
       </View>}
       <Text style={styles.title}>Profile Photo</Text>
       <Text style={styles.caption}>Please upload your photo</Text>
       <Text style={styles.caption}>It is important to know each other</Text>
       <Spacer height={6} />
       {
         images.length > 0 ?
          <Image source={{ uri: images[0].uri }} style={styles.profilePhoto} />
          :
          <Image source={require('@/assets/default-profile-picture.png')} style={styles.profilePhoto} />
       }
       <Spacer height={16} />
     </View>
     <Spacer height={10} />
     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
       <SubmitButton text={'Submit'} onPress={images.length > 0 ? handleSubmitImage : undefined} />
       <Spacer width={10} />
       <SubmitButton mode='outlined' text={'Upload'} onPress={handleGallery} />
     </View>   
     </>  
      }
  
    </PopupModal>
  )
}

export default UploadPhotoPopup

const styles = StyleSheet.create({
  closeBox: { justifyContent: 'center', alignItems: 'flex-end' },
  body: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  caption: {
    color: COLORS.caption,
    fontSize: 15
  },
  icon: {
    marginRight: 5,
  },
  profilePhoto: { width: 80, height: 80, borderRadius: 50 },
})