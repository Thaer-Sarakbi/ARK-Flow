import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import { useUserData } from "@/src/hooks/useUserData";
import { useGetDaysWorkingQuery, useGetLeaveDaysQuery } from "@/src/redux/attendance";
import { useGetUsersQuery } from "@/src/redux/user";
import { MainStackParamsList } from "@/src/routes/MainStack";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { Dropdown } from 'react-native-element-dropdown';

export type RootStackNavigationProp = StackNavigationProp<MainStackParamsList>;

export default function CalendarScreen() {
  const navigation =  useNavigation<RootStackNavigationProp>()
  const [isFocus, setIsFocus] = useState(false);
  const [date,setDate] = useState(new Date());
  const { data: user, loading, isError: isErrorUserData } = useUserData();
  const { data: listOfUsers, isLoading: isLoadingUsers, isError } = useGetUsersQuery()
  const [value, setValue] = useState<string | undefined>();
  const { data: workingDays, isLoading: isLoadingReport, isError: isErrorReport } = useGetDaysWorkingQuery({ userId: value })
  const { data: leaves, isLoading: isLoadingLeave, isError: isErrorLeave } = useGetLeaveDaysQuery({ userId: value })

  const dropdownData = listOfUsers?.map(item => ({
    value: item.id,
    label: item.name
  }));

  useEffect(() => {
    if (user?.id) {
      setValue(user.id);
    }
  }, [user]); 
 
  let workDays: any = []
  if(workingDays){
    workingDays.forEach((day: any) => {
      if(new Date(day.data().time.seconds * 1000).getMonth() + 1 === new Date(date).getMonth() + 1){
        workDays.push(moment(new Date(day.data().time.seconds * 1000)).format('L'))
      }
    })
  }

  let leaveDays: any = []
  leaves?.forEach((leaveDay: any) => {
    if(new Date(leaveDay.data().time.seconds * 1000).getMonth() + 1 === new Date(date).getMonth() + 1){
      leaveDays.push(moment(new Date(leaveDay.data().time.seconds * 1000)).format('L'))
    }
  })

  let today = moment(date);
  let customDatesStyles: any = [];
  // Get first and last day of month
  let startOfMonth = today.clone().startOf('month');
  let endOfMonth = today.clone().endOf('month');
  // while(day.add(1, 'day').isSame(today, 'month')) {
  for(let day = startOfMonth.clone(); day.isSameOrBefore(endOfMonth, 'day'); day.add(1, 'day')) {
    const formattedDay = day.format('L');

    if(leaveDays.includes(formattedDay)){
      customDatesStyles.push({
          date: day.clone(),
          style: {backgroundColor: COLORS.info},
          textStyle: {color: 'white'}, // sets the font color
          containerStyle: [], // extra styling for day container
          allowDisabled: true, // allow custom style to apply to disabled dates
        });  
  }
  else if(workDays.includes(formattedDay)){
      customDatesStyles.push({
        date: day.clone(),
        style: {backgroundColor: 'green'},
        textStyle: {color: 'white'}, // sets the font color
        containerStyle: [], // extra styling for day container
        allowDisabled: true, // allow custom style to apply to disabled dates
      });  
    }
    else {
      customDatesStyles.push({
        date: day.clone(),
        style: {backgroundColor: 'red'},
        textStyle: {color: 'white'}, // sets the font color
        containerStyle: [], // extra styling for day container
        allowDisabled: true, // allow custom style to apply to disabled dates
      });
    }
  }

  if (isLoadingLeave || isLoadingReport || loading || isLoadingUsers) return <Loading visible={true} />
  if (isError || isErrorReport || isErrorLeave || isErrorUserData) return <ErrorComponent />
  
  return (
    <Container headerMiddle="Calendar">
      {
        dropdownData && (
          <Dropdown
          disable={!user?.profile.admin ? true : false}
          style={[styles.dropdown, isFocus && { borderColor: COLORS.info }]}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={dropdownData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <Ionicons
              style={styles.icon}
              name="person-outline"
              size={16}
            />
          )}
        />
        )
      }
        <Spacer height={20} />
        <CalendarPicker 
          onDateChange={(date) => navigation.navigate('DayDetails', { userId: value, date } as any)}
          customDatesStyles={customDatesStyles}
          onMonthChange={(date) => setDate(date)}
          startFromMonday={true}
          selectedDayStyle={{ backgroundColor: COLORS.neutral._400 }}
          previousComponent={<Ionicons name={'arrow-back-outline'} size={24} color={'black'} />}
          nextComponent={<Ionicons name={'arrow-forward-outline'} size={24} color={'black'} />}
          headerWrapperStyle={{ backgroundColor: COLORS.neutral._300, height: 50 }}
          monthTitleStyle={{ fontWeight: 'bold' }}
          todayTextStyle={{ color: 'white' }}
          headingLevel={8}
        />
    </Container>
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  }
});