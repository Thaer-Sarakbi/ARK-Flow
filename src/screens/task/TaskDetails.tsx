import { COLORS } from '@/src/colors';
import Spacer from '@/src/components/atoms/Spacer';
import StatusButton from '@/src/components/buttons/StatusButton';
import SubmitButton from '@/src/components/buttons/SubmitButton';
import Container from '@/src/components/Container';
import Loading from '@/src/components/Loading';
import LoadingComponent from '@/src/components/LoadingComponent';
import ErrorComponent from '@/src/components/molecule/ErrorComponent';
import TaskInfo from '@/src/components/TaskInfo';
import { useUserData } from '@/src/hooks/useUserData';
import { useGetTaskQuery, useGetUpdatesQuery } from '@/src/redux/tasks';
import { Updates } from '@/src/utils/types';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';

const TaskDetails = ({ route }: { route: { params: { taskId: string }}}) => {
    const { data: user, loading, isError: isErrorUserData } = useUserData();
    // Only run task + updates queries when user.id exists
    const skipQueries = !user?.id || !route?.params?.taskId;
    const { data, isLoading: isLoadingTask, isError: isErrorTask } = useGetTaskQuery({ userId: user?.id, taskId: route.params.taskId }, { skip: skipQueries })
    const { data: updatesData, isLoading: isLoadingUpdates , isError: isErrorUpdates } = useGetUpdatesQuery({ userId: user?.id, taskId: route.params.taskId }, { skip: skipQueries })

    const editUpdates = updatesData
    ?.map((update: Updates) => {
      const time = moment(update.time.seconds * 1000).format("MMM Do[\n]h:mm a");
      return {
        ...update,
        time,
        date: update.time.seconds,
      };
    })
    ?.sort((a: any, b: any) => b.date - a.date);

    if(loading || isLoadingTask) return <Loading visible={true} />
    if(isErrorUserData || isErrorTask) return <ErrorComponent />

    return (
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
              onEventPress={(update) => console.log(update)}
              titleStyle={styles.titleStyle}
              descriptionStyle={styles.caption}
            />
          }
          <SubmitButton text='Add Update' />
        </View>
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