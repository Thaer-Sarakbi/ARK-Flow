import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import CarouselSlider from '@/src/components/CarouselSlider';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import { useUserData } from '@/src/hooks/useUserData';
import { Report } from '@/src/utils/types';
import Entypo from '@expo/vector-icons/Entypo';
import storage from '@react-native-firebase/storage';
import { useEffect, useState } from 'react';
import { ImageURISource, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import FileViewer from "react-native-file-viewer";
import RNFS from 'react-native-fs';
import ImageView from "react-native-image-viewing";

interface LeaveDetails {
  route: {
    params: {
      date: string,
      leave: Report
    }
  }
}

export default function LeaveDetails({ route }: LeaveDetails) {
  const date = route.params.date
  const leaveData = route.params.leave
  const { data: user, loading } = useUserData();
  const [visible, setIsVisible] = useState<boolean>(false);
  const [sliderimages, setSliderImages] = useState<string[]>([]);
  const [images, setImages] = useState<ImageURISource[]>([]);
  const [index, setIndex] = useState(0);
  const [pdf, setPdf] = useState<{uri: string}[]>([]);
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);

  const folderPath = `users/${user?.id}/attendance/${date}/leave/today/files`;

  async function getSliderFiles(userId: string, date: string) {

    const result = await storage().ref(folderPath).listAll();

    const files = await Promise.all(
      result.items
        .filter(item => !item.name.toLowerCase().endsWith(".pdf")) // exclude PDFs
        .map(async (item) => {
          const url = await item.getDownloadURL();
          return url;
        })
    );
    return files;
  }

  async function getFiles(userId: string, date: string) {
    const folderPath = `users/${userId}/attendance/${date}/leave/today/files`;
    const result = await storage().ref(folderPath).listAll();
      
    // result.items = list of files
    const files = await Promise.all(
      result.items.map(async (item) => {
        const url = await item.getDownloadURL();
        return (
            {uri: url}
        )
      })
    );
    return files;
  }

  async function getPdf(userId: string, date: string) {
    const result = await storage().ref(folderPath).listAll();
      
    // result.items = list of files
    const files = await Promise.all(
      result.items
        .filter(item => item.name.toLowerCase().endsWith(".pdf")) // exclude PDFs
        .map(async (item) => {
          const url = await item.getDownloadURL();
          return { uri: url };
        })
    );

    return files;
  }
  
  useEffect(() => {
    if (!user?.id) return;
  
    const loadFiles = async () => {
      setIsLoadingVisible(true)
      try {
        const sliderResult = await getSliderFiles(user.id, date);
        setSliderImages(sliderResult);
  
        const result = await getFiles(user.id, date);
        setImages(result);

        const pdfResult = await getPdf(user.id, date);
        setPdf(pdfResult);
      } catch (e) {
        console.error("Failed to load files:", e);
      } finally {
        setIsLoadingVisible(false) 
      }
    };
  
    loadFiles();
  }, [user?.id, date]);

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

  return (
    <Container allowBack headerMiddle='Leave Details' backgroundColor={COLORS.neutral._100}>
      <Loading visible={loadingVisible} />
      <Text style={styles.title}>Description:</Text>
      <Spacer height={4} />
      <Text style={styles.caption}>{leaveData.note}</Text>
      <Spacer height={16} />
      {sliderimages.length > 0 && (<>
        <Text style={styles.title}>Images:</Text>
        <Spacer height={6} />
        <TouchableHighlight onPress={() => setIsVisible(true)}>
          <CarouselSlider index={index} images={sliderimages} setIndex={setIndex}/>
        </TouchableHighlight>
        <View style={{ paddingTop: 50 }}>
          <ImageView
            images={images}
            imageIndex={index}
            visible={visible}
            onRequestClose={() => setIsVisible(false)}
            onImageIndexChange={(i) => setIndex(i)}
            swipeToCloseEnabled
            presentationStyle= 'pageSheet'
          />
        </View>
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