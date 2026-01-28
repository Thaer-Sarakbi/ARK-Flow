import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import { useGetDaysWorkingRealTimeQuery, useGetLeaveDaysRealTimeQuery, useGetUpdatesDaysQuery } from "@/src/redux/attendance";
import { useGetUsersRealtimeQuery, useUserDataRealTimeQuery } from "@/src/redux/user";
import { MainStackParamsList } from "@/src/routes/params";
import { Places } from "@/src/utils/Constants";
import Ionicons from '@expo/vector-icons/Ionicons';
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { Dropdown } from 'react-native-element-dropdown';

const auth = getAuth();
export type RootStackNavigationProp = StackNavigationProp<MainStackParamsList>;

export default function CalendarScreen() {
  const navigation =  useNavigation<RootStackNavigationProp>()
  const [isFocus, setIsFocus] = useState(false);
  const [isFocus2, setIsFocus2] = useState(false);
  const [date,setDate] = useState(new Date());
  const { data: user, isLoading, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
  const { data: listOfUsers, isLoading: isLoadingUsers, isError }= useGetUsersRealtimeQuery()
  const [placeId, setPlaceId] = useState<number | undefined>();
  const [place, setPlace] = useState<string | undefined>();
  const [value, setValue] = useState<string | undefined>();
  const skip = !value;
  const { data: workingDays, isLoading: isLoadingReport, isError: isErrorReport } = useGetDaysWorkingRealTimeQuery({ userId: value }, { skip })
  const { data: leaves, isLoading: isLoadingLeave, isError: isErrorLeave } = useGetLeaveDaysRealTimeQuery({ userId: value }, { skip })
  const { data: updates, isLoading: isLoadingUpdates, isError: isErrorUpdates } = useGetUpdatesDaysQuery({ userId: value }, { skip })

  // const filteredUsers = listOfUsers?.filter((user) => {return user.placeName === place})
  const filteredUsers = useMemo(() => {
    if (!listOfUsers || !place) return [];
    return listOfUsers.filter(user => user.placeName === place);
  }, [listOfUsers, place]);

  // const dropdownData = filteredUsers?.map(item => ({
  //   value: item.id,
  //   label: item.name
  // }));

  // const dropdownData = filteredUsers?.map(item => {
  //   console.log('item ', item)
  //   return {
  //     value: item.id,
  //     label: item.name
  //   }
  // });

  const dropdownData = useMemo(() => {
    return filteredUsers.map(item => ({
      value: item.id,
      label: item.name,
    }));
  }, [filteredUsers]);
  
  useEffect(() => {
    if (user?.id) {
      setValue(user.id);
      setPlace(user.placeName);
      setPlaceId(user.placeId)
    }
  }, [user]); 
 
  let workDays: string[] = []
  if(workingDays){
    workingDays.forEach((day: any) => {
      if(new Date(day.time.seconds * 1000).getMonth() + 1 === new Date(date).getMonth() + 1){
        workDays.push(moment(new Date(day.time.seconds * 1000)).format('L'))
      }
    })
  }

  let leaveDays: string[] = []
  leaves?.forEach((leaveDay: any) => {
    if(new Date(leaveDay.time.seconds * 1000).getMonth() + 1 === new Date(date).getMonth() + 1){
      leaveDays.push(moment(new Date(leaveDay.time.seconds * 1000)).format('L'))
    }
  })

  let updatesDays: string[] = []
  updates?.forEach((updatesDay: any) => {
    if(new Date(updatesDay.data().creationDate.seconds * 1000).getMonth() + 1 === new Date(date).getMonth() + 1){
      updatesDays.push(moment(new Date(updatesDay.data().creationDate.seconds * 1000)).format('L'))
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
  else if(workDays.includes(formattedDay) || updatesDays.includes(formattedDay)){
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

  if (isLoadingLeave || isLoadingReport || isLoading || isLoadingUsers || isLoadingUpdates) return <Loading visible={true} />
  if (isError || isErrorReport || isErrorLeave || isErrorUserData || isErrorUpdates) return <ErrorComponent />
  
  return (
    <Container headerMiddle="Calendar">
       <Dropdown
          disable={!user?.admin ? true : false}
          style={[styles.dropdown, isFocus && { borderColor: COLORS.info }]}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={Places}
          search
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
            setValue('')
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <Ionicons
              style={styles.icon}
              name="location-outline"
              size={16}
            />
          )}
        />
      <Spacer height={6} />
      {
        dropdownData && (
          <Dropdown
          disable={!user?.admin ? true : false}
          style={[styles.dropdown, isFocus2 && { borderColor: COLORS.info }]}
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
          onFocus={() => setIsFocus2(true)}
          onBlur={() => setIsFocus2(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus2(false);
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