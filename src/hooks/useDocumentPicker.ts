import { DocumentPickerResponse, pick, types } from "@react-native-documents/picker";
import storage from '@react-native-firebase/storage';
import React from "react";
import { Alert } from "react-native";
import RNFS from 'react-native-fs';

const MAX_FILE_SIZE = 1 * 1024 * 1024;

const useDocumentPicker = () => {
  const [documents, setDocuments] = React.useState<DocumentPickerResponse[] | any>([]);
  const [uploading, setUploading] = React.useState(false);

  const handleDocumentSelection = async (allowMultiSelection?: boolean) => {

    try {
      const result = await pick({
        type: [types.images, types.pdf],
        allowMultiSelection: allowMultiSelection ?? true,
        mode: 'open',
        copyTo: 'documentDirectory'
      });

      const validFiles = result.filter(file => {
        if (file.size! <= MAX_FILE_SIZE) {
          return true
        } else {
          Alert.alert('File Size Error', `${file.name} is larger than 1 MB and will not be uploaded.`);
          return false;
        }
      })

      setDocuments(validFiles); // Update state with valid files only
      return validFiles;
    } catch (error) {
       return []
    }
  }

    // Function to remove a selected document
  const removeDocument = (uri: string) => {
    setDocuments((prevDocs: [DocumentPickerResponse]) => prevDocs.filter((doc) => doc.uri !== uri));
  };

  const uploadFile = async (file: DocumentPickerResponse, path: string) => {
    try {
      setUploading(true);

    // Fix Android "content://" URIs
    if (file.uri.startsWith("content://")) {
      const destPath = `${RNFS.TemporaryDirectoryPath}/${file.name}`;
      await RNFS.copyFile(file.uri, destPath);
      file.uri = destPath; // convert to a normal file path
    }

      const reference = storage().ref(`${path}/${file.name}`);

      await reference.putFile(file.uri, {
        contentType: file.type || undefined,
      });

      const url = await reference.getDownloadURL();
      return url;
    } catch (error) {
        console.log(error)
      Alert.alert("Upload Error", "Failed to upload the file.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadAll = async (path: string) => {
    const urls = [];

    for (const file of documents) {
      const url = await uploadFile(file, path);
      if (url) urls.push(url);
    }

    setDocuments([]);
    return urls;
  };

  return {
    documents,
    uploading,
    handleDocumentSelection,
    removeDocument,
    uploadAll
  }
};

export default useDocumentPicker;