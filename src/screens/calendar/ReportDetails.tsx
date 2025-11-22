import Spacer from '@/src/components/atoms/Spacer';
import CarouselSlider from '@/src/components/CarouselSlider';
import Container from '@/src/components/Container';
import { useUserData } from '@/src/hooks/useUserData';
import { Report } from '@/src/utils/types';
import storage from '@react-native-firebase/storage';
import { useEffect, useState } from 'react';
import { ImageURISource, Text, TouchableHighlight, View } from 'react-native';
import ImageView from "react-native-image-viewing";

interface ReportDetails {
  route: {
    params: {
      date: string,
      reportData: Report
    }
  }
}

export default function ReportDetails({ route }: ReportDetails) {
  const date = route.params.date
  const reportData = route.params.reportData
  const { data: user, loading } = useUserData();
  const [visible, setIsVisible] = useState<boolean>(false);
  const [sliderimages, setSliderImages] = useState<string[]>([]);
  const [images, setImages] = useState<ImageURISource[]>([]);
  const [index, setIndex] = useState(0);

  async function getSliderFiles(userId: string, date: string) {
    const folderPath = `users/${userId}/attendance/${date}/report/today/files`;
    const result = await storage().ref(folderPath).listAll();
      
    // result.items = list of files
    const files = await Promise.all(
      result.items.map(async (item) => {
        const url = await item.getDownloadURL();
        return url
      })
    );
    return files;
  }

  async function getFiles(userId: string, date: string) {
    const folderPath = `users/${userId}/attendance/${date}/report/today/files`;
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

  useEffect(() => {
    (async () => {
        if(user){
          const sliderResult = await getSliderFiles(user?.id, '19-11-2025');
          setSliderImages(sliderResult);
          const result = await getFiles(user?.id, '19-11-2025');
          setImages(result);
        }
    })();
  }, [user]);

  return (
    <Container allowBack>
      <Text>{reportData.note}</Text>
      <Spacer height={16} />
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
    </Container>
  );
}