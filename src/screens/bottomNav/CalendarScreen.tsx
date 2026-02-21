import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import SubmitButton from "@/src/components/buttons/SubmitButton";
import Container from "@/src/components/Container";
import Loading from "@/src/components/Loading";
import ErrorComponent from "@/src/components/molecule/ErrorComponent";
import { useGetAttendanceRealtimeQuery, useGetDaysWorkingRealTimeQuery, useGetLeaveDaysRealTimeQuery, useGetUpdatesDaysRealTimeQuery } from "@/src/redux/attendance";
import { useGetUsersRealtimeQuery, useUserDataRealTimeQuery } from "@/src/redux/user";
import { MainStackParamsList } from "@/src/routes/params";
import { monthRange, PdfTemplate, Places } from "@/src/utils/Constants";
import Ionicons from '@expo/vector-icons/Ionicons';
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { Dropdown } from 'react-native-element-dropdown';
import FileViewer from "react-native-file-viewer";
import { generatePDF } from 'react-native-html-to-pdf';

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
  const [label, setLabel] = useState<string | undefined>();
  const skip = !value;
  const { data: workingDays, isLoading: isLoadingReport, isError: isErrorReport } = useGetDaysWorkingRealTimeQuery({ userId: value }, { skip })
  const { data: leaves, isLoading: isLoadingLeave, isError: isErrorLeave } = useGetLeaveDaysRealTimeQuery({ userId: value }, { skip })
  const { data: updates, isLoading: isLoadingUpdates, isError: isErrorUpdates } = useGetUpdatesDaysRealTimeQuery({ userId: value }, { skip })
  const { data: attendanceList } = useGetAttendanceRealtimeQuery({ userId: value, date: moment(date).format("DD-MM-YYYY") }, { skip: !value || !date })

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
      setLabel(user.fullName);
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
    if(new Date(updatesDay.creationDate.seconds * 1000).getMonth() + 1 === new Date(date).getMonth() + 1){
      updatesDays.push(moment(new Date(updatesDay.creationDate.seconds * 1000)).format('L'))
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

  const createPdf = async () => {
    const [, month, year ] = moment(date).format("DD-MM-YYYY").split('-').map(Number);
    const days = monthRange(month, year)

    const mapById = new Map(attendanceList?.map((item: any) => [item.id, item])) as any;

    const rowsMorning = days.map(day => {
     const currentDay = day.split('-').reverse().join("-")
     return(
      `
      <tr>
        <td>${currentDay}</td>
        <td>${mapById.get(currentDay)?.checkInMorning ? moment(new Date(mapById.get(currentDay)?.checkInMorning.seconds * 1000)).format('hh:mm a') : '-' }</td>
        <td class="note">${mapById.get(currentDay)?.checkInNoteMorning ? mapById.get(currentDay)?.checkInNoteMorning : '-'}</td>
        <td>${mapById.get(currentDay)?.checkOutMorning ? moment(new Date(mapById.get(currentDay)?.checkOutMorning?.seconds * 1000)).format('hh:mm a') : '-'}</td>
        <td class="note">${mapById.get(currentDay)?.checkOutNoteMorning ? mapById.get(currentDay)?.checkOutNoteMorning : '-'}</td>
      </tr>
    `
     )
    }).join('')

    const rowsNight = days.map(day => {
      const currentDay = day.split('-').reverse().join("-")
      return(
       `
       <tr>
         <td>${currentDay}</td>
         <td>${mapById.get(currentDay)?.checkInNight ? moment(new Date(mapById.get(currentDay)?.checkInNight.seconds * 1000)).format('hh:mm a') : '-' }</td>
         <td class="note">${mapById.get(currentDay)?.checkInNoteNight ? mapById.get(currentDay)?.checkInNoteNight : '-'}</td>
         <td>${mapById.get(currentDay)?.checkOutNight ? moment(new Date(mapById.get(currentDay)?.checkOutNight?.seconds * 1000)).format('hh:mm a') : '-'}</td>
         <td class="note">${mapById.get(currentDay)?.checkOutNoteNight ? mapById.get(currentDay)?.checkOutNoteNight : '-'}</td>
       </tr>
     `
      )
     }).join('')

    let options = {
      html: PdfTemplate(rowsMorning, rowsNight, label, moment(date).format('MMMM')),
      fileName: `${label} Attendance`,
      directory: 'Documents',
    };

    let results = await generatePDF(options);
    FileViewer.open(results.filePath)
  };

  if (isLoadingLeave || isLoadingReport || isLoading || isLoadingUsers || isLoadingUpdates) return <Loading visible={true} />
  if (isError || isErrorReport || isErrorLeave || isErrorUserData || isErrorUpdates) return <ErrorComponent />
  
  return (
    <>
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
            setLabel(item.label)
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
    <View style={{ position: 'absolute', width: '100%', bottom: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
      <SubmitButton text="Export" onPress={createPdf} />
    </View>
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  }
});