import Feather from "@expo/vector-icons/Feather";
import { getAuth } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Input from "../components/atoms/Input";
import Spacer from "../components/atoms/Spacer";
import SubmitButton from "../components/atoms/SubmitButton";
import { useUpdateAdvanceBalanceMutation } from "../redux/advances";
import { useUserDataRealTimeQuery } from "../redux/user";
import { COLORS } from "../utils/colors";
import PopupModal from "./PopupModal";

/**
 * Popup modal props
 */
export interface UpdateAdvancedBalanceProps {
  isVisible: boolean;
  title: string;
  paragraph1?: string;
  paragraph2?: string;
  buttonTitle?: string;
  onPress?: () => void;
  onPressClose?: () => void;
  gapBetween?: number;
  padding?: number;
  id: string | undefined;
  disable: any;
  enableCloseIcone?: boolean;
  data: string;
  value: number | undefined;
  setUpdate: (data: number) => void;
  placeholder: string;
  balance: number;
}

const auth = getAuth();
const UpdateAdvancedBalance = ({
  isVisible = false,
  id,
  balance,
  disable,
  enableCloseIcone = true,
  gapBetween = 16,
  buttonTitle = "Done",
  title,
  paragraph1,
  paragraph2,
  padding = 16,
  placeholder,
}: UpdateAdvancedBalanceProps) => {
  const { width } = useWindowDimensions();

  const [updatedBalance, setUpdatedBalance] = useState(String(balance ?? ""));
  const [isSaving, setIsSaving] = useState(false);

  const [updateAdvanceBalance] = useUpdateAdvanceBalanceMutation();

  const { data: user } = useUserDataRealTimeQuery(
    auth.currentUser?.uid ?? null,
  );

  useEffect(() => {
    if (isVisible) {
      setUpdatedBalance(String(balance ?? ""));
    }
  }, [balance, isVisible]);

  const onPress = async () => {
    const normalizedBalance = updatedBalance.trim();
    const numericBalance = Number(normalizedBalance);

    if (normalizedBalance === "" || !Number.isFinite(numericBalance)) {
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    try {
      const result = await updateAdvanceBalance({
        updatedBalance: numericBalance,
        id,
      });

      if ("error" in result) {
        console.error("Update balance error:", result.error);
        return;
      }

      try {
        await firestore()
          .collection("users")
          .doc(id)
          .collection("balanceHistory")
          .add({
            creationDate: firestore.FieldValue.serverTimestamp(),
            balance: numericBalance,
            updatedBy: user?.fullName ?? null,
          });
      } catch (error) {
        console.error("Balance history error:", error);

        // The balance update may already have succeeded.
        // Do not blindly retry the entire operation.
        return;
      }

      disable();
    } catch (error) {
      console.error("Unexpected balance update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={padding}>
      <View style={styles.body}>
        {enableCloseIcone && (
          <View style={{ width: "100%" }}>
            <TouchableOpacity
              style={styles.closeBox}
              onPress={() => {
                if (!isSaving) disable();
              }}
              disabled={isSaving}
            >
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.title}>{title}</Text>

        {paragraph1 && <Spacer height={16} />}
        {paragraph1 && <Text style={styles.caption}>{paragraph1}</Text>}

        {paragraph2 && <Spacer height={2} />}
        {paragraph2 && <Text style={styles.caption}>{paragraph2}</Text>}

        <Spacer height={6} />

        <Input
          label={updatedBalance === "" ? placeholder : ""}
          borderColor={COLORS.neutral._300}
          inputColor={COLORS.title}
          labelColor={COLORS.neutral._400}
          value={updatedBalance}
          onChangeText={setUpdatedBalance}
        />

        <Spacer height={gapBetween} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <SubmitButton
          text={isSaving ? "Saving..." : buttonTitle}
          onPress={onPress}
        />
      </View>
    </PopupModal>
  );
};

export default UpdateAdvancedBalance;

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
