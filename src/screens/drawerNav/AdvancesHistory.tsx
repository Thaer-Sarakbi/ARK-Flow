import Container from "@/src/components/atoms/Container";
import Loading from "@/src/components/atoms/Loading";
import Separator from "@/src/components/atoms/Separator";
import Spacer from "@/src/components/atoms/Spacer";
import ErrorComponent from "@/src/components/molecules/ErrorComponent";
import { useGetBalanceHistoryRealtimeQuery } from "@/src/redux/advances";
import { COLORS } from "@/src/utils/colors";
import moment from "moment";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const AdvancesHistory = ({ route }: any) => {
  const value = route.params.requestedById;
  const { data, isError, isLoading } = useGetBalanceHistoryRealtimeQuery(
    { userId: value },
    { skip: !value },
  );

  const sortedData = [...(data ?? [])].sort(
    (a, b) => b.creationDate.seconds - a.creationDate.seconds,
  );

  if (isLoading) return <Loading visible={true} />;
  if (isError) return <ErrorComponent />;

  return (
    <Container allowBack headerMiddle="History" scrollable={false}>
      <FlatList
        data={sortedData}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        ItemSeparatorComponent={() => <Separator marginVertical={8} />}
        renderItem={({ item }) => (
          <View>
            <Text style={{ fontWeight: "bold" }}>
              {moment(new Date(item.creationDate?.seconds * 1000)).format(
                "MMMM Do YYYY, h:mm:ss a",
              )}
            </Text>

            <Spacer height={4} />

            <Text style={{ color: COLORS.caption }}>
              {item.updatedBy} updated balance to {item.balance}
            </Text>
          </View>
        )}
      />
    </Container>
  );
};

const styles = StyleSheet.create({});

export default AdvancesHistory;
