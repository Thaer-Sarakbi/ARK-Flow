import Feather from "@expo/vector-icons/Feather";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Spacer from "../components/atoms/Spacer";
import SubmitButton from "../components/atoms/SubmitButton";
import { useUpdateAdvanceStatusMutation } from "../redux/advances";
import { useAddAdvanceNotificationMutation } from "../redux/notifications";
import { useUserDataRealTimeQuery } from "../redux/user";
import { COLORS } from "../utils/colors";
import PopupModal from "./PopupModal";

/**
 * Popup modal props
 */
export interface UpdateAdvanceStatusProps {
  isVisible: boolean;
  title: string;
  paragraph3?: string;
  buttonTitle?: string;
  onPressClose?: () => void;
  gapBetween?: number;
  padding?: number;
  primaryButtonDisabled?: boolean;
  disable: any;
  requestedById: string;
  advanceId: string;
  advanceTitle: string;
  amount: string;
  currentStatus: string;
  currentStatusId: string;
}

const UpdateAdvanceStatus = ({
  isVisible = false,
  requestedById,
  amount,
  gapBetween = 16,
  buttonTitle = "Done",
  advanceId,
  advanceTitle,
  title,
  currentStatus,
  currentStatusId,
  padding = 16,
  primaryButtonDisabled = false,
  onPressClose,
  disable,
}: UpdateAdvanceStatusProps) => {
  const { width } = useWindowDimensions();
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUserData,
  } = useUserDataRealTimeQuery(requestedById ?? null);
  const [isFocus, setIsFocus] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [statusId, setStatusId] = useState(currentStatusId);
  const [updateAdvanceStatus, { isLoading, isSuccess, isError }] =
    useUpdateAdvanceStatusMutation();
  const [
    addNotification,
    { isLoading: isLoadingAddNot, isError: isErrorAddNot },
  ] = useAddAdvanceNotificationMutation();

  const onSubmitUpdateStatus = async () => {
    const result = await updateAdvanceStatus({
      userId: requestedById,
      advanceId,
      statusId,
      status: status ?? currentStatus,
    });

    if ("error" in result) {
      console.log("update status error:", result.error);
      // setIsVisibleStatusError(true)
      return;
    }

    const addNotResult = await addNotification({
      userId: requestedById,
      requestedById,
      advanceId,
      screenName: "AdvanceDetails",
      screenId: advanceId,
      message: "You have update on your salary advance ",
      title: advanceTitle,
    } as any);

    if ("error" in addNotResult) {
      console.log("Adding notification error:", addNotResult.error);
      return;
    }

    console.log("Notification Added");

    if (status === "Approved") {
      const currentBalance = Number(user?.salaryAdvance ?? 0);
      const advanceAmount = Number(amount);

      if (!Number.isFinite(currentBalance) || !Number.isFinite(advanceAmount)) {
        console.error("Invalid salary advance balance or amount");
        return;
      }

      try {
        await firestore()
          .collection("users")
          .doc(user!.id)
          .update({
            salaryAdvance: currentBalance + advanceAmount,
          });
      } catch (error) {
        console.error("Updating salary advance failed:", error);
        return;
      }
    }

    disable();
    console.log("Status updated");

    // pushNotification(assignedToFcmToken, assignedToId, title, `You have assigned a new task by ${user?.fullName}`, 'TaskDetails')
  };

  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={padding}>
      <View style={{ width: "100%" }}>
        <TouchableOpacity style={styles.closeBox} onPress={onPressClose}>
          <Feather name="x" size={24} color={"black"} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Spacer height={6} />
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: COLORS.info }]}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={[
            { value: 1, label: "Pending" },
            { value: 2, label: "Approved" },
            { value: 3, label: "Rejected" },
          ]}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={statusId}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setStatus(item.label);
            setStatusId(item.value);
            setIsFocus(item);
          }}
        />
        <Spacer height={gapBetween} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <SubmitButton
          disabled={primaryButtonDisabled}
          text={buttonTitle}
          onPress={onSubmitUpdateStatus}
        />
      </View>
    </PopupModal>
  );
};

export default UpdateAdvanceStatus;

const styles = StyleSheet.create({
  closeBox: { justifyContent: "center", alignItems: "flex-end" },
  body: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
  },
  caption: {
    color: COLORS.caption,
    fontSize: 15,
  },
  dropdown: {
    width: "100%",
    borderColor: COLORS.neutral._500,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
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
  icon: {
    marginRight: 5,
  },
});
