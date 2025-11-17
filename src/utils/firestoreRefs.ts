import firestore from '@react-native-firebase/firestore';

export const usersRef = firestore().collection('users')

export const attendanceRef = (userId: string | undefined, date: string) => {
    return firestore()
      .collection("users")
      .doc(userId)
      .collection("attendance")
      .doc(date)
  };