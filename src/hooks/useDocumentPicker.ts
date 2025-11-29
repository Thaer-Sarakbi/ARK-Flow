import { DocumentPickerResponse, pick, types } from "@react-native-documents/picker";
import storage from '@react-native-firebase/storage';
import React from "react";
import { Alert } from "react-native";
import RNFS from 'react-native-fs';
import { Asset, launchCamera, launchImageLibrary } from "react-native-image-picker";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

const useDocumentPicker = () => {
  const [documents, setDocuments] = React.useState<DocumentPickerResponse[] | any>([]);
  const [leaveDocuments, setLeaveDocuments] = React.useState<DocumentPickerResponse[] | any>([]);
  const [images, setImages] = React.useState<Asset[]>([]);
  const [leaveImages, setLeaveImages] = React.useState<Asset[]>([]);
  const [uploading, setUploading] = React.useState(false);
  console.log(images)

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

      setImages([])
      setDocuments(validFiles); // Update state with valid files only
      return validFiles;
    } catch (error) {
       return []
    }
  }

  const handleLeaveDocumentSelection = async (allowMultiSelection?: boolean) => {

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

      setLeaveImages([])
      setLeaveDocuments(validFiles); // Update state with valid files only
      return validFiles;
    } catch (error) {
       return []
    }
  }

    // Function to remove a selected document
  const removeDocument = (uri: string) => {
    setDocuments((prevDocs: [DocumentPickerResponse]) => prevDocs.filter((doc) => doc.uri !== uri));
  };

  const removeLeaveDocument = (uri: string) => {
    setLeaveDocuments((prevDocs: [DocumentPickerResponse]) => prevDocs.filter((doc) => doc.uri !== uri));
  };

    const handleSelectImage = async () => {

        await launchImageLibrary({
          mediaType: 'photo',
          presentationStyle: 'pageSheet',
          selectionLimit: 0
        }, async (res) => {
          if (res.assets){
            setDocuments([])
            setImages(res.assets)
          };
        });
    }

    const handleSelectCamera = async () => {

      await launchCamera({
        mediaType: 'photo',
        presentationStyle: 'pageSheet'
      }, async (res) => {
        if (res.assets){
          setDocuments([])
          setImages(res.assets)
        };
      });
  }

    const handleSelectLeaveImage = async () => {

      await launchImageLibrary({
        mediaType: 'photo',
        presentationStyle: 'pageSheet',
        selectionLimit: 0
      }, async (res) => {
        if (res.assets){
          setLeaveDocuments([])
          setLeaveImages(res.assets)
        };
      });
  }

  const handleSelectLeaveCamera = async () => {
    await launchCamera({
      mediaType: 'photo',
      presentationStyle: 'pageSheet'
    }, async (res) => {
      if (res.assets){
        setLeaveDocuments([])
        setLeaveImages(res.assets)
      };
    });
  }

    const removeImage = (uri: string) => {
      setImages(prev => prev.filter(img => img.uri !== uri));
    };

    const removeLeaveImage = (uri: string) => {
      setLeaveImages(prev => prev.filter(img => img.uri !== uri));
    };

    const normalizePath = async (uri: string, fileName: string) => {
      if (!uri.startsWith("content://")) return uri;
  
      const dest = `${RNFS.TemporaryDirectoryPath}/${Date.now()}-${fileName}`;
      await RNFS.copyFile(uri, dest);
      return dest;
    };

    const deleteAllFilesInFolder = async (path: string) => {
      const folderRef = storage().ref(path);
      const list = await folderRef.listAll(); // list all files and prefixes
    
      console.log(path)
      console.log(list)
      // delete all files
      for (const fileRef of list.items) {
        await fileRef.delete();
      }
    };

    // --------------------------------------------------
  // Upload ANY file (document OR image)
  // --------------------------------------------------
  const uploadFile = async (
    file: { uri: string; name: string; type?: string },
    path: string
  ) => {
    try {
      setUploading(true);

      const realPath = await normalizePath(file.uri, file.name);
      const ref = storage().ref(`${path}/${file.name}`);

      await ref.putFile(realPath, {
        contentType: file.type || undefined,
      });

      return await ref.getDownloadURL();

    } catch (err) {
      console.log("Upload error:", err);
      Alert.alert("Upload Error", "Failed to upload file.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadAll = async (path: string) => {
    await deleteAllFilesInFolder(path);
    const urls: string[] = [];

    // Upload documents
    for (const f of documents) {
      const url = await uploadFile(f, path);
      if (url) urls.push(url);
    }

    // Upload images
    for (const img of images) {
      const file = {
        uri: img.uri!,
        name: img.fileName || `IMG-${Date.now()}.jpg`,
        type: img.type || "image/jpeg",
      };

      const url = await uploadFile(file, path);
      if (url) urls.push(url);
    }

    // Clear after upload
    setDocuments([]);
    setImages([]);

    return urls;
  };

  const uploadLeaveAll = async (path: string) => {
    await deleteAllFilesInFolder(path);
    const urls: string[] = [];

    // Upload documents
    for (const f of leaveDocuments) {
      const url = await uploadFile(f, path);
      if (url) urls.push(url);
    }

    // Upload images
    for (const img of leaveImages) {
      const file = {
        uri: img.uri!,
        name: img.fileName || `IMG-${Date.now()}.jpg`,
        type: img.type || "image/jpeg",
      };

      const url = await uploadFile(file, path);
      if (url) urls.push(url);
    }

    // Clear after upload
    setLeaveDocuments([]);
    setLeaveImages([]);

    return urls;
  };
  return {
    documents,
    leaveDocuments,
    images,
    leaveImages,
    uploading,
    handleDocumentSelection,
    handleLeaveDocumentSelection,
    handleSelectImage,
    handleSelectCamera,
    handleSelectLeaveCamera,
    handleSelectLeaveImage,
    removeDocument,
    removeLeaveDocument,
    removeImage,
    removeLeaveImage,
    uploadAll,
    uploadLeaveAll
  }
};

export default useDocumentPicker;