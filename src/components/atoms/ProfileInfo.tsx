import { COLORS } from '@/src/utils/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Separator from './Separator';

interface ProfileInfoInfo {
  title: string; 
  value: string | null | undefined;
  showPassword?: boolean; 
  toggleShowPassword?:() => void; 
  setShowRoleAlert?:(bool: boolean) => void; 
  setShowPlaceAlert?:(bool: boolean) => void
}

const ProfileInfo = ({ title, value, showPassword, toggleShowPassword, setShowRoleAlert, setShowPlaceAlert }: ProfileInfoInfo) => {
    return (
      <View>
        <View style={styles.container}>
          <View>
            <Text style = {styles.title}>{title}</Text>
            <Text style = {styles.value}>{value}</Text>
          </View>
      
        {title === 'Password' && (<MaterialIcons 
          name={showPassword ? 'visibility-off' : 'visibility'} 
          size={25} 
          color={COLORS.neutral._500}
          style={{marginRight: 10}} 
          onPress={toggleShowPassword} 
         />)} 

        {(title === 'Role' && setShowRoleAlert) && (
          <TouchableOpacity onPress={() => setShowRoleAlert(true)}>
            <Text style={styles.text}>Edit</Text>
          </TouchableOpacity>)} 

        {(title === 'Place' && setShowPlaceAlert) && (
          <TouchableOpacity onPress={() => setShowPlaceAlert(true)}>
            <Text style={styles.text}>change</Text>
          </TouchableOpacity>)} 
        </View>
        <Separator marginVertical={15} />
     </View>
    )
}

const styles = StyleSheet.create({ 
    container: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
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
    text: {
      textDecorationLine: 'underline', textDecorationColor: COLORS.info, color: COLORS.info, fontSize: 16
    }
});

export default ProfileInfo