import AddTaskButton from "@/src/components/atoms/AddTaskButton";
import Container from "@/src/components/atoms/Container";
import Spacer from "@/src/components/atoms/Spacer";
import { RootStackNavigationProp } from "@/src/components/molecules/TaskCard";
import RequestAdvanced from "@/src/components/organisms/RequestAdvanced";
import BottomSheet from "@/src/Modals/BottomSheet";
import UpdateAdvancedBalance from "@/src/Modals/UpdateAdvancedBalance";
import { useLazyGetAdvancesQuery } from "@/src/redux/advances";
import {
  useGetUsersRealtimeQuery,
  useUserDataRealTimeQuery,
} from "@/src/redux/user";
import { COLORS } from "@/src/utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAuth } from "@react-native-firebase/auth";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Approved from "./Approved";
import Pending from "./Pending";
import Rejected from "./Rejected";

const auth = getAuth();
const Tab = createMaterialTopTabNavigator();

export default function SalaryAdvanced({}) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {
    data: user,
    isLoading,
    isError: isErrorUserData,
  } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null);
  const {
    data: listOfUsers,
    isLoading: isLoadingUsers,
    isError,
  } = useGetUsersRealtimeQuery();
  const [getAdvances] = useLazyGetAdvancesQuery();
  const [isVisible, setIsVisible] = useState(false);
  const [showBalanceUpdate, setShowBalanceUpdate] = useState(false);
  const [setUpdatedAdvancedBalance] = useState(0);
  const [value, setValue] = useState<string | undefined>();
  const [label, setLabel] = useState<string | undefined>();
  const {
    data: requestedByData,
    isLoading: isLoadingRequestedByData,
    isError: isErrorRequestedByData,
  } = useUserDataRealTimeQuery(value ?? null, { skip: !value });
  const [isFocus2, setIsFocus2] = useState(false);

  const dropdownData = useMemo(() => {
    if (!listOfUsers) return [];
    return listOfUsers.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [listOfUsers]);

  useEffect(() => {
    if (!user?.id) return;
    getAdvances({ userId: user.id });
  }, [isVisible, user?.id]);

  useEffect(() => {
    if (user?.id) {
      setValue(user.id);
      setLabel(user.fullName);
    }
  }, [user]);

  return (
    <>
      <Container
        headerMiddle="Salary Advances"
        drawer
        noPadding
        scrollable={false}
      >
        <Spacer height={16} />
        <Dropdown
          disable={!user?.advancesReviewer}
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
          onChange={(item) => {
            setValue(item.value);
            setLabel(item.label);
            setIsFocus2(false);
          }}
          renderLeftIcon={() => (
            <Ionicons style={styles.icon} name="person-outline" size={16} />
          )}
        />
        <Spacer height={20} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <View>
            <Text
              style={{ fontSize: 18, textAlign: "center", fontWeight: "bold" }}
            >
              Balance
            </Text>
            <View
              style={{
                backgroundColor: COLORS.neutral._400,
                width: 150,
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {requestedByData?.salaryAdvance ?? 0}
              </Text>
            </View>
          </View>
          <Spacer width={4} />
          {user?.advancesReviewer ? (
            <TouchableOpacity onPress={() => setShowBalanceUpdate(true)}>
              <Text
                style={{
                  textDecorationLine: "underline",
                  textDecorationColor: COLORS.white,
                  color: COLORS.info,
                  fontSize: 16,
                }}
              >
                edit
              </Text>
            </TouchableOpacity>
          ) : undefined}
        </View>
        <View style={{ paddingLeft: 12 }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AdvancesHistory", { requestedById: value })
            }
          >
            <Text
              style={{
                textDecorationLine: "underline",
                textDecorationColor: COLORS.white,
                color: COLORS.info,
                fontSize: 16,
              }}
            >
              history
            </Text>
          </TouchableOpacity>
        </View>
        <Spacer height={20} />
        <Tab.Navigator
          initialRouteName="Pending"
          screenOptions={{
            tabBarLabelStyle: { fontSize: 12 },
            tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
          }}
        >
          <Tab.Screen name="Pending">
            {() => <Pending requestedById={value} />}
          </Tab.Screen>
          <Tab.Screen name="Approved">
            {() => <Approved requestedById={value} />}
          </Tab.Screen>
          <Tab.Screen name="Rejected">
            {() => <Rejected requestedById={value} />}
          </Tab.Screen>
        </Tab.Navigator>
        <AddTaskButton onPress={() => setIsVisible(true)} />
      </Container>
      <UpdateAdvancedBalance
        id={value}
        isVisible={showBalanceUpdate}
        balance={requestedByData?.salaryAdvance ?? 0}
        title="Update Balance"
        buttonTitle="Update"
        disable={() => {
          setShowBalanceUpdate(false);
        }}
        setUpdate={setUpdatedAdvancedBalance}
      />
      <BottomSheet visible={isVisible} onPress={() => setIsVisible(false)}>
        {user && <RequestAdvanced setIsVisible={setIsVisible} user={user} />}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderColor: COLORS.neutral._500,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginHorizontal: 16,
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
  },
});
