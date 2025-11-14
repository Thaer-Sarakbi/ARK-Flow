import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import SubmitButton from "@/src/components/buttons/SubmitButton";
import Input from "@/src/components/Input";
import ErrorPopup from "@/src/Modals/ErrorPopup";
import { AuthStackParamsList } from "@/src/routes/AuthStack";
import { zodResolver } from "@hookform/resolvers/zod";
import auth from '@react-native-firebase/auth';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { z } from 'zod';
import packageJson from '../../../package.json';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamsList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>()
  const [message, setMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  const schema = z
  .object({
    email: z.string({
      required_error: 'This field is required'
    }).email({ message: 'Invalid email' }),
    password: z.string({
      required_error: 'This field is required'
    }).refine((val) => val.length > 0, { message: 'This field is required' })
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const handleSubmitLogin = async () => {
    const { email, password } = watch()

    await auth().signInWithEmailAndPassword(email, password).then((res) => {
      // findDocumentByEmail(email, password)
      console.log(res)
    }).catch((e) => {
      if(e.code === 'auth/invalid-credential'){
        setMessage('Invalid credential');
        setShowAlert(true)
      } else {
        setMessage(e.code);
        setShowAlert(true)
      }
    })
  }

  return (
   <View style={styles.container}>
     <View style={styles.header}>
        <Text style={styles.textHeader}>Welcome!</Text>
      </View>
      <Animatable.View style={styles.footer} animation='fadeInUpBig'>
        <Text style={styles.textFooter}>Email</Text>
        <Spacer height={6} />
       
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input 
                autoCapitalize="none"
                label="Your email" 
                borderColor={COLORS.neutral._300} 
                inputColor={COLORS.title} 
                labelColor={COLORS.neutral._400} 
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorText={error?.message}
              />
            )}
          />
        <Spacer height={20} />
        <Text style={styles.textFooter}>Password</Text>
        <Spacer height={6} />
        <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input
                autoCapitalize="none"
                label='Your password' 
                isPassword 
                borderColor={COLORS.neutral._300} 
                inputColor={COLORS.title} 
                labelColor={COLORS.neutral._400} 
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorText={error?.message}
              />
            )}
          />
        <Spacer height={10} />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={{ color: COLORS.neutral._600 }}>Forgot my password</Text>
        </TouchableOpacity>
        
        {/* <Text style={{ color: 'red', fontSize: 15 }}>{backendError}</Text> */}
        <Spacer height={50} />
        <SubmitButton text="Sign In" onPress={handleSubmit(handleSubmitLogin)}/>
        <Spacer height={15} />
        <SubmitButton text="Sign Up" mode='outlined' onPress={() =>  navigation.navigate('Signup')} />
        <Text style={{ alignSelf: 'center', fontSize: 15, marginVertical: 10, color: COLORS.neutral._500 }}>version: {packageJson.version}</Text>
      </Animatable.View>
      <ErrorPopup 
        isVisible={showAlert} 
        title="Error"
        description={message}
        onPress={() => setShowAlert(false)}
        onPressClose={() => setShowAlert(false)}
      />
   </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.primary
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50
  },
  textHeader: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 30
  },
  footer: {
    flex: 3,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  textFooter: {
    color: COLORS.title,
    fontWeight: '400',
    fontSize: 18
  }
})