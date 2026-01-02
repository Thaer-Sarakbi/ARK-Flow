import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { COLORS } from "../colors";
import { useAddNotificationMutation } from "../redux/notifications";
import { useAddTaskMutation } from "../redux/tasks";
import { User } from "../utils/types";
import Input from "./Input";
import Spacer from "./atoms/Spacer";
import SubmitButton from "./buttons/SubmitButton";

interface AddTask {
  user: User,
  listOfUsers: { label: string, value: string }[], 
  setIsVisible: (isVisible: boolean) => void
}

export default function AddTask({ listOfUsers, setIsVisible, user }: AddTask) {
  const [value, setValue] = useState<string | undefined>();
  const [assignedToId, setAssignedToId] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [addTask, { isLoading, isSuccess, isError }] = useAddTaskMutation()
  const [addNotification, { isLoading: isLoadingAddNot, isError: isErrorAddNot }] = useAddNotificationMutation()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignTo: "",
      duration: "",
      location: ""
    },
    mode: 'onTouched',
  })

  const handleSubmitLogin = async () => {
    const { title, description, duration, location } = watch()

    const result = await addTask({ 
        title, 
        description, 
        assignedBy: user.profile.fullName, 
        assignedById: user.id,
        assignedTo: value, 
        assignedToId: assignedToId, 
        duration, 
        location 
      } as any)
    
    if ('error' in result) {
      console.log("Check-in error:", result.error);
      return;
    }

    setIsVisible(false)
    console.log("Adding task success");

    const addNotResult = await addNotification({
      userId: assignedToId,
      taskId: result.data,
      screenName: 'TaskDetails',
      screenId: result.data,
      message: 'You have assigned a new task by by',
      by: user.profile.fullName,
      title,
      assignedToId,
      assignedById: user.id
    } as any)

    if ('error' in result) {
      console.log("Adding notification error:", addNotResult.error);
      return;
    }

    console.log('Notification Added')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
    <ScrollView style={{ maxHeight: 600 }}>
      <Text style={{ fontSize: 25, fontWeight: 'bold', color: COLORS.title }}>Assign Task</Text>
      <Spacer height={14} />
      <Text style={styles.title}>Title</Text>
      <Spacer height={6} />
      <Controller
        name="title"
        control={control}
        rules={{
            required: {
              value: true,
              message: 'Title is required'
            }
          }}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
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
            message: 'Description is required'
          }
        }}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
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
      <Text style={styles.title}>Assign To</Text>
      <Spacer height={6} />
      <Controller
        name="assignTo"
        control={control}
        rules={{
          required: {
            value: true,
            message: 'This field is required'
          }
        }}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
        <>
          <Dropdown      
            style={[styles.dropdown, isFocus && { borderColor: COLORS.info }, error && { borderColor: COLORS.danger }]}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={listOfUsers}
            search
            maxHeight={250}
            labelField="label"
            valueField="value"
            searchPlaceholder="Search..."
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={onBlur}
            onChange={(item) => {
                setValue(item.label)
                setAssignedToId(item.value)
                onChange(item)
            }}
            renderLeftIcon={() => (
              <Ionicons
                style={styles.icon}
                name="person-outline"
                size={16}
              />
            )}
          />
          <Spacer height={6} />
          {error && <Text style={{ fontWeight: 'regular', fontSize: 12, color: COLORS.danger }}>{error.message}</Text>}
          </>
        )}
      />
      <Spacer height={20} />
      <Text style={styles.title}>Duration</Text>
      <Spacer height={6} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Controller
            name="duration"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Duration is required'
              }
            }}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
            <Input 
                autoCapitalize="none"
                label="Duration" 
                borderColor={COLORS.neutral._300} 
                inputColor={COLORS.title} 
                labelColor={COLORS.neutral._400} 
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorText={error?.message}
                style={{ width: '45%' }}
                keyboardType='numeric'
            />
            )}
        />
        <Spacer width={10} />
        <Text style={styles.title}>Days</Text>
      </View>
      <Spacer height={20} />
      <Text style={styles.title}>Location</Text>
      <Spacer height={6} />
      <Controller
        name="location"
        control={control}
        rules={{
          required: {
            value: true,
            message: 'Location is required'
          }
        }}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
          <Input 
            autoCapitalize="none"
            label="Location" 
            borderColor={COLORS.neutral._300} 
            inputColor={COLORS.title} 
            labelColor={COLORS.neutral._400} 
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            errorText={error?.message}
            style={{ width: '45%' }}
          />
        )}
      />
      <Spacer height={20} />
      <SubmitButton text="Assign" onPress={handleSubmit(handleSubmitLogin)}/>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    text: {
      fontWeight: 'bold',
      fontSize: 18
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
      paddingVertical: 12
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
      fontWeight: '400',
      fontSize: 16
    }
});
