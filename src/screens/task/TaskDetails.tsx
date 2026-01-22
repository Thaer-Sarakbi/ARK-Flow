import { COLORS } from '@/src/colors';
import AddUpdate from '@/src/components/AddUpdate';
import Separator from '@/src/components/atoms/Separator';
import Spacer from '@/src/components/atoms/Spacer';
import BoxUpload from '@/src/components/BoxUpload';
import StatusButton from '@/src/components/buttons/StatusButton';
import SubmitButton from '@/src/components/buttons/SubmitButton';
import CommentsBox from '@/src/components/CommentsBox';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import LoadingComponent from '@/src/components/LoadingComponent';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import TaskInfo from '@/src/components/TaskInfo';
import useCurrentLocation from '@/src/hooks/useCurrentLocation';
import useDocumentPicker from '@/src/hooks/useDocumentPicker';
import BottomSheet from '@/src/Modals/BottomSheet';
import ConfirmationPopup from '@/src/Modals/ConfirmationPopup';
import ErrorPopup from '@/src/Modals/ErrorPopup';
import ImageViewModal from '@/src/Modals/ImageViewModal';
import { useAddNotificationMutation, useUpdateNotificationStatusMutation } from '@/src/redux/notifications';
import { useAddTaskCommentMutation, useGetRealTaskCommentsQuery, useGetTaskRealtimeQuery, useUpdateTaskStatusMutation } from '@/src/redux/tasks';
import { useGetUpdatesRealtimeQuery } from '@/src/redux/updates';
import { useUserDataRealTimeQuery } from '@/src/redux/user';
import { MainStackParamsList } from '@/src/routes/params';
import { Update } from '@/src/utils/types';
import { getAuth } from '@react-native-firebase/auth';
import { getStorage, ref } from '@react-native-firebase/storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import MapView from 'react-native-maps';
import Timeline from 'react-native-timeline-flatlist';

interface TaskDetails {
  route: {
    params: { 
      taskId: string, 
      assignedToId: string, 
      notificationId?: string, 
      notificationStatus?: string 
    }
  }
}

const auth = getAuth();
const storage = getStorage();
type RootStackNavigationProp = StackNavigationProp<MainStackParamsList, 'TaskDetails'>;

const ListButton = ({ status, onPress }: { status: string, onPress:() => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={[styles.caption, { fontSize: 20 }]}>{status}</Text>
  </TouchableOpacity>
)

const TaskDetails = ({ route }: TaskDetails) => {
    const taskId = route.params.taskId
    const notificationId = route.params.notificationId
    const notificationStatus = route.params.notificationStatus
    const assignedToId = route.params?.assignedToId
    const mapRef = useRef<MapView | null>(null);
    const [isVisibleConfirm, setIsVisibleConfirm] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isVisibleStatus, setIsVisibleStatus] = useState(false)
    const [isVisibleStatusError, setIsVisibleStatusError] = useState(false)
    const [uploadPopupVisible, setUploadPopupVisible] = useState(false)
    const [comment, setComment] = useState('')
    const [imagesList, setImagesList] = useState<IImageInfo[]>([]);
    const [sliderimages, setSliderImages] = useState<string[]>([]);
    const [isImageViewVisible, setIsImageViewVisible] = useState<boolean>(false);
    const [index, setIndex] = useState(0);
    const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
    const navigation = useNavigation<RootStackNavigationProp>()
    // const { data: user, loading, isError: isErrorUserData } = useUserData();
    const { data: user, isLoading, isError: isErrorUserData } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null)
    const [addComment,  { isLoading: isLoadingAddComment }] = useAddTaskCommentMutation()
    const { data: comments } = useGetRealTaskCommentsQuery({ userId: assignedToId, taskId });
    // Only run task + updates queries when user.id exists
    const skipQueries = !assignedToId || !taskId;
    const { data, isLoading: isLoadingTask, isError: isErrorTask } = useGetTaskRealtimeQuery({ userId: assignedToId, taskId }, { skip: skipQueries })
    const currentStatus = data?.status;
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const { data: updatesData, isLoading: isLoadingUpdates , isError: isErrorUpdates } = useGetUpdatesRealtimeQuery({ userId: assignedToId, taskId: taskId }, { skip: skipQueries })
    const { handleDocumentSelection, handleSelectImage, handleSelectCamera, images, removeImage, documents, removeDocument, uploadAll, uploading } = useDocumentPicker()
    const  [updateTaskStatus]= useUpdateTaskStatusMutation()
    const  [updateNotificationStatus]= useUpdateNotificationStatusMutation()
    const [addNotification, { isLoading: isLoadingAddNot, isError: isErrorAddNot }] = useAddNotificationMutation()
    const { currentLocation, error: locationError, openSettings, getLocation } = useCurrentLocation(mapRef as any)
    const editUpdates = updatesData
    ?.map((update: Update) => {
      const time = moment(update.creationDate.seconds * 1000).format("MMM Do[\n]h:mm a");
      return {
        ...update,
        time,
        date: update.creationDate.seconds,
      };
    })
    ?.sort((a: any, b: any) => b.date - a.date);

    const folderPath = `users/${assignedToId}/tasks/${taskId}/files`;

    useFocusEffect(
      useCallback(() => {
        if (!notificationId || !user?.id || notificationStatus) return;
  
        updateNotificationStatus({
          userId: user?.id,
          notificationId
        });
  
      }, [notificationId, user?.id])
    );

    useEffect(() => {
      getLocation(); // fetch when screen opens
      const loadFiles = async () => {
        setIsLoadingVisible(true)
        loadAllFiles()
      };

      loadFiles()
    },[])

    async function loadAllFiles() {
      const folderRef = ref(storage, folderPath);
      const result = await folderRef.listAll();
            
      const imageUrls: string[] = [];
      const images: IImageInfo[] = [];
            
      await Promise.all(
        result.items.map(async (item) => {
          const url = await item.getDownloadURL();
          imageUrls.push(url);
          images.push({ url });
        })
      );
            
      setSliderImages(imageUrls);
      setImagesList(images);
      setIsLoadingVisible(false);
    }

    const handleCamera = async () => {
      await handleSelectCamera().then(() => {
          setUploadPopupVisible(false)
      }).catch((e) => console.log(e))
  };
  
  const handleGallery = async () => {
      await handleSelectImage().then(() => {
        setUploadPopupVisible(false)
      }).catch((e) => console.log(e))
  };
  
  const handleDocument = async () => {
      await handleDocumentSelection().then((result) => {
       setUploadPopupVisible(false)
      }).catch((e) => console.log(e))
  };

    const onSubmitComment = async () => {
      const result = await addComment({
        userId: assignedToId,
        taskId,
        comment,
        commenter: user?.fullName
      } as any)
  
      if ('error' in result) {
        console.log("Adding comment error:", result.error);
        return;
      }

      setComment('')
      Keyboard.dismiss()

      let notifyUserId: string | null = null;

      if (user?.id === data.assignedById) {
        // assignedBy commented → notify assignedTo
        notifyUserId = assignedToId;
      } else if (user?.id === assignedToId) {
        // assignedTo commented → notify assignedBy
        notifyUserId = data.assignedById;
      }
  
      if (notifyUserId && notifyUserId !== user?.id) {
        const addNotResult = await addNotification({
          userId: notifyUserId, // 🔔 receiver
          taskId,
          screenName: 'TaskDetails',
          screenId: taskId,
          message: 'Commented on task by',
          by: user?.fullName,
          title: data?.title,
          assignedToId,
          assignedById: data.assignedById,
        } as any);
  
        if ('error' in addNotResult) {
          console.log('Adding notification error:', addNotResult.error);
          return;
        }
      console.log('Notification Added')
    }
  }

  const onSubmitUpdateStatus = async () => {
    const result = await updateTaskStatus({
      userId: assignedToId,
      taskId,
      status: selectedStatus ?? currentStatus
    })

    if ('error' in result) {
      console.log("update status error:", result.error);
      setIsVisibleStatusError(true)
      return;
    }

    setIsVisibleConfirm(true)
    console.log('Status updated')
  }

    if(isLoading || (isLoadingTask && !data)) return <Loading visible={true} />
    if(isErrorUserData || isErrorTask) return <ErrorComponent />

    return (
      <>
      <Container hasInput allowBack headerMiddle='Task Details' backgroundColor={COLORS.neutral._100}>
        <Text style={styles.title}>{data?.title}</Text>
        <Spacer height={14} />
        <TaskInfo title={'Description'} value={data?.description} sliderimages={sliderimages} setIsVisible={setIsImageViewVisible} index={index} setIndex={setIndex} loadingVisible={loadingVisible} hasCarousel={false} />
        <Spacer height={10} />
        <TaskInfo title={'Assigned By'} value={data?.assignedBy}/>
        <Spacer height={10} />
        <TaskInfo title={'Assigned To'} value={data?.assignedTo}/>
        <Spacer height={10} />
        <View style={{ flexDirection: 'row' }}>
          <TaskInfo title={'Creation Date'} value={moment(data?.creationDate?.seconds * 1000).format('MMM Do YYYY, h:ss a')}/>
          <Spacer width={10} />
          <TaskInfo title={'Duration'} value={`${data?.duration} Day`}/>
        </View>
        <Spacer height={10} />
        <TaskInfo title={'Location'} value={data?.location}/>
        <Spacer height={10} />
        <View style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: 10 }}>
          <Text style={styles.title}>Status</Text>
          <Spacer height={14} />
          <StatusButton status={selectedStatus ?? currentStatus} onPress={() => user?.id === data?.assignedToId && setIsVisibleStatus(true)} />
          <Spacer height={8} />
          <SubmitButton text='Submit' onPress={onSubmitUpdateStatus} />
        </View>
        <Spacer height={10} />
        <View style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: 10 }}>
          <Text style={styles.title}>Updates</Text>
          <Spacer height={10} />
          {
            isLoadingUpdates ? <LoadingComponent /> :
            isErrorUpdates ? <ErrorComponent /> :
            editUpdates?.length === 0 ? <Text style={{ textAlign: 'center', color: COLORS.caption }}>No Updates yet!</Text> :
            <Timeline
              data={editUpdates}
              isUsingFlatlist={false}
              circleColor={COLORS.info}
              lineColor={COLORS.infoSecondary}
              separator={true}
              timeContainerStyle={{ width: 75, marginTop: 10 }}
              timeStyle={styles.time}
              onEventPress={(event: any) => {
                const update = event.data || event;
                navigation.navigate('UpdateDetails', { updateId: update.id, taskId: update.taskId, userName: user?.fullName, assignedToId: update.assignedToId, assignedById: data.assignedById, assignedBy: data.assignedBy, userId: user?.id ?? '' })
              }}                
              titleStyle={styles.titleStyle}
              descriptionStyle={styles.caption}
            />
          }
          {assignedToId === user?.id && <>
            <Spacer height={6} />
            <SubmitButton text='Add Update' onPress={() => setIsVisible(true)} />
          </>}
        </View>
        <Spacer height={10} />
        <CommentsBox comment={comment} comments={comments} setComment={setComment} onSubmitComment={onSubmitComment}/>
        <Spacer height={10} />
      </Container>
      <BottomSheet visible={isVisible} onPress={() => setIsVisible(false)}>
        <AddUpdate setIsVisible={setIsVisible} setUploadPopupVisible={setUploadPopupVisible} taskId={taskId} assignedToId={data?.assignedToId} assignedById={data?.assignedById} images={images} documents={documents} removeImage={removeImage} removeDocument={removeDocument} uploadAll={uploadAll} userId={user?.id} uploading={uploading} />
      </BottomSheet>
      <BottomSheet visible={uploadPopupVisible} onPress={() => setUploadPopupVisible(false)}>
      <View style={{ flexDirection: 'row' }}>
        <BoxUpload title='Camera' source={require("../../../assets/camera.png")} onPress={handleCamera}/>
        <Spacer width={10} />
        <BoxUpload title='Gallery' source={require("../../../assets/gallery.png")} onPress={handleGallery} />
        <Spacer width={10} />
        <BoxUpload title='Document' source={require("../../../assets/document.png")} onPress={handleDocument}/>
      </View>
    </BottomSheet>
    <BottomSheet visible={isVisibleStatus} onPress={() => setIsVisibleStatus(false)}>
      <ListButton status='Not Started' onPress={() => { setSelectedStatus('Not Started'); setIsVisibleStatus(false)}}/>
      <Separator marginVertical={10} />
      <ListButton status='In Progress' onPress={() => { setSelectedStatus('In Progress'); setIsVisibleStatus(false)}}/>
      <Separator marginVertical={10} />
      <ListButton status='Completed' onPress={() => { setSelectedStatus('Completed'); setIsVisibleStatus(false)}}/>
    </BottomSheet>
    <ConfirmationPopup 
      isVisible={isVisibleConfirm} 
      title="Submitted Successfully" 
      paragraph1="Task Status Updated"
      onPressClose={() => setIsVisibleConfirm(false)} 
      buttonTitle="Okay" 
      icon={<Image style={{ width: 50, height: 50 }} source={require('../../../assets/icons/Success.png')} />} 
      onPress={() => setIsVisibleConfirm(false)} 
    />
    <ErrorPopup 
      isVisible={isVisibleStatusError} 
      title="Error"
      icon={<Image style={{ width: 50, height: 50 }} source={require('../../../assets/icons/Cancel.png')} />}
      description={"Smoething went wrong \n try again later"}
      onPress={() => setIsVisibleStatusError(false)}
      onPressClose={() => setIsVisibleStatusError(false)}
    />  
    <ImageViewModal index={index} visible={isImageViewVisible} images={imagesList} setIsVisible={setIsImageViewVisible} />
    </>
    )
}

const styles = StyleSheet.create({ 
    title: {
        fontWeight: 'bold',
        fontSize: 25,
        color: COLORS.title
      },
    caption: {
      color: COLORS.caption,
      fontSize: 15
    },
    titleStyle: { 
      fontWeight: 'bold', 
      color: COLORS.title, 
      fontSize: 18 
    },
    time: { 
      textAlign: 'center', 
      backgroundColor: COLORS.infoSecondary, 
      color:'white', 
      padding: 6, 
      borderRadius:13
    }
});

export default TaskDetails