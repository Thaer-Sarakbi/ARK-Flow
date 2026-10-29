import useDocumentPicker from "@/src/hooks/useDocumentPicker";
import { useAddAdvanceMutation } from "@/src/redux/advances";
import { useAddAdvanceNotificationMutation } from "@/src/redux/notifications";
import { useUserDataRealTimeQuery } from "@/src/redux/user";
import { COLORS } from "@/src/utils/colors";
import { pushNotification } from "@/src/utils/PushNotificationService";
import { User } from "@/src/utils/types";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Input from "../atoms/Input";
import Spacer from "../atoms/Spacer";
import SubmitButton from "../atoms/SubmitButton";
import ImagesList from "../molecules/ImagesList";

interface AddTask {
  user: User;
  setIsVisible: (isVisible: boolean) => void;
}

export default function RequestAdvanced({ setIsVisible, user }: AddTask) {
  const [addAdvance, { isLoading, isSuccess, isError }] =
    useAddAdvanceMutation();
  const [
    addNotification,
    { isLoading: isLoadingAddNot, isError: isErrorAddNot },
  ] = useAddAdvanceNotificationMutation();
  const { images, handleSelectImage, removeImage, uploadAll } =
    useDocumentPicker();
  const {
    data: requestedToData,
    isLoading: isLoadingData,
    isError: isErrorUserData,
  } = useUserDataRealTimeQuery("pJ4Mg0zvs9cTOiQKqIshWlSiSUR2");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      amount: "",
    },
    mode: "onTouched",
  });

  const handleSubmitRequestAdvanced = async () => {
    const { title, description, amount } = watch();

    const result = await addAdvance({
      title,
      description,
      requestedBy: user.fullName,
      requestedById: user.id,
      amount,
      location: user.placeName,
    } as any);

    if ("error" in result) {
      console.log("Check-in error:", result.error);
      return;
    }

    setIsVisible(false);
    console.log("Salary Advance submitted");

    if (images.length > 0) {
      await uploadAll(`users/${user.id}/advances/${result.data}/files`);
    }

    const addNotResult = await addNotification({
      requestedById: user.id,
      userId: "pJ4Mg0zvs9cTOiQKqIshWlSiSUR2",
      advanceId: result.data,
      screenName: "AdvanceDetails",
      screenId: result.data,
      message: `You have a new salary advance request from ${user.fullName}`,
      title,
    } as any);

    if ("error" in addNotResult) {
      console.log("Adding notification error:", addNotResult.error);
      return;
    }

    console.log("Notification Added");

    pushNotification(
      requestedToData?.fcmToken,
      "pJ4Mg0zvs9cTOiQKqIshWlSiSUR2",
      title,
      `You have a new pinjam by ${user?.fullName}`,
      "AdvanceDetails",
    );
  };

  const handleGallery = async () => {
    await handleSelectImage();
  };

  return (
    <KeyboardAvoidingView keyboardVerticalOffset={160}>
      <ScrollView style={{ maxHeight: 600 }}>
        <Text style={{ fontSize: 25, fontWeight: "bold", color: COLORS.title }}>
          Request Advanced
        </Text>
        <Spacer height={14} />
        <Text style={styles.title}>Title</Text>
        <Spacer height={6} />
        <Controller
          name="title"
          control={control}
          rules={{
            required: {
              value: true,
              message: "Title is required",
            },
          }}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error },
          }) => (
            <Input
              autoCapitalize="none"
              label="Task Title"
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
        <Spacer height={20} />
        <Text style={styles.title}>Description</Text>
        <Spacer height={6} />
        <Controller
          name="description"
          control={control}
          rules={{
            required: {
              value: true,
              message: "Description is required",
            },
          }}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error },
          }) => (
            <Input
              autoCapitalize="none"
              label="Description"
              borderColor={COLORS.neutral._300}
              inputColor={COLORS.title}
              labelColor={COLORS.neutral._400}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorText={error?.message}
              multiline
              numberOfLines={5}
              heightContainer={60}
              iIHeight={70}
            />
          )}
        />
        <Spacer height={20} />
        <Text style={styles.title}>Amount</Text>
        <Spacer height={6} />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Controller
            name="amount"
            control={control}
            rules={{
              required: {
                value: true,
                message: "Amount is required",
              },
            }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <Input
                autoCapitalize="none"
                label="Amount"
                borderColor={COLORS.neutral._300}
                inputColor={COLORS.title}
                labelColor={COLORS.neutral._400}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorText={error?.message}
                style={{ width: "45%" }}
                keyboardType="numeric"
              />
            )}
          />
          <Spacer width={10} />
          <Text style={styles.title}>/ RM</Text>
        </View>
        <Spacer height={20} />
        <FlatList
          data={images}
          horizontal
          nestedScrollEnabled={true}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          renderItem={({ item }) => (
            <ImagesList removeImage={removeImage} imageUri={item.uri} />
          )}
        />
        <Spacer height={10} />
        <SubmitButton
          text="Upload qr"
          mode="outlined"
          onPress={handleGallery}
        />
        <Spacer height={8} />
        <SubmitButton
          text="Request"
          onPress={handleSubmit(handleSubmitRequestAdvanced)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "bold",
    fontSize: 18,
  },
  icon: {
    marginRight: 5,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdown: {
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
  title: {
    color: COLORS.neutral._600,
    fontWeight: "400",
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
