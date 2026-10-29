import Container from "@/src/components/atoms/Container";
import Loading from "@/src/components/atoms/Loading";
import Spacer from "@/src/components/atoms/Spacer";
import StatusButton from "@/src/components/atoms/StatusButton";
import CommentsBox from "@/src/components/molecules/CommentsBox";
import ErrorComponent from "@/src/components/molecules/ErrorComponent";
import TaskInfo from "@/src/components/molecules/TaskInfo";
import ImageViewModal from "@/src/Modals/ImageViewModal";
import UpdateAdvanceStatus from "@/src/Modals/UpdateAdvanceStatus";
import {
  useAddAdvanceCommentMutation,
  useGetAdvanceRealtimeQuery,
  useGetRealAdvanceCommentsQuery,
} from "@/src/redux/advances";
import {
  useAddAdvanceNotificationMutation,
  useUpdateNotificationStatusMutation,
} from "@/src/redux/notifications";
import { useUserDataRealTimeQuery } from "@/src/redux/user";
import { COLORS } from "@/src/utils/colors";
import { getAuth } from "@react-native-firebase/auth";
import { getStorage, ref } from "@react-native-firebase/storage";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";
import { IImageInfo } from "react-native-image-zoom-viewer/built/image-viewer.type";

interface Props {
  route: {
    params: {
      advanceId: string;
      requestedById: string;
      notificationId: string;
      notificationStatus: string;
    };
  };
}

const auth = getAuth();
const storage = getStorage();
export default function AdvanceDetails({
  route: {
    params: { advanceId, requestedById, notificationId, notificationStatus },
  },
}: Props) {
  const [index, setIndex] = useState(0);
  const [sliderimages, setSliderImages] = useState<string[]>([]);
  const [loadingVisible, setIsLoadingVisible] = useState<boolean>(false);
  const [isImageViewVisible, setIsImageViewVisible] = useState<boolean>(false);
  const [updateStatusVisible, setUpdateStatusVisible] =
    useState<boolean>(false);
  const [comment, setComment] = useState("");
  const [imagesList, setImagesList] = useState<IImageInfo[]>([]);
  const skipQueries = !requestedById || !advanceId;
  const {
    data: user,
    isLoading,
    isError: isErrorUserData,
  } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null);
  const {
    data,
    isLoading: isLoadingAdvance,
    isError: isErrorAdvance,
  } = useGetAdvanceRealtimeQuery(
    { userId: requestedById, advanceId },
    { skip: skipQueries },
  );
  const [addComment, { isLoading: isLoadingAddComment }] =
    useAddAdvanceCommentMutation();
  const { data: comments, isLoading: isLoadingComments } =
    useGetRealAdvanceCommentsQuery({ userId: requestedById, advanceId });
  // const { data: requestedByData } = useGetUserRealtimeQuery({ userId: requestedById }, { skip: skipQueries });
  // const { data: requestedByData } = useGetUserRealtimeQuery({ userId: requestedById }, { skip: skipQueries });
  const [updateNotificationStatus] = useUpdateNotificationStatusMutation();
  const [
    addNotification,
    { isLoading: isLoadingAddNot, isError: isErrorAddNot },
  ] = useAddAdvanceNotificationMutation();

  const folderPath = `users/${requestedById}/advances/${advanceId}/files`;

  useEffect(() => {
    const loadFiles = async () => {
      setIsLoadingVisible(true);
      loadAllFiles();
    };

    loadFiles();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!notificationId || !requestedById || notificationStatus) return;

      updateNotificationStatus({
        userId: user?.id,
        notificationId,
      });
    }, [
      notificationId,
      notificationStatus,
      requestedById,
      updateNotificationStatus,
    ]),
  );
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
      }),
    );

    setSliderImages(imageUrls);
    setImagesList(images);
    setIsLoadingVisible(false);
  }

  const onSubmitComment = async () => {
    const result = await addComment({
      userId: requestedById,
      advanceId,
      comment,
      commenter: user?.fullName,
    } as any);

    if ("error" in result) {
      console.log("Adding comment error:", result.error);
      return;
    }

    setComment("");
    Keyboard.dismiss();

    let notifyUserId: string | null = null;

    if (user?.id === "pJ4Mg0zvs9cTOiQKqIshWlSiSUR2") {
      // assignedBy commented → notify assignedTo
      notifyUserId = requestedById;
    } else if (user?.id === requestedById) {
      // assignedTo commented → notify assignedBy
      notifyUserId = "pJ4Mg0zvs9cTOiQKqIshWlSiSUR2";
    }

    if (notifyUserId && notifyUserId !== user?.id) {
      const addNotResult = await addNotification({
        requestedById,
        userId: notifyUserId,
        advanceId,
        screenName: "AdvanceDetails",
        screenId: advanceId,
        message: `${user?.fullName} commented on pinjam request`,
        title: data?.title,
      } as any);

      if ("error" in addNotResult) {
        console.log("Adding notification error:", addNotResult.error);
        return;
      }
      console.log("Notification Added");
    }
  };

  if (isLoading || isLoadingAdvance || loadingVisible || isLoadingComments)
    return <Loading visible={true} />;
  if (isErrorAdvance) return <ErrorComponent />;
  return (
    <>
      <Container
        headerMiddle="Advance Details"
        allowBack
        backgroundColor={COLORS.neutral._100}
      >
        <Text style={styles.title}>{data?.title}</Text>
        <Spacer height={10} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Text style={styles.value}>{data?.amount}</Text>
          <Text>/ RM</Text>
        </View>
        <Spacer height={14} />
        <TaskInfo
          title={"Description"}
          value={data?.description}
          sliderimages={sliderimages}
          setIsVisible={setIsImageViewVisible}
          index={index}
          setIndex={setIndex}
          loadingVisible={loadingVisible}
        />
        <Spacer height={10} />
        <TaskInfo title={"Requested By"} value={data?.requestedBy} />
        <Spacer height={10} />
        <View style={{ flexDirection: "row" }}>
          <TaskInfo title={"Location"} value={data?.location} />
          <Spacer width={10} />
          <TaskInfo
            title={"Creation Date"}
            value={moment(data?.creationDate?.seconds * 1000).format(
              "MMM Do YYYY, h:ss a",
            )}
          />
        </View>
        <Spacer height={20} />
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text style={styles.title}>Status</Text>
          <Spacer height={14} />
          <StatusButton
            disabled={
              data?.status === "Approved" || data?.status === "Rejected"
                ? true
                : false
            }
            status={data?.status}
            onPress={() => setUpdateStatusVisible(true)}
          />
        </View>
        <Spacer height={20} />
        <CommentsBox
          comment={comment}
          comments={comments}
          setComment={setComment}
          onSubmitComment={onSubmitComment}
        />
        <Spacer height={36} />
      </Container>
      <ImageViewModal
        index={index}
        visible={isImageViewVisible}
        images={imagesList}
        setIsVisible={setIsImageViewVisible}
      />
      <UpdateAdvanceStatus
        isVisible={updateStatusVisible}
        title="Update Status"
        onPressClose={() => setUpdateStatusVisible(false)}
        amount={data?.amount}
        advanceId={data?.id}
        advanceTitle={data?.title}
        currentStatus={data?.status}
        currentStatusId={data?.statusId}
        requestedById={requestedById}
        disable={() => setUpdateStatusVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 25,
    color: COLORS.title,
  },
  value: {
    fontWeight: "bold",
    fontSize: 60,
    //textAlign: 'center'
  },
});
