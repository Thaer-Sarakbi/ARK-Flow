import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import { useUserData } from "@/src/hooks/useUserData";
import { useGetUsersQuery } from "@/src/redux/user";
import { MainStackParamsList } from "@/src/routes/MainStack";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { Dropdown } from 'react-native-element-dropdown';

export type RootStackNavigationProp = StackNavigationProp<MainStackParamsList>;

export default function CalendarScreen() {
  const navigation =  useNavigation<RootStackNavigationProp>()
  const [isFocus, setIsFocus] = useState(false);
  const { data: user, loading } = useUserData();
  const { data: listOfUsers, isLoading, isError } = useGetUsersQuery()
  
  const [value, setValue] = useState<string | null>(null);

  const dropdownData = listOfUsers?.map(item => ({
    value: item.id,
    label: item.name
  }));

  useEffect(() => {
    if (user?.id) {
      setValue(user.id);
    }
  }, [user]); 

  return (
    <Container headerMiddle="Calendar">
      {
        dropdownData && (
          <Dropdown
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
          onDateChange={(date) => navigation.navigate('DayDetails', { date } as any)}
         // customDatesStyles={customDatesStyles}
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