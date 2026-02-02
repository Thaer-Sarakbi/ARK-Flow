import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import SubmitButton from '@/src/components/buttons/SubmitButton';
import CarouselSlider from '@/src/components/CarouselSlider';
import CommentsBox from '@/src/components/CommentsBox';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import LoadingComponent from '@/src/components/LoadingComponent';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import MapViewComponent from '@/src/components/molecule/MapViewComponent';
import TaskCard from '@/src/components/TaskCard';
import ConfirmationPopup from '@/src/Modals/ConfirmationPopup';
import ImageViewModal from '@/src/Modals/ImageViewModal';
import { useAddNotificationMutation, useUpdateNotificationStatusMutation } from '@/src/redux/notifications';
import { setLoading } from '@/src/redux/slices/uiSlice';
import { useGetTaskQuery } from '@/src/redux/tasks';
import { useAddUpdateCommentMutation, useDeleteUpdateMutation, useGetRealUpdateCommentsQuery, useGetUpdateQuery } from '@/src/redux/updates';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import { getAuth } from '@react-native-firebase/auth';
import { getStorage, ref } from '@react-native-firebase/storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import FileViewer from "react-native-file-viewer";
import RNFS from 'react-native-fs';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import { useDispatch } from 'react-redux';
import { RootStackNavigationProp } from '../bottomNav/CalendarScreen';

interface UpdateDetails {
  route: {
    params: {
      userName: string | undefined
      userId: string
      taskId: string
      updateId: string,
      assignedToId: string
      assignedById: string
      notificationStatus: string
      notificationId: string
    }
  }
}
const auth = getAuth();
const storage = getStorage();

export default function UpdateDetails({ route }: UpdateDetails) {
  const taskId = route.params.taskId
  const updateId = route.params.updateId
  const userId = route.params.userId
  const userName = route.params.userName
  const assignedToId = route.params.assignedToId
  const assignedById = route.params.assignedById
  const notificationId = route.params.notificationId
  const notificationStatus = route.params.notificationStatus

  const navigation = useNavigation<RootStackNavigationProp>()
  const dispatch = useDispatch();
  const skipQueries = !assignedToId || !taskId || !updateId;
  const { data: update, isLoading: isLoadingUpdate, isError: isErrorUpdate  } = useGetUpdateQuery({ userId: assignedToId, taskId, updateId }, { skip: skipQueries })
  const { data: task, isLoading: isLoadingTask, isError: isErrorTask } = useGetTaskQuery({ userId: assignedToId, taskId }, { skip: skipQueries })
  const {data} = useGetRealUpdateCommentsQuery({  userId: assignedToId, taskId, updateId }, { skip: skipQueries })
  const [addComment, { isLoading: isLoadingAddComment }] = useAddUpdateCommentMutation()
  const  [updateNotificationStatus]= useUpdateNotificationStatusMutation()
  const [deleteUpdate] = useDeleteUpdateMutation()
  const [addNotification, { isLoading: isLoadingAddNot, isError: isErrorAddNot }] = useAddNotificationMutation()
  const [sliderimages, setSliderImages] = useState<string[]>([]);
  const [visible, setIsVisible] = useState<boolean>(false);
  const [isVisibleConfirmDelete, setIsVisibleConfirmDelete] = useState(false)
  const [isVisibleeDeleteError, setIsVisibleDeleteError] = useState(false)
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<IImageInfo[]>([]);
  const [pdf, setPdf] = useState<{uri: string}[]>([]);
  const [comment, setComment] = useState('')

  const folderPath = `users/${assignedToId}/tasks/${taskId}/updates/${updateId}/files`;

  async function loadAllFiles() {
    const folderRef = ref(storage, folderPath);
    const result = await folderRef.listAll();
    
    const imageUrls: string[] = [];
    const images: IImageInfo[] = [];
    const pdfs: { uri: string }[] = [];
    
    await Promise.all(
      result.items.map(async (item) => {
        const url = await item.getDownloadURL();
        if (item.name.toLowerCase().endsWith(".pdf")) {
          pdfs.push({ uri: url });
        } else {
          imageUrls.push(url);
          images.push({ url });
        }
      })
    );
    
    setSliderImages(imageUrls);
    setImages(images);
    setPdf(pdfs);
    setIsLoadingVisible(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (!notificationId || !userId || notificationStatus) return;
    
      updateNotificationStatus({
        userId,
        notificationId
      });
    
    }, [notificationId, userId])
  );

  useEffect(() => {
    if (!userId || !taskId || !updateId) return;
  
    const loadFiles = async () => {

      try {
        setIsLoadingVisible(true)
        await loadAllFiles()
      } catch (e) {
        console.error('Failed to load files', e)
      } finally {
        setIsLoadingVisible(false)
      }
    };
  
    loadFiles();
  }, [userId, taskId, updateId]);

  useEffect(() => {
    dispatch(setLoading(isLoadingAddComment));
  },[isLoadingAddComment])

    const openPdf = async (filePath: string) => {
      setIsLoadingVisible(true) 
      try {
        const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.pdf`;
  
        const options = {
          fromUrl: filePath,
          toFile: localFile,
        };
        await RNFS.downloadFile(options).promise.then(() => FileViewer.open(localFile))
      } catch (error) {
        console.error('Error sharing PDF:', error);
      } finally {
        setIsLoadingVisible(false) 
      }
    };

  const onSubmitComment = async () => {
    const result = await addComment({
      userId: assignedToId,
      taskId,
      updateId,
      comment,
      commenter: userName
    } as any)

    if ('error' in result) {
      console.log("Adding update error:", result.error);
      return;
    }
      
    let notifyUserId: string | null = null;

    if (userId === assignedById) {
      // assignedBy commented → notify assignedTo
      notifyUserId = assignedToId;
    } else if (userId === assignedToId) {
      // assignedTo commented → notify assignedBy
      notifyUserId = assignedById;
    }

    if (notifyUserId && notifyUserId !== userId) {
      const addNotResult = await addNotification({
        userId: notifyUserId, // 🔔 receiver
        taskId,
        screenName: 'UpdateDetails',
        screenId: updateId,
        message: 'Commented on your update by',
        by: userName,
        title: update.title,
        assignedToId,
        assignedById,
      } as any);

      if ('error' in addNotResult) {
        console.log('Adding notification error:', addNotResult.error);
        return;
      }

      console.log('Notification Added');
    }

    setComment('')
    Keyboard.dismiss()
  }

  const onDeleteUpdate = async () => {
    const result = await deleteUpdate({
      userId: assignedToId,
      taskId,
      updateId,
      date: moment(update.creationDate).format("DD-MM-YYYY")
    })

    if ('error' in result) {
      console.log("delete status error:", result.error);
      setIsVisibleDeleteError(true)
      return;
    }

    navigation.goBack()
    setIsVisibleConfirmDelete(false)
    console.log('update deleted')
  }

  if (isLoadingUpdate || isLoadingTask) return <Loading visible={true} />
  if (isErrorUpdate || isErrorTask) return <ErrorComponent />
  
  return (
   <>
   <Container hasInput headerMiddle='Update Details' backgroundColor={COLORS.neutral._100} allowBack rightHeader={auth.currentUser?.uid === assignedToId && <TouchableOpacity onPress={() => setIsVisibleConfirmDelete(true)}><Feather name="trash-2" size={24} color={COLORS.white} /></TouchableOpacity>}>
      <Text style={styles.title}>{update.title}</Text>
      <Text style={styles.caption}>{update.description}</Text>
      {loadingVisible && <LoadingComponent />}
      {sliderimages.length > 0 && (<>
        <Spacer height={30} />
        <Text style={styles.title}>Images:</Text>
        <Spacer height={6} />
        <TouchableHighlight onPress={() => setIsVisible(true)}>
          <CarouselSlider index={index} images={sliderimages} setIndex={setIndex}/>
        </TouchableHighlight>
        <Spacer height={60}/>
      </>)}
      {pdf.length > 0 && (<><Text style={styles.title}>Documents:</Text>
      <Spacer height={6} />
      {
        pdf.map((pdfFile, i) => {
          return(
            <View key={i}>
              <TouchableOpacity style={styles.pdfContainer} key={i} onPress={() => openPdf(pdfFile.uri)}>
                <Text>File {i + 1}</Text>
                 <Entypo name="chevron-small-right" size={24} color="black" />
              </TouchableOpacity>
              <Spacer height={6} />
            </View>
          )
        })
      }
      <Spacer height={30} /></>)}
      <MapViewComponent longitude={update.longitude} latitude={update.latitude}/>
      <Spacer height={10} />
      <Text style={styles.title}>Task:</Text>
      <TaskCard taskId={taskId} title={task.title} assignedTo={task.assignedTo} location={task.location} status={task.status} duration={task.duration} creationDate={task.creationDate} assignedToId={task.assignedToId}/>
      <Spacer height={16} />
      <CommentsBox comment={comment} comments={data} setComment={setComment} onSubmitComment={onSubmitComment}/>
     <ImageViewModal index={index} visible={visible} images={images} setIsVisible={setIsVisible} />
    </Container>
    <ConfirmationPopup 
      isVisible={isVisibleConfirmDelete} 
      title="Confirm" 
      paragraph1="Are you sure you want to delete this update"
      onPressClose={() => setIsVisibleConfirmDelete(false)} 
      buttonTitle="Yes" 
      extraButton={<SubmitButton text="No" mode='outlined' onPress={() => setIsVisibleConfirmDelete(false)}/>} 
      onPress={onDeleteUpdate} 
    />
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
    pdfContainer: { 
      backgroundColor: COLORS.neutral._400, 
      padding: 10, 
      borderRadius: 8, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }
});
