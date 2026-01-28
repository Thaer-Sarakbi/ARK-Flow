import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import SubmitButton from '@/src/components/buttons/SubmitButton';
import CarouselSlider from '@/src/components/CarouselSlider';
import Container from '@/src/components/Container';
import LoadingComponent from '@/src/components/LoadingComponent';
import ConfirmationPopup from '@/src/Modals/ConfirmationPopup';
import ErrorPopup from '@/src/Modals/ErrorPopup';
import ImageViewModal from '@/src/Modals/ImageViewModal';
import { useDeleteLeaveMutation } from '@/src/redux/attendance';
import { Report } from '@/src/utils/types';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import { getStorage, ref } from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import FileViewer from "react-native-file-viewer";
import RNFS from 'react-native-fs';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import { RootStackNavigationProp } from '../bottomNav/CalendarScreen';

interface LeaveDetails {
  route: {
    params: {
      date: string,
      leave: Report,
      userId: string
    }
  }
}

const storage = getStorage();

export default function LeaveDetails({ route }: LeaveDetails) {
  const date = route.params.date
  const leaveData = route.params.leave
  const userId = route.params.userId
  const [isVisibleConfirmDelete, setIsVisibleConfirmDelete] = useState(false)
  const [isVisibleeDeleteError, setIsVisibleDeleteError] = useState(false)
  const [visible, setIsVisible] = useState<boolean>(false);
  const [sliderimages, setSliderImages] = useState<string[]>([]);
  const [images, setImages] = useState<IImageInfo[]>([]);
  const [index, setIndex] = useState(0);
  const [pdf, setPdf] = useState<{uri: string}[]>([]);
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
  const [deleteLeave] = useDeleteLeaveMutation()
  const navigation = useNavigation<RootStackNavigationProp>()

  const folderPath = `users/${userId}/attendance/${date}/leave/today/files`;

  // async function getSliderFiles(userId: string, date: string) {

  //   //const result = await storage().ref(folderPath).listAll();
  //   const folderRef = ref(storage, folderPath);
  //   const result = await folderRef.listAll();

  //   const files = await Promise.all(
  //     result.items
  //       .filter(item => !item.name.toLowerCase().endsWith(".pdf")) // exclude PDFs
  //       .map(async (item) => {
  //         const url = await item.getDownloadURL();
  //         return url;
  //       })
  //   );
  //   return files;
  // }

  // async function getFiles(userId: string, date: string) {
  //   // const folderPath = `users/${userId}/attendance/${date}/leave/today/files`;
  //   //const result = await storage().ref(folderPath).listAll();
  //   const folderRef = ref(storage, folderPath);
  //   const result = await folderRef.listAll();
      
  //   // result.items = list of files
  //   const files = await Promise.all(
  //     result.items.map(async (item) => {
  //       const url = await item.getDownloadURL();
  //       return (
  //           {url}
  //       )
  //     })
  //   );
  //   return files;
  // }

  // async function getPdf(userId: string, date: string) {
  //   //const result = await storage().ref(folderPath).listAll();
  //   const folderRef = ref(storage, folderPath);
  //   const result = await folderRef.listAll();
    
  //   // result.items = list of files
  //   const files = await Promise.all(
  //     result.items
  //       .filter(item => item.name.toLowerCase().endsWith(".pdf")) // exclude PDFs
  //       .map(async (item) => {
  //         const url = await item.getDownloadURL();
  //         return { uri: url };
  //       })
  //   );

  //   return files;
  // }
  
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
    if (!userId) return;
  
    const loadFiles = async () => {
      setIsLoadingVisible(true)
      loadAllFiles()
    };
  
    loadFiles();
  }, [userId, date]);

    const openPdf = async (filePath: string, fileName: string) => {
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

    const onDeleteTask = async () => {
      const result = await deleteLeave({
        userId,
        date,
      })
  
      if ('error' in result) {
        console.log("delete status error:", result.error);
        setIsVisibleDeleteError(true)
        return;
      }
  
      navigation.goBack()
      setIsVisibleConfirmDelete(false)
      console.log('report deleted')
    }

  return (
    <>
    <Container allowBack headerMiddle='Leave Details' backgroundColor={COLORS.neutral._100} rightHeader={<TouchableOpacity onPress={() => setIsVisibleConfirmDelete(true)}><Feather name="trash-2" size={24} color={COLORS.white} /></TouchableOpacity>}>
      <Text style={styles.title}>Description:</Text>
      <Spacer height={4} />
      <Text style={styles.caption}>{leaveData.note}</Text>
      <Spacer height={16} />
      {loadingVisible && <LoadingComponent />}
      {sliderimages.length > 0 && (<>
        <Text style={styles.title}>Images:</Text>
        <Spacer height={6} />
        <TouchableHighlight onPress={() => setIsVisible(true)}>
          <CarouselSlider index={index} images={sliderimages} setIndex={setIndex}/>
        </TouchableHighlight>
        <Spacer height={10}/>
      </>)}
      {pdf.length > 0 && (<><Text style={styles.title}>Documents:</Text>
      <Spacer height={6} />
      {
        pdf.map((pdfFile, i) => {
          return(
            <View key={i}>
              <TouchableOpacity style={styles.pdfContainer} key={i} onPress={() => openPdf(pdfFile.uri, `File:_${i + 1}`)}>
                <Text>File {i + 1}</Text>
                 <Entypo name="chevron-small-right" size={24} color="black" />
              </TouchableOpacity>
              <Spacer height={6} />
            </View>
          )
        })
      }
      <Spacer height={30} /></>)}
      <ImageViewModal index={index} visible={visible} images={images} setIsVisible={setIsVisible} />
    </Container>
    <ConfirmationPopup 
      isVisible={isVisibleConfirmDelete} 
      title="Confirm" 
      paragraph1="Are you sure you want to delete this report"
      onPressClose={() => setIsVisibleConfirmDelete(false)} 
      buttonTitle="Yes" 
      extraButton={<SubmitButton text="No" mode='outlined' onPress={() => setIsVisibleConfirmDelete(false)}/>} 
      onPress={onDeleteTask} 
    />
    <ErrorPopup 
      isVisible={isVisibleeDeleteError} 
      title="Error"
      icon={<Image style={{ width: 50, height: 50 }} source={require('../../../assets/icons/Cancel.png')} />}
      description={"Smoething went wrong \n try again later"}
      onPress={() => setIsVisibleDeleteError(false)}
      onPressClose={() => setIsVisibleDeleteError(false)}
    /> 
    </>
  );
}

const styles = StyleSheet.create({
  caption: {
       color: COLORS.caption,
       fontSize: 15
     },
     title: {
      fontWeight: 'bold',
      fontSize: 20,
    },
    pdfContainer: { 
      backgroundColor: COLORS.neutral._400, 
      padding: 10, 
      borderRadius: 8, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }
})