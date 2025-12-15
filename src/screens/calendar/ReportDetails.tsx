import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import CarouselSlider from '@/src/components/CarouselSlider';
import Container from '@/src/components/Container';
import LoadingComponent from '@/src/components/LoadingComponent';
import ImageViewModal from '@/src/Modals/ImageViewModal';
import { Report } from '@/src/utils/types';
import Entypo from '@expo/vector-icons/Entypo';
import { getStorage, ref } from '@react-native-firebase/storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import FileViewer from "react-native-file-viewer";
import RNFS from 'react-native-fs';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';

interface ReportDetails {
  route: {
    params: {
      date: string,
      report: Report,
      userId: string
    }
  }
}

const storage = getStorage();

export default function ReportDetails({ route }: ReportDetails) {
  const date = route.params.date
  const reportData = route.params.report
  const userId = route.params.userId
  const [visible, setIsVisible] = useState<boolean>(false);
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
  const [sliderimages, setSliderImages] = useState<string[]>([]);
  const [images, setImages] = useState<IImageInfo[]>([]);
  const [pdf, setPdf] = useState<{uri: string}[]>([]);
  const [index, setIndex] = useState(0);

  const folderPath = `users/${userId}/attendance/${date}/report/today/files`;

  // async function getSliderFiles(userId: string, date: string) {

  //   // const result = await storage().ref(folderPath).listAll();
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
  //   // const result = await storage().ref(folderPath).listAll();
  //   const folderRef = ref(storage, folderPath);
  //   const result = await folderRef.listAll();
      
  //   // result.items = list of files
  //   const files = await Promise.all(
  //     result.items
  //       .filter(item => !item.name.toLowerCase().endsWith(".pdf")) // exclude PDFs
  //       .map(async (item) => {
  //         const url = await item.getDownloadURL();
  //         return { url };
  //       })
  //   );

  //   return files;
  // }

  // async function getPdf(userId: string, date: string) {
  //   // const result = await storage().ref(folderPath).listAll();
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

  return (
    <Container allowBack headerMiddle='Report Details' backgroundColor={COLORS.neutral._100}>
      <Text style={styles.title}>Description:</Text>
      <Spacer height={4} />
      <Text style={styles.caption}>{reportData.note}</Text>
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
      <ImageViewModal index={index} visible={visible} images={images} setIsVisible={setIsVisible} />
    </Container>
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