import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import SubmitButton from "@/src/components/buttons/SubmitButton";
import Input from "@/src/components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from 'zod';

export default function SignUpScreen() {
  const navigation = useNavigation()

  const schema = z
  .object({
    firstName: z.string({
      required_error: 'This field is required'
    }).min(1, { message: 'This field is required' }),
    lastName: z.string({
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

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      watch
    } = useForm({
      defaultValues: {
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
      },
      resolver: zodResolver(schema),
      mode: 'onTouched',
    })

    const handleSubmitLogin = () => {

    }

  return (
   <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textHeader}>Welcome!</Text>
      </View>
      <View style={styles.footer}>
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
      </View>     
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