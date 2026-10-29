import { addNewlinesToString } from "@/src/utils/addNewLine"
import { COLORS } from "@/src/utils/colors"
import { shadow } from "@/src/utils/shadows"
import Icon from '@expo/vector-icons/Ionicons'
import { Timestamp } from "@react-native-firebase/firestore"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Separator from "../atoms/Separator"
import Spacer from "../atoms/Spacer"
import { RootStackNavigationProp } from "./TaskCard"

interface AdvancedCard {
    title: string,
    status: string,
    advanceId: string
    requestedBy: string
    location: string
    creationDate: Timestamp
    requestedById: string
    amount: number
}

export default function AdvancedCard({ title = '', status, advanceId, requestedBy, requestedById, location, creationDate, amount }: AdvancedCard) {
    const navigation = useNavigation<RootStackNavigationProp>()
    const data = [{ icon: 'cash-outline', text: amount + ' RM' }, {icon: 'person-outline', text: requestedBy}, { icon: 'location-outline', text: location }]

    const getStyle = (status: string) => {
      if(status === 'Pending'){
        return{
          borderColor: COLORS.primary,
          color: COLORS.primary,
        }
      } else if(status === 'Approved'){
        return{
          borderColor: COLORS.positive,
          color: COLORS.positive,
        } 
      } else if(status === 'Rejected'){
        return{
          borderColor: COLORS.danger,
          color: COLORS.danger,
        }
      }
    }

    return(
     <TouchableOpacity style={[styles.container, shadow.cards]} onPress={() => navigation.navigate('AdvanceDetails', { advanceId, requestedById })}>
          <Text style={styles.caption}>{moment(new Date(creationDate?.seconds * 1000)).format('MMMM Do YYYY, h:ss a')}</Text>
          <Separator marginVertical={10} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{addNewlinesToString(title, 17)}</Text>
            <View style={[styles.statusContainer, getStyle(status)]}>
              <Text style={[styles.statusText, getStyle(status)]}>{status}</Text>
            </View>
          </View>
          {
            data.map((item, index) => (
              <View key={index} style={styles.info}>
                <Icon name={item.icon as any} size={20} color={COLORS.neutral._400} />
                <Spacer width={7} />
                <Text style={styles.caption}>{item.text}</Text>
              </View>
            ))
          }
          </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      marginTop: 14,
      marginHorizontal: 4,
      borderRadius: 10,
      padding: 8
    },
    titleContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    statusText: {
      fontSize: 16
    },
    statusContainer:{
      borderWidth: 2,
      borderRadius: 6,
      paddingHorizontal: 22,
      paddingVertical: 10
    },
    title: {
      fontWeight: 'bold',
      fontSize: 25,
      color: COLORS.title
    },
    caption: {
      color: COLORS.caption,
      fontSize: 15
    },
    info: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 6 
    }
});