import { COLORS } from "@/src/colors";
import Spacer from "@/src/components/atoms/Spacer";
import Container from "@/src/components/Container";
import { useGetUsersQuery } from "@/src/redux/user";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from "react";
import { StyleSheet } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { Dropdown } from 'react-native-element-dropdown';

const data = [
  { label: 'Item 1', value: '1' },
  { label: 'Item 2', value: '2' },
  { label: 'Item 3', value: '3' },
  { label: 'Item 4', value: '4' },
  { label: 'Item 5', value: '5' },
  { label: 'Item 6', value: '6' },
  { label: 'Item 7', value: '7' },
  { label: 'Item 8', value: '8' },
];

export default function CalendarScreen() {
  const [value, setValue] = useState('1');
  const [isFocus, setIsFocus] = useState(false);
  const { data: listOfUsers, isLoading, isError } = useGetUsersQuery()
  console.log(listOfUsers)

  return (
    <Container headerMiddle="Calendar">
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: COLORS.info }]}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
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
        <Spacer height={20} />
        <CalendarPicker />
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