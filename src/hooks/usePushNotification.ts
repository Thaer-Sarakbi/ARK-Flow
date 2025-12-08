import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { Platform } from 'react-native';

const usePushNotification = () => {
  const [expoToken, setExpoToken] = useState('');
  const [notificationStatus, setNotStatus] = useState(false)

  const requestUserPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    const enabled =
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  
    if (!enabled) {
      const req = await Notifications.requestPermissionsAsync();
      const granted =
        req.granted ||
        req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  
      setNotStatus(granted);
      return granted;
    }
  
    setNotStatus(true);
    return true;
  };

  const registerForExpoPushToken = async () => {
    if (!Device.isDevice) {
      console.log('Physical device required');
      return null;
    }
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [250, 250, 250, 250],
      });
    }
  
    const permission = await requestUserPermission();
    if (!permission) return null;
  
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
  
      if (!projectId) throw new Error('EAS projectId missing');
  
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      setExpoToken(token);
      return token;
    } catch (e) {
      console.log('Expo push error:', e);
      return null;
    }
  };

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  }
  
  // async function registerForPushNotificationsAsync() {
  //   let token;
  
  //   if (Platform.OS === 'android') {
  //     await Notifications.setNotificationChannelAsync('myNotificationChannel', {
  //       name: 'A channel is needed for the permissions prompt to appear',
  //       importance: Notifications.AndroidImportance.MAX,
  //       vibrationPattern: [250, 250, 250, 250],
  //       lightColor: '#FF231F7C',
  //     });
  //   }
  
  //   if (Device.isDevice) {
  //     const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //     let finalStatus = existingStatus;
  //     if (existingStatus !== 'granted') {
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       finalStatus = status;
  //     }
  //     if (finalStatus !== 'granted') {
  //       console.log('Failed to get push token for push notification!');
  //       return;
  //     }
  //     // Learn more about projectId:
  //     // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
  //     // EAS projectId is used here.
  //     try {
  //       const projectId =
  //         Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  //         console.log('project ', projectId)
  //       if (!projectId) {
  //         throw new Error('Project ID not found');
  //       }
  //       token = (
  //         await Notifications.getExpoPushTokenAsync({
  //           projectId,
  //         })
  //       ).data;
  //       console.log('token ', token);
  //     } catch (e) {
  //       token = `${e}`;
  //     }
  //   } else {
  //     console.log('Must use physical device for Push Notifications');
  //   }
  
  //   return token;
  // }
  
  return {
    notificationStatus,
    requestUserPermission,
    registerForExpoPushToken,
    schedulePushNotification
  };
};

export default usePushNotification;