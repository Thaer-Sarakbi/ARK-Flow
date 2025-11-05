import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import Container from '@/src/components/Container';
import useShowPassword from '@/src/hooks/useShowPassword';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import packageJson from '../../../package.json';
import Separator from '../../components/atoms/Separator';

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
  const { height } = useWindowDimensions();
  const { showPassword, toggleShowPassword } = useShowPassword() 

  const  fields = [
    {id: 1, title: 'Email', value: 'thaer92.41@gmail.com'},
    {id: 2, title: 'Mobile Number', value: '01160640434'},
    {id: 3, title: 'Password', value: showPassword ? 'thaer@12.34' : '*******'}
  ]

  return (
    <Container edges={{ bottom: 'additive' }} noPadding={true}>
      <View>
        <ImageBackground style={[styles.background, { height: height / 3 }]} source={require('@/assets/profile.jpg')} >
          <MaterialCommunityIcons name="account-outline" color={COLORS.neutral._400} size={60} />
          <Text style = {styles.name}>Thaer</Text>
          {/* <Text style = {styles.joined}>Joined in {moment(user?.creationDate).format('MMMM YYYY')}</Text> */}
          <Text style={styles.joined}>Joined in 12 Nov 2025</Text>
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
          <TouchableOpacity style = {styles.logOutButton}>
            <Text style = {styles.logOutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>version: {packageJson.version}</Text>
        </View>
      </View>
    </Container>
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
    fontSize: 15 
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
  }
});