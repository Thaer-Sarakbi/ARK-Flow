import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../colors';
import { useUserData } from '../hooks/useUserData';
import { useGetNotificationsRealtimeQuery } from '../redux/notifications';
import { RootStackNavigationProp } from './TaskCard';

const MainHeader = () => {
    const navigation = useNavigation<RootStackNavigationProp>();
    const { data: user, loading, isError: isErrorUserData } = useUserData();
    const {data: notificationsList, isLoading: isLoadingNots, isError} = useGetNotificationsRealtimeQuery({ userId: user?.id }, { skip: !user?.id })

    const unreadCount = useMemo(
      () => notificationsList?.filter((n: any) => !n.readed).length ?? 0,
      [notificationsList]
    );

    return(
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={styles.title}>Tasks</Text>
        </View>
        <View style={styles.right}>
            <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
              <Icon name= {'search-outline'} size={35} color={'white'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationsScreen')}>
              <Icon name= {'notifications-outline'} size={35} color={'white'} />
              {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')}>
              <Icon name= {'chatbubbles-outline'} size={35} color={'white'} />
            </TouchableOpacity>
        </View>
      </View>
    )
};

export default MainHeader;

const styles = StyleSheet.create({
    container:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: COLORS.primary,
      paddingHorizontal: 10,
      height: 100,
      alignItems: 'flex-end',
      paddingBottom: 10
    },
    right:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1
    },
    left:{
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2
    },
    title:{
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        marginHorizontal: 15
    },
    badge: { backgroundColor: 'red', position: 'absolute', borderRadius: 50, paddingHorizontal: 7, paddingVertical: 2, right: 0, top: -4},
    badgeText: { color: COLORS.white }
  })