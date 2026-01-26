import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { COLORS } from '../colors';
import Spacer from '../components/atoms/Spacer';
import SubmitButton from '../components/buttons/SubmitButton';
import { useAddNotificationMutation } from '../redux/notifications';
import { useAddTaskMutation, useDeleteTaskMutation } from '../redux/tasks';
import { useGetUsersRealtimeQuery } from '../redux/user';
import { pushNotification } from '../utils/PushNotificationService';
import { Task } from '../utils/types';
import ErrorPopup from './ErrorPopup';
import PopupModal from './PopupModal';

/**
 * Popup modal props
 */
export interface ChangeAssignToPopup {
  isVisible: boolean;
  icon?: React.ReactNode;
  title: string;
  paragraph1?: string;
  buttonTitle?: string;
  onPressClose: () => void;
  gapBetween?: number;
  padding?: number;
  assignedToId: string;
  taskId: string
  task: Task
}

const ChangeAssignToPopup = ({isVisible = false, assignedToId, taskId, gapBetween = 16, buttonTitle = 'Done', icon, title, paragraph1, padding = 16, task, onPressClose }: ChangeAssignToPopup) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation()
  const [newAssignedToId, setNewAssignedToId] = useState<string>('');
  const [newAssignedToName, setNewAssignedToName] = useState<string>('');
  const [assignedToFcmToken, setAssignedToFcmToken] = useState('');
  const [isFocus, setIsFocus] = useState(false)
  const [isVisibleeDeleteError, setIsVisibleDeleteError] = useState(false)
  const { data: listOfUsers, isLoading: isLoadingUsers, isError }= useGetUsersRealtimeQuery()
  const [addNotification, { isLoading: isLoadingAddNot, isError: isErrorAddNot }] = useAddNotificationMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [addTask] = useAddTaskMutation()

  useEffect(() => {
    if (isVisible) {
      setNewAssignedToId(assignedToId)
    }
  }, [isVisible])

  const dropdownData = useMemo(() => {
    if (!listOfUsers) return [];
    return listOfUsers.map(item => ({
      value: item.id,
      label: item.name,
      fcmToken: item.fcmToken
    }));
  }, [listOfUsers]);

  const onPress = async () => {
    if(assignedToId === newAssignedToId){
      onPressClose()
    } else {
    const result = await deleteTask({
      userId: assignedToId,
      taskId,
    })

    if ('error' in result) {
      console.log("delete status error:", result.error);
      setIsVisibleDeleteError(true)
      return;
    }

    console.log('Deleted Successfully')

    const addTaskResult = await addTask({ 
      title: task?.title, 
      description: task?.description, 
      assignedBy: task.assignedBy, 
      assignedById:  task.assignedById,
      assignedTo: newAssignedToName, 
      assignedToId: newAssignedToId, 
      duration: task?.duration, 
      location : task?.location
    } as any)

    console.log('Added successfully')

    const addNotResult = await addNotification({
      userId: newAssignedToId,
      taskId: addTaskResult.data,
      screenName: 'TaskDetails',
      screenId: addTaskResult.data,
      message: 'You have assigned a new task by ',
      by: task.assignedBy, 
      title,
      assignedToId: newAssignedToId,
      assignedById: task.assignedById
    } as any)

    if ('error' in addNotResult) {
      console.log("Adding notification error:", addNotResult.error);
      return;
    }

    console.log('Notification Added')
    if (assignedToFcmToken) {
      pushNotification(assignedToFcmToken, newAssignedToId, title, task.assignedBy, 'TaskDetails')
    }

    navigation.goBack()
    onPressClose()
   }
  }
  
  return (
    <PopupModal isVisible={isVisible} width={width - 32} padding={padding}>
        <View style={{ width: '100%'}}>
          <TouchableOpacity style={styles.closeBox} onPress={onPressClose} >
              <Feather name="x" size={24} color={'black'} />
          </TouchableOpacity>
        </View>
      <View style={styles.body}>
      {icon}
      <Text style={styles.title}>{title}</Text>
      {paragraph1 && <Spacer height={16} />}
      {paragraph1 && <Text style={styles.caption}>{paragraph1}</Text>}
      <Spacer height={6} />
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
        value={newAssignedToId}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setNewAssignedToName(item.label)
          setNewAssignedToId(item.value)
          setAssignedToFcmToken(item.fcmToken)
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
      <Spacer height={gapBetween} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SubmitButton text={buttonTitle} onPress={onPress} />
      </View>
      <ErrorPopup 
        isVisible={isVisibleeDeleteError} 
        title="Error"
        icon={<Image style={{ width: 50, height: 50 }} source={require('../../assets/icons/Cancel.png')} />}
        description={"Smoething went wrong \n try again later"}
        onPress={() => setIsVisibleDeleteError(false)}
        onPressClose={() => setIsVisibleDeleteError(false)}
      /> 
    </PopupModal>
  )
}

export default ChangeAssignToPopup

const styles = StyleSheet.create({
  closeBox: { justifyContent: 'center', alignItems: 'flex-end' },
  body: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  caption: {
    color: COLORS.caption,
    fontSize: 15
  },
  dropdown: {
    width: '100%',
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 5,
  },

})