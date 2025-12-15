import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import CarouselSlider from '@/src/components/CarouselSlider';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import LoadingComponent from '@/src/components/LoadingComponent';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import MapViewComponent from '@/src/components/molecule/MapViewComponent';
import TaskCard from '@/src/components/TaskCard';
import ImageViewModal from '@/src/Modals/ImageViewModal';
import { setLoading } from '@/src/redux/slices/uiSlice';
import { useAddCommentMutation, useGetCommentsQuery, useGetTaskQuery, useGetUpdateQuery, useLazyGetCommentsQuery } from '@/src/redux/tasks';
import { Comment } from '@/src/utils/types';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getStorage, ref } from '@react-native-firebase/storage';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import FileViewer from "react-native-file-viewer";
import RNFS from 'react-native-fs';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import { useDispatch } from 'react-redux';

interface UpdateDetails {
  route: {
    params: {
      userName: string
      userId: string
      taskId: string
      updateId: string
    }
  }
}
const storage = getStorage();

export default function UpdateDetails({ route }: UpdateDetails) {
  const taskId = route.params.taskId
  const updateId = route.params.updateId
  const userId = route.params.userId
  const userName = route.params.userName

  const dispatch = useDispatch();
  const skipQueries = !userId || !taskId || !updateId;
  const { data: update, isLoading: isLoadingUpdate  } = useGetUpdateQuery({ userId, taskId, updateId })
  const { data: task, isLoading: isLoadingTask, isError: isErrorTask } = useGetTaskQuery({ userId, taskId }, { skip: skipQueries })
  const { data, isLoading, isError } = useGetCommentsQuery({ userId, taskId, updateId })
  const [addComment, { isLoading: isLoadingAddComment }] = useAddCommentMutation()
  const [getComments, { isLoading: isLoadingGetComments, isError: isErrorGetComments }] = useLazyGetCommentsQuery()
  const [sliderimages, setSliderImages] = useState<string[]>([]);
  const [visible, setIsVisible] = useState<boolean>(false);
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<IImageInfo[]>([]);
  const [pdf, setPdf] = useState<{uri: string}[]>([]);
  const [comment, setComment] = useState('')

  const folderPath = `users/${userId}/tasks/${taskId}/updates/${updateId}/files`;

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

  useEffect(() => {
    if (!userId || !taskId || !updateId) return;
  
    const loadFiles = async () => {
      setIsLoadingVisible(true)
      loadAllFiles()
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
      userId,
      taskId,
      updateId,
      comment,
      commenter: userName
    } as any)

    if ('error' in result) {
      console.log("Adding update error:", result.error);
      return;
    }

    setComment('')
    await getComments({ userId, taskId, updateId })
    Keyboard.dismiss()
  }

  const isCommentValid = comment.trim().length > 0;

  if (isLoadingUpdate || isLoadingTask || !update || !task) return <Loading visible={true} />

  return (
   <Container hasInput headerMiddle='Update Details' backgroundColor={COLORS.neutral._100} allowBack>
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
      <TaskCard taskId={taskId} title={task.title} assignedTo={task.assignedTo} location={task.location} status={task.status} duration={task.duration} creationDate={task.creationDate} />
      <Spacer height={12} />
      <Text style={styles.title}>Comments:</Text>
      <Spacer height={6} />
      {
        isLoading || isLoadingGetComments ? <LoadingComponent /> :
        isError || isErrorGetComments ? <ErrorComponent /> :
        data.map((comment: Comment) => {
            return(
                <View key={comment.id}>
                  <View style={{ backgroundColor: COLORS.white, padding: 8, borderRadius: 8 }}>
                    <Text style={[styles.title, { fontSize: 19, fontWeight: '500' }]}>{comment.commenter}</Text>
                    <Text style={styles.caption}>{comment.comment}</Text>
                  </View>
                  <Spacer height={8} />
                </View>
            )
        })
      }
      <Spacer height={80}/>
      <View style={styles.commentContainer}>
       <TextInput
         value={comment}
         onChangeText={(text) => setComment(text)}
         onSubmitEditing={Keyboard.dismiss}
         style={styles.input}
       />
       <TouchableOpacity 
        onPress={isCommentValid ? onSubmitComment : undefined}
         style={{ backgroundColor: COLORS.primary, borderRadius: 50, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
       >
         <Ionicons name="send-outline" size={25} color={'white'}  />
       </TouchableOpacity>
     </View>
     <ImageViewModal index={index} visible={visible} images={images} setIsVisible={setIsVisible} />
    </Container>
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
    commentContainer: { 
      flex: 1,
      position: 'absolute', 
      bottom: 0, 
      width: '100%', 
      borderRadius: 8,
      backgroundColor: COLORS.neutral._400, 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingLeft: 10, 
      paddingRight: 5 
    },
    input: { 
      flex: 1, 
      backgroundColor: 'white', 
      padding: 10,
      borderRadius: 10, 
      marginVertical: 5, 
      marginRight: 5, 
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
