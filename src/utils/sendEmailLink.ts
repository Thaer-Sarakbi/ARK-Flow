import { getAuth, sendSignInLinkToEmail } from '@react-native-firebase/auth';

const auth = getAuth();

export const sendSignInLink = async (email: string | null | undefined) => {
  const actionCodeSettings = {
    // This is the domain/URL that will open the app
    handleCodeInApp: true, 
    url: 'https://flawless-helper-317308.firebaseapp.com/handleLink',
  
  android: {
    packageName: 'com.arkdeglory.arkflow',
    installApp: true, 
  },
  
  // You need this for iOS deep linking
  iOS: {
    bundleId: 'com.arkdeglory.arkflow', 
    customScheme: 'arkflow', 
  }
  };

  try {
    // 1. Send the email with the sign-in link
    if(email){
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    }
    
    alert(`A sign-in link has been sent to ${email} \n check spam if not founded`);
  } catch (e) {
    console.error(e);
    alert('Failed to send sign-in link.');
  }
};