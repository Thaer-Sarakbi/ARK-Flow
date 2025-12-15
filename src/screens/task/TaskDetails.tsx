import { COLORS } from '@/src/colors';
import AddUpdate from '@/src/components/AddUpdate';
import Spacer from '@/src/components/atoms/Spacer';
import BoxUpload from '@/src/components/BoxUpload';
import StatusButton from '@/src/components/buttons/StatusButton';
import SubmitButton from '@/src/components/buttons/SubmitButton';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import LoadingComponent from '@/src/components/LoadingComponent';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import TaskInfo from '@/src/components/TaskInfo';
import useCurrentLocation from '@/src/hooks/useCurrentLocation';
import useDocumentPicker from '@/src/hooks/useDocumentPicker';
import { useUserData } from '@/src/hooks/useUserData';
import BottomSheet from '@/src/Modals/BottomSheet';
import { useGetTaskQuery, useGetUpdatesQuery, useLazyGetUpdatesQuery } from '@/src/redux/tasks';
import { MainStackParamsList } from '@/src/routes/MainStack';
import { Update } from '@/src/utils/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import Timeline from 'react-native-timeline-flatlist';
import { useSelector } from 'react-redux';

export type RootStackNavigationProp = StackNavigationProp<MainStackParamsList, 'TaskDetails'>;

const TaskDetails = ({ route }: { route: { params: { taskId: string }}}) => {
    const mapRef = useRef<MapView | null>(null);
    const isLoading = useSelector((state: any) => state.ui.loading);
    const [isVisible, setIsVisible] = useState(false)
    const [uploadPopupVisible, setUploadPopupVisible] = useState(false)
    const navigation = useNavigation<RootStackNavigationProp>()
    const { data: user, loading, isError: isErrorUserData } = useUserData();
    // Only run task + updates queries when user.id exists
    const skipQueries = !user?.id || !route?.params?.taskId;
    const { data, isLoading: isLoadingTask, isError: isErrorTask } = useGetTaskQuery({ userId: user?.id, taskId: route.params.taskId }, { skip: skipQueries })
    const { data: updatesData, isLoading: isLoadingUpdates , isError: isErrorUpdates } = useGetUpdatesQuery({ userId: user?.id, taskId: route.params.taskId }, { skip: skipQueries })
    const { handleDocumentSelection, handleSelectImage, handleSelectCamera, images, removeImage, documents, removeDocument, uploadAll, uploading } = useDocumentPicker()
    const [getUpdates, { isError, isLoading: isLoadingGetUpdates }] = useLazyGetUpdatesQuery()
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

    useEffect(() => {
      getLocation(); // fetch when screen opens
    },[])

    useEffect(() => {
      getUpdates({ userId: user?.id, taskId: route.params.taskId })
    },[isVisible])

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

    if(loading || isLoadingTask || isLoadingGetUpdates || isLoading) return <Loading visible={true} />
    if(isErrorUserData || isErrorTask || isError) return <ErrorComponent />

    return (
      <>
      <Container allowBack headerMiddle='Task Details' backgroundColor={COLORS.neutral._100}>
        <Text style={styles.title}>{data?.title}</Text>
        <Spacer height={14} />
        <TaskInfo title={'Assigned By'} value={data?.assignedBy}/>
        <Spacer height={10} />
        <TaskInfo title={'Assigned To'} value={data?.assignedTo}/>
        <Spacer height={10} />
        <View style={{ flexDirection: 'row' }}>
          <TaskInfo title={'Creation Date'} value={moment(data?.creationDate).format('MMM Do YYYY, h:ss a')}/>
          <Spacer width={10} />
          <TaskInfo title={'Duration'} value={`${data?.duration} Day`}/>
        </View>
        <Spacer height={10} />
        <TaskInfo title={'Location'} value={data?.location}/>
        <Spacer height={10} />
        <View style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: 10 }}>
          <Text style={styles.title}>Status</Text>
          <Spacer height={14} />
          <StatusButton status={data?.status} />
          <Spacer height={8} />
          <SubmitButton text='Submit' />
        </View>
        <Spacer height={10} />
        <View style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: 10 }}>
          <Text style={styles.title}>Updates</Text>
          <Spacer height={10} />
          {
            isLoadingUpdates ? <LoadingComponent /> :
            isErrorUpdates ? <ErrorComponent /> :
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
                navigation.navigate('UpdateDetails', { updateId: update.id, taskId: update.taskId, userName: user?.profile.fullName, userId: user?.id ?? '' })
              }}                
              titleStyle={styles.titleStyle}
              descriptionStyle={styles.caption}
            />
          }
          <SubmitButton text='Add Update' onPress={() => setIsVisible(true)} />
        </View>
        <Spacer height={40} />
      </Container>
      <BottomSheet visible={isVisible} onPress={() => setIsVisible(false)}>
        <AddUpdate setIsVisible={setIsVisible} setUploadPopupVisible={setUploadPopupVisible} taskId={route?.params?.taskId} assignedToId={data.assignedToId} images={images} documents={documents} removeImage={removeImage} removeDocument={removeDocument} uploadAll={uploadAll} userId={user?.id} uploading={uploading} />
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