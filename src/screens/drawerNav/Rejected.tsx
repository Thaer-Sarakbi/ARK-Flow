import Loading from "@/src/components/atoms/Loading";
import Spacer from "@/src/components/atoms/Spacer";
import AdvancedCard from "@/src/components/molecules/AdvancedCard";
import ErrorComponent from "@/src/components/molecules/ErrorComponent";
import {
  useGetAdvancesRealtimeQuery,
  useLazyGetAdvancesQuery,
} from "@/src/redux/advances";
import { useUserDataRealTimeQuery } from "@/src/redux/user";
import { getAuth } from "@react-native-firebase/auth";
import { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const auth = getAuth();

export default function Rejected({
  requestedById,
}: {
  requestedById: string | undefined;
}) {
  const [isFetching, setIsFetching] = useState(false);
  const {
    data: user,
    isLoading,
    isError: isErrorUserData,
  } = useUserDataRealTimeQuery(auth.currentUser?.uid ?? null);
  const {
    data: listOfAdvances,
    isLoading: isLoadingAdvances,
    isError: isEerrorAdvances,
  } = useGetAdvancesRealtimeQuery({ userId: user?.id }, { skip: !user?.id });
  const [getAdvances] = useLazyGetAdvancesQuery();

  const rejectedAdvances = useMemo(() => {
    if (!listOfAdvances) return [];

    return listOfAdvances
      .filter(
        (advance) =>
          advance.requestedById === requestedById &&
          advance.status === "Rejected",
      )
      .sort((a, b) => b.creationDate.seconds - a.creationDate.seconds);
  }, [requestedById, listOfAdvances]);

  const onRefresh = () => {
    setIsFetching(true);
    getAdvances({ userId: user?.id });
    setIsFetching(false);
  };

  if (isLoading || isLoadingAdvances) return <Loading visible={true} />;
  if (isErrorUserData || isEerrorAdvances) return <ErrorComponent />;

  return (
    <>
      {rejectedAdvances?.length > 0 ? (
        <View style={styles.container}>
          <FlatList
            data={rejectedAdvances}
            renderItem={({ item }) => (
              <AdvancedCard
                title={item.title}
                status={item.status}
                location={item.location}
                requestedBy={item.requestedBy}
                amount={item.amount}
                advanceId={item.id}
                requestedById={item.requestedById}
                creationDate={item.creationDate}
              />
            )}
            onRefresh={() => onRefresh()}
            refreshing={isFetching}
          />
        </View>
      ) : (
        <View style={styles.blank}>
          <Image
            style={{ width: 120, height: 120 }}
            source={require("@/assets/icons/noTasks.png")}
          />
          <Spacer height={8} />
          <Text style={{ alignSelf: "center" }}>No Tasks</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 12,
  },
  blank: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
