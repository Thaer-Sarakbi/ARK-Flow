import { getAuth } from '@react-native-firebase/auth';
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
    password: string,
    phoneNumber: string
   }
}

const auth = getAuth();

export const useUserData = () => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setData(null);
        setLoading(false);
        return;
      }

      const uid = currentUser.uid;

      try{
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
      } catch (err){
        console.log(err)
        setIsError(true)
      }

      setLoading(false);
    };

    fetch();
  }, []);

  return { data, loading, isError };
};
