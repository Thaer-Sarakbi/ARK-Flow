import Container from '@/src/components/atoms/Container';
import Input from '@/src/components/atoms/Input';
import Loading from '@/src/components/atoms/Loading';
import Spacer from '@/src/components/atoms/Spacer';
import SubmitButton from '@/src/components/atoms/SubmitButton';
import ErrorComponent from '@/src/components/molecules/ErrorComponent';
import ConfirmationPopup from '@/src/Modals/ConfirmationPopup';
import { useAddSalesMutation } from '@/src/redux/sales';
import { useUserDataRealTimeQuery } from '@/src/redux/user';
import { COLORS } from '@/src/utils/colors';
import { Places } from '@/src/utils/Constants';
import Icon from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from '@react-native-firebase/auth';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, StyleSheet, Text } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { z } from 'zod';

const auth = getAuth();
export default function DailySales() {
  const { data: user, isLoading, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
  const [addSales, {isLoading:isAdding}] = useAddSalesMutation()
  const [isVisibleSalesSuccess, setIsVisibleSalesSuccess] = useState(false)
  const [isVisibleSalesFailed, setIsVisibleSalesFailed] = useState(false)
  const [placeId, setPlaceId] = useState<number | undefined>();
  const [isFocus, setIsFocus] = useState(false);
  const [place, setPlace] = useState<string>("");
  const date = moment().format("DD-MM-YYYY");

  useEffect(() => {
    if (user?.id) {
      setPlace(user.placeName);
      setPlaceId(user.placeId)
    }
  }, [user?.id]); 

  const schema = z.object({
    totalSales: z.string()
      .min(1, "This field is required")
      .regex(/^\d+(\.\d+)?$/, "Must be a valid number or decimal"), 
    totalExpenses: z.string()
      .min(1, "This field is required")
      .regex(/^\d+(\.\d+)?$/, "Must be a valid number or decimal"), 
    banking: z.string()
      .min(1, "This field is required")
      .regex(/^\d+(\.\d+)?$/, "Must be a valid number or decimal"), 
    emptyRooms: z.string()
      .min(1, "This field is required")
      .regex(/^\d+(\.\d+)?$/, "Must be a valid number or decimal"), 
    onlineBooking: z.string()
      .min(1, "This field is required")
      .regex(/^\d+(\.\d+)?$/, "Must be a valid number or decimal"), 
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      totalSales: '',
      totalExpenses: '',
      banking: '',
      emptyRooms: '',
      onlineBooking: '',
    },
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const handleSubmitSales = async (data: { totalSales: string; totalExpenses: string; banking: string; emptyRooms: string; onlineBooking: string }) => {
    if (!place) {
      setIsVisibleSalesFailed(true);
      return;
    }

    try {
      await addSales({
        ...data,
        date,
        place,
        by: user?.fullName
      }).unwrap();
    
      setIsVisibleSalesSuccess(true);
      reset();
    
    } catch(error) {
      console.log(error);
      setIsVisibleSalesFailed(true);
    }
  }

  if (isLoading) return <Loading visible={true} />
  if (isErrorUserData) return <ErrorComponent />
  return (
    <>
    <Container headerMiddle="Daily Sales" scrollable={false} drawer>
      <ScrollView>
      <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: COLORS.info }]}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={Places.slice(1)}
          maxHeight={300}
          labelField="label"
          valueField="value"
          searchPlaceholder="Search..."
          value={placeId}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setPlaceId(item.value);
            setPlace((item.label))
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <Icon
              style={styles.icon}
              name="location-outline"
              size={16}
            />
          )}
        />
        <Spacer height={20} />
        <Text style={styles.textLabel}>Total Sales</Text>
        <Spacer height={6} />
        <Controller
            name="totalSales"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input
                label='RM' 
                keyboardType='decimal-pad'
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
           <Spacer height={16} />
        <Text style={styles.textLabel}>Total Expenses</Text>
        <Spacer height={6} />
        <Controller
            name="totalExpenses"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input
                label='RM' 
                keyboardType='decimal-pad'
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
          <Spacer height={16} />
        <Text style={styles.textLabel}>Banking</Text>
        <Spacer height={6} />
        <Controller
            name="banking"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input
                autoCapitalize="none"
                label='RM' 
                keyboardType='decimal-pad'
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
        <Spacer height={16} />
        <Text style={styles.textLabel}>Total Empty Rooms</Text>
        <Spacer height={6} />
        <Controller
            name="emptyRooms"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input
                label='' 
                keyboardType='decimal-pad'
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
        <Spacer height={16} />
        <Text style={styles.textLabel}>Total Number Of Online Booking</Text>
        <Spacer height={6} />
          <Controller
            name="onlineBooking"
            control={control}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
              <Input 
                label="" 
                keyboardType='decimal-pad'
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
        <Spacer height={16} />
        <Spacer height={20} />
        <SubmitButton disabled={isAdding} text={isAdding ? "Submitting..." : "Submit"} onPress={handleSubmit(handleSubmitSales)}/>
        <Spacer height={50} />
        </ScrollView>    
        </Container>
            <ConfirmationPopup 
              isVisible={isVisibleSalesSuccess} 
              title="Submitted Successfully" 
              paragraph1="Your daily sales report uploaded" 
              icon={<Image style={{ width: 50, height: 50 }} 
              source={require('../../../assets/icons/Success.png')} />} 
              onPressClose={() => setIsVisibleSalesSuccess(false)} 
              buttonTitle="Okay" 
              onPress={() => setIsVisibleSalesSuccess(false)} 
            />
                <ConfirmationPopup 
                  isVisible={isVisibleSalesFailed} 
                  title="Error" 
                  paragraph1="Could't submit your report"
                  paragraph2="try again later"
                  icon={<Image style={{ width: 50, height: 50 }} 
                  source={require('../../../assets/icons/Cancel.png')} />} 
                  onPressClose={() => setIsVisibleSalesFailed(false)} 
                  buttonTitle="Okay" 
                  onPress={() => setIsVisibleSalesFailed(false)} 
                />
        </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderColor: COLORS.neutral._500,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12
  },
  icon: {
    marginRight: 5,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  textLabel: {
    color: COLORS.title,
    fontWeight: '400',
    fontSize: 15
  }
});
