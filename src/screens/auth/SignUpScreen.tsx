import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import SubmitButton from "@/src/components/buttons/SubmitButton";
import Input from "@/src/components/Input";
import ErrorPopup from "@/src/Modals/ErrorPopup";
import { useAddUserMutation } from "@/src/redux/user";
import { zodResolver } from "@hookform/resolvers/zod";
import auth from '@react-native-firebase/auth';
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { z } from 'zod';

export default function SignUpScreen() {
  const navigation = useNavigation()
  const [message, setMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [addUser, { isLoading, isSuccess, isError }] = useAddUserMutation()

  const schema = z
  .object({
      fullName: z.string({
        required_error: 'This field is required'
      }).min(1, { message: 'This field is required' }),
      email: z.string({
        required_error: 'This field is required'
      }).email({ message: 'Invalid email' }),
      phoneNumber: z .string()
      .min(1, { message: 'This field is required' })
      .max(11, { message: 'Invalid phone number' }),
      password: z.string({
        required_error: 'This field is required'
      }).refine((val) => val.length > 0, { message: 'This field is required' }),
      confirmPassword: z.string({
        required_error: 'This field is required'
      }).refine((val) => val.length > 0, { message: 'This field is required' })
    })    
    .refine((data) => data.password === data.confirmPassword, {
    message: "Your password doesn't match",
    path: ['confirmPassword'],
  })

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      watch
    } = useForm({
      defaultValues: {
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
      },
      resolver: zodResolver(schema),
      mode: 'onTouched',
    })

    const handleSubmitLogin = async () => {
      const { fullName, email, password, phoneNumber } = watch()
 
      await auth().createUserWithEmailAndPassword(email, password).then((res) => {
        setMessage('User account created!');
        addUser({ fullName, email, phoneNumber })
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          setMessage('That email address is already in use!');
          setShowAlert(true)
        } else if (error.code === 'auth/invalid-email') {
          setMessage('That email address is invalid!');
          setShowAlert(true)
        } else {
          setMessage(error.code);
          setShowAlert(true)
        }
      });
    }

  return (
   <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textHeader}>Welcome!</Text>
      </View>
      <Animatable.View style={styles.footer} animation='fadeInUpBig'>
        <ScrollView>
          <Text style={styles.textFooter}>Full Name</Text>
          <Spacer height={6} />
           <Controller
            name="fullName"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input 
                autoCapitalize="none"
                label="Your full name" 
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
        <Text style={styles.textFooter}>Phone Number</Text>
        <Spacer height={6} />
        <Controller
            name="phoneNumber"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input 
                label="Your phone number"
                keyboardType='numeric'
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
          <Spacer height={20} />
          <Text style={styles.textFooter}>Confirm Password</Text>
          <Spacer height={6} />
          <Controller
            name="confirmPassword"
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
          <Spacer height={50} />
          <SubmitButton text="Sign Up"  onPress={handleSubmit(handleSubmitLogin)}/>
          <Spacer height={15} />
          <SubmitButton text="Sign In" mode='outlined'  onPress={() => navigation.goBack()} />
        </ScrollView>
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
  footer: {
    flex: 3,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30
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
  textFooter: {
    color: COLORS.title,
    fontWeight: '400',
    fontSize: 18
  }
})