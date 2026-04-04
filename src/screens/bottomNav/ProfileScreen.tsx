import Container from '@/src/components/atoms/Container';
import Input from '@/src/components/atoms/Input';
import Loading from '@/src/components/atoms/Loading';
import ProfileInfo from '@/src/components/atoms/ProfileInfo';
import Spacer from '@/src/components/atoms/Spacer';
import SubmitButton from '@/src/components/atoms/SubmitButton';
import ErrorComponent from '@/src/components/molecules/ErrorComponent';
import useShowPassword from '@/src/hooks/useShowPassword';
import ImageViewModal from '@/src/Modals/ImageViewModal';
import PopupModal from '@/src/Modals/PopupModal';
import UpdateProfilePopup from '@/src/Modals/UpdateNamePopup';
import UpdatePlacePopup from '@/src/Modals/UpdatePlacePopup';
import UploadPhotoPopup from '@/src/Modals/UploadPhotoPopup';
import { useDeleteUserMutation, useLazyGetUsersQuery, useUserDataRealTimeQuery } from '@/src/redux/user';
import { DrawerNavigation } from '@/src/routes/DrawerNavigator';
import { COLORS } from '@/src/utils/colors';
import Feather from '@expo/vector-icons/Feather';
import Icon from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import notifee from '@notifee/react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getStorage, ref } from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import packageJson from '../../../package.json';

const auth = getAuth();
const storage = getStorage();

const UploadFile = ({ text }: { text: string }) => (
  <View style = {{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
    <MaterialCommunityIcons name="arrow-up-circle" color={COLORS.neutral._500} size={30} />
    <Spacer width={10}/>
    <View>
      <Text style = {styles.docs}>{text}</Text>
    </View>
  </View>
)

export default function ProfileScreen() {
  const navigation = useNavigation<DrawerNavigation>()
  const [text, setText] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [showPlaceAlert, setShowPlaceAlert] = useState(false)
  const [showNameAlert, setShowNameAlert] = useState(false)
  const [showRoleAlert, setShowRoleAlert] = useState(false)
  const [showPhotoAlert, setShowPhotoAlert] = useState(false)
  const [placeName, setPlaceName] = useState<string | undefined>('')
  const [role, setRole] = useState<string | undefined>('')
  const [placeId, setPlaceId] = useState<number | undefined>()
  const [updatedName, setUpdatedName] = useState<string | undefined>('')
  const [profileImage, setProfileImage] = useState<IImageInfo[]>([])
  const [isImageViewVisible, setIsImageViewVisible] = useState<boolean>(false);
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
  const [error, setError] = useState('')
  const { height } = useWindowDimensions();
  const { showPassword, toggleShowPassword } = useShowPassword() 
  const [deleteUser] = useDeleteUserMutation()
  const { data, isLoading, isError } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
  const [getUsers] = useLazyGetUsersQuery()

  const folderPath = `users/${data?.id}/profile/files`;

  const  fields = [
    {id: 1, title: 'Email', value: data?.email},
    {id: 2, title: 'Mobile Number', value: data?.phoneNumber},
    {id: 3, title: 'Password', value: showPassword ? data?.password : '*******'},
    {id: 4, title: 'Role', value: data?.role},
    {id: 5, title: 'Place', value: placeName}
  ]

  useEffect(() => {
    setPlaceName(data?.placeName)
    setPlaceId(data?.placeId)
    setUpdatedName(data?.fullName)
    setRole(data?.role)
  },[data, showNameAlert, showRoleAlert])

  useEffect(() => {
    const loadFiles = async () => {
      setIsLoadingVisible(true)
      loadAllFiles()
    };

    loadFiles()
  },[])

  const onLogOut = async () => {
    try {
      // Clears all displayed notifications
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }

    await firestore()
    .collection('users')
    .doc(data?.id)
    .update({ fcmToken: '' })
    .then(() => console.log('fcm token cleared'))

    await signOut(auth).then(function() {
      console.log('Signed Out');
    }, function(error) {
      console.error('Sign Out Error', error);
    });
  }

  const ondeleteAccount = async() => {
    if(text === data?.email){
      auth.currentUser?.delete().then(async () => {
        await deleteUser({ userId: data?.id }).unwrap()
        await notifee.cancelAllNotifications();
        console.log("User deleted")
      })
      .catch((error) => console.log(error));

      setIsVisible(false)
      setText('')
    } else {
      //setIsVisible(false)
      setError('Incorrect Email')
      setText('')
    }
  }

  const onClose = () => {
    setIsVisible(false)
    setText('')
    setError('')
  }

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

  if(isLoading || loadingVisible) return <Loading visible={true} />
  if(isError) return <ErrorComponent />
  return (
    <>
    <Container edges={{ bottom: 'additive' }} noPadding={true} noHeader>
        <ImageBackground style={[styles.background, { height: height / 3 }]} source={require('@/assets/profile.jpg')} >
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.drawerIcon}>
            <Icon name= {'reorder-three-outline'} size={35} color={'white'} />
          </TouchableOpacity>
          <View>
            {
              profileImage.length > 0 ? <TouchableOpacity onPress={() => setIsImageViewVisible(true)}>
                  <Image source={{ uri: profileImage[0]?.url }} style={styles.profilePhoto} />
                </TouchableOpacity>  :
              <Image source={require('../../../assets/default-profile-picture.png')} style={styles.profilePhoto} />
            }    
            <TouchableOpacity style={styles.addPhotoButton} onPress={() => setShowPhotoAlert(true)}>
              <Icon name="add-outline" size={25}  />  
            </TouchableOpacity>  
          </View> 
          <Spacer height={10} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style = {styles.name}>{data?.fullName}</Text>
            <Spacer width={6} />
            <TouchableOpacity onPress={() => setShowNameAlert(true)}>
              <Text style={{ textDecorationLine: 'underline', textDecorationColor: COLORS.white, color: COLORS.white, fontSize: 16 }}>edit</Text>
            </TouchableOpacity>
          </View>
          
          {/* <Text style = {styles.joined}>Joined in {moment(user?.creationDate).format('MMMM YYYY')}</Text> */}
          <Text style={styles.joined}>Joined in {moment(data?.accountCreated).format('MMMM YYYY')}</Text>
        </ImageBackground>
      
        <View style = {styles.body}>
          <Text style = {styles.mainTitle}>Profile Details</Text>
          <Spacer height={15} />
          {
            fields.map(field => (
              <ProfileInfo key={field.id} title={field.title} value={field.value} setShowRoleAlert={setShowRoleAlert} setShowPlaceAlert={setShowPlaceAlert} showPassword={showPassword} toggleShowPassword={toggleShowPassword} />
            ))
          }
          <Text style = {styles.mainTitle}>Document Provider</Text>
          <Spacer height={10} />
          <View style = {{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <UploadFile text={'To Upload \n Selfie with IC'} />
            <UploadFile text={'To Upload \n IC/Passport'} />
          </View>
          <Spacer height={10} />
          <View style = {{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <UploadFile text={'To Upload \n Driving License'} />
            <UploadFile text={'To Upload'} />
          </View>
 
          <Spacer height={15} />

          <SubmitButton text='Log Out' mode='outlined' onPress={onLogOut}/>
          <Spacer height={10} />
          <SubmitButton text='Delete Account'  onPress={() => setIsVisible(true)}/>

          <Text style={styles.version}>version: {packageJson.version}</Text>
        </View>
        <Spacer height={40} />
    </Container>
    <PopupModal isVisible={isVisible}>
      <View style={{ width: '100%'}}>
        <TouchableOpacity style={styles.closeBox} onPress={onClose}>
          <Feather name="x" size={24} color={'black'} />
        </TouchableOpacity>
      </View>
      <View style={styles.popuopBody}>
        <Text style={[styles.title, { fontWeight: 'bold', fontSize: 25 }]}>Confirm Delete</Text>
        <Text style={styles.value}>Please type your email to delete your account</Text>
        <Spacer height={10} />
        <Input
          autoFocus
          autoCapitalize="none"
          label='Your email' 
          borderColor={COLORS.neutral._300} 
          inputColor={COLORS.title} 
          labelColor={COLORS.neutral._400} 
          onChangeText={setText}
          value={text}
        />
        <Text style={styles.errorMsg}>{error}</Text>
        <Spacer height={14} />
        <SubmitButton text='Confirm' onPress={ondeleteAccount} />
      </View>
    </PopupModal>
    <UpdatePlacePopup isVisible={showPlaceAlert} id={data?.id} placeName={placeName} placeId={placeId} setPlaceName={setPlaceName} setPlaceId={setPlaceId} title="Your Place" paragraph1="Please choose your place" disable={() => {setShowPlaceAlert(false); getUsers()}} buttonTitle="Submit"/>
    <UpdateProfilePopup isVisible={showNameAlert} id={data?.id} value={updatedName} data={'fullName'} setUpdate={setUpdatedName} title="Edit Name" paragraph1="Please type your updated name" disable={() => {setShowNameAlert(false)}} buttonTitle="Submit" placeholder="Full Name"/>
    <UploadPhotoPopup isVisible={showPhotoAlert} id={data?.id} setProfileImage={setProfileImage} disable={() => setShowPhotoAlert(false)} />
    <UpdateProfilePopup isVisible={showRoleAlert} id={data?.id} value={role} data={'role'} setUpdate={setRole} title="Edit Role" paragraph1="Please type your role" paragraph2="For Example: Counter, Cleaner....." disable={() => {setShowRoleAlert(false)}} buttonTitle="Submit" placeholder="Role"/>
    <ImageViewModal index={0} visible={isImageViewVisible} images={profileImage} setIsVisible={setIsImageViewVisible} />
    </>
  );
}

const styles = StyleSheet.create({
  background: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  name: { 
    color: COLORS.white, 
    fontSize: 15, 
  },
  joined: { 
    color: COLORS.white, 
    fontSize: 15 
  },
  body: { 
    padding: 16
  },
  mainTitle: {  
    fontWeight: 'bold', 
    color: COLORS.title, 
    fontSize: 20, 
  },
  title: { 
    color: COLORS.title, 
    fontSize: 15 
  },
  value: { 
    color: COLORS.caption, 
    fontSize: 15,
    textAlign: 'center' 
  },
  docs: { 
    color: COLORS.caption, 
  },
  logOutText: { 
    color: COLORS.danger, 
    fontWeight: 'bold' 
  },
  logOutButton: { 
    borderWidth: 1, 
    borderColor: COLORS.danger, 
    width: '100%',
    paddingVertical: 12,
    justifyContent: 'center', 
    alignItems: 'center', 
    alignSelf: 'center', 
    borderRadius: 10 
  },
  version: { 
    color: COLORS.caption,
    alignSelf: 'center', 
    fontSize: 15, 
    marginVertical: 10 
  },
  closeBox: { justifyContent: 'center', alignItems: 'flex-end' },
  popuopBody: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMsg : { color: COLORS.danger, alignSelf: 'flex-start', fontSize: 12 },
  drawerIcon: { position: 'absolute', top: 50, left: 20 },
  profilePhoto: { width: 80, height: 80, borderRadius: 50 },
  addPhotoButton: { backgroundColor: COLORS.white, borderRadius: 50, position: 'absolute', right: 0, bottom: 0 }
});