import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import SubmitButton from "@/src/components/buttons/SubmitButton";
import Container from "@/src/components/Container";
import Input from "@/src/components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from 'zod';

export default function ForgotPassword() {
  const schema = z
  .object({
      email: z.string({
      required_error: 'This field is required'
    }).email({ message: 'Invalid email' })
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({
    defaultValues: {
      email: ""
    },
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const handleSubmitLogin = () => {

  }

  return (
   <Container headerMiddle="Forgot Password" allowBack>
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
     <Spacer height={10} />
     <SubmitButton text="Reset" onPress={handleSubmit(handleSubmitLogin)} />
   </Container>
  );
}