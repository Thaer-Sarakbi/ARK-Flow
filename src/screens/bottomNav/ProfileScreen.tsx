import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import SubmitButton from '@/src/components/buttons/SubmitButton';
import Container from '@/src/components/Container';
import Input from '@/src/components/Input';
import Loading from '@/src/components/Loading';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import useShowPassword from '@/src/hooks/useShowPassword';
import PopupModal from '@/src/Modals/PopupModal';
import UpdatePlacePopup from '@/src/Modals/UpdatePlacePopup';
import { useDeleteUserMutation, useLazyGetUsersQuery, useUserDataRealTimeQuery } from '@/src/redux/user';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import notifee from '@notifee/react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import packageJson from '../../../package.json';
import Separator from '../../components/atoms/Separator';

const auth = getAuth();

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
  const [text, setText] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [showPlaceAlert, setShowPlaceAlert] = useState(false)
  const [placeName, setPlaceName] = useState<string | undefined>('')
  const [placeId, setPlaceId] = useState<number | undefined>()
  const [error, setError] = useState('')
  const { height } = useWindowDimensions();
  const { showPassword, toggleShowPassword } = useShowPassword() 
  const [deleteUser] = useDeleteUserMutation()
  const { data, isLoading, isError } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
  const [getUsers] = useLazyGetUsersQuery()

  const  fields = [
    {id: 1, title: 'Email', value: data?.email},
    {id: 2, title: 'Mobile Number', value: data?.phoneNumber},
    {id: 3, title: 'Password', value: showPassword ? data?.password : '*******'},
    {id: 4, title: 'Place', value: placeName}
  ]

  useEffect(() => {
    setPlaceName(data?.placeName)
    setPlaceId(data?.placeId)
  },[data])

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

  if(isLoading) return <Loading visible={true} />
  if(isError) return <ErrorComponent />
  return (
    <>
    <Container edges={{ bottom: 'additive' }} noPadding={true} noHeader>
      <View>
        <ImageBackground style={[styles.background, { height: height / 3 }]} source={require('@/assets/profile.jpg')} >
          <MaterialCommunityIcons name="account-outline" color={COLORS.neutral._400} size={60} />
          <Text style = {styles.name}>{data?.fullName}</Text>
          {/* <Text style = {styles.joined}>Joined in {moment(user?.creationDate).format('MMMM YYYY')}</Text> */}
          <Text style={styles.joined}>Joined in {moment(data?.accountCreated).format('MMMM YYYY')}</Text>
        </ImageBackground>
      
        <View style = {styles.body}>
          <Text style = {styles.mainTitle}>Profile Details</Text>
          <Spacer height={15} />
          {
            fields.map(field => (
              <View key={field.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style = {styles.title}>{field.title}</Text>
                    <Text style = {styles.value}>{field.value}</Text>
                  </View>
              
                {field.title === 'Password' && (<MaterialIcons 
                  name={showPassword ? 'visibility-off' : 'visibility'} 
                  size={25} 
                  color={COLORS.neutral._500}
                  style={{marginRight: 10}} 
                  onPress={toggleShowPassword} 
                 />)} 

                {field.title === 'Place' && (
                  <TouchableOpacity onPress={() => setShowPlaceAlert(true)}>
                    <Text style={{ textDecorationLine: 'underline', textDecorationColor: COLORS.info, color: COLORS.info, fontSize: 16 }}>change</Text>
                  </TouchableOpacity>)} 
                </View>
                <Separator marginVertical={15} />
             </View>
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
      </View>
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
  errorMsg : { color: COLORS.danger, alignSelf: 'flex-start', fontSize: 12 }
});