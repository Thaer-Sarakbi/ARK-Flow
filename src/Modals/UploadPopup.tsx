import { Image, ImageProps, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../colors"
import Spacer from "../components/atoms/Spacer"
import useDocumentPicker from "../hooks/useDocumentPicker"
import BottomSheet from "./BottomSheet"

interface UploadPopup {
  uploadPopupVisible: boolean
  setUploadPopupVisible: (visible: boolean) => void
}

const BoxUpload = ({ title, source, onPress }: { title: string, source: ImageProps, onPress:() => void }) => {
    return (
      <TouchableOpacity style={styles.boxUploadContainer} onPress={onPress}>
        <Image style={styles.imgIcon} source={source} />
        <Spacer height={8}/>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    )
  }

const UploadPopup = ({ uploadPopupVisible, setUploadPopupVisible }: UploadPopup) => {
const { handleDocumentSelection, handleSelectImage, handleSelectCamera, images } = useDocumentPicker()

const handleCamera = async () => {
    await handleSelectCamera().then(() => {
        setUploadPopupVisible(false)
    }).catch((e) => console.log(e))
};

const handleGallery = async () => {
    await handleSelectImage().then(() => {
      setUploadPopupVisible(false)
    }).catch((e) => console.log(e))
};

const handleDocument = async () => {
    await handleDocumentSelection().then((result) => {
     setUploadPopupVisible(false)
    }).catch((e) => console.log(e))
};

  return(
    <BottomSheet visible={uploadPopupVisible} onPress={() => setUploadPopupVisible(false)}>
      <View style={{ flexDirection: 'row' }}>
        <BoxUpload title='Camera' source={require("../../assets/camera.png")} onPress={handleCamera}/>
        <Spacer width={10} />
        <BoxUpload title='Gallery' source={require("../../assets/gallery.png")} onPress={handleGallery} />
        <Spacer width={10} />
        <BoxUpload title='Document' source={require("../../assets/document.png")} onPress={handleDocument}/>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
    /**
      * Style Box Upload
      */
     boxUploadContainer: { 
        alignItems: 'center', 
        borderWidth: 2, 
        borderRadius: 8, 
        borderColor: COLORS.info, 
        paddingVertical: 10, 
        paddingHorizontal: 4 
    },
    imgIcon: {
        height: 24,
        width: 24,
    },
    title: {
        color: COLORS.info,
        fontWeight: 'bold',
        fontSize: 25,
    },
})
export default UploadPopup