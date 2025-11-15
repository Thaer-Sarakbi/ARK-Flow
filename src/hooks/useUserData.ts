import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

interface User {
  accountCreated: string | undefined,
  email: string | null,
  id: string,
  profile:{
    admin: boolean,
    email: string,
    fullName: string,
    phoneNumber: string
   }
}

export const useUserData = () => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        setData(null);
        setLoading(false);
        return;
      }

      const uid = currentUser.uid;

      const userDoc = await firestore()
        .collection('users')
        .doc(uid)
        .get();

      setData({
        id: uid,
        email: currentUser.email,
        accountCreated: currentUser.metadata.creationTime,
        profile: userDoc.data() as any
      });

      setLoading(false);
    };

    fetch();
  }, []);

  return { data, loading };
};
