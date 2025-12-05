import Feather from "@expo/vector-icons/Feather"
import { Modal, StyleSheet, TouchableOpacity } from "react-native"
import ImageViewer from "react-native-image-zoom-viewer"
import { IImageInfo } from "react-native-image-zoom-viewer/built/image-viewer.type"

interface ImageViewModal {
  index: number
  visible: boolean
  images: IImageInfo[]
  setIsVisible: (visible: boolean) => void
}

const ImageViewModal = ({ index, visible, images, setIsVisible }: ImageViewModal) => {
  return(
    <>
      <Modal visible={visible} transparent={true}>
        <ImageViewer 
          imageUrls={images}
          enableSwipeDown
          enablePreload
          index={index}
          enableImageZoom
          onSwipeDown={() => setIsVisible(false)}
          renderHeader={() => <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
            <Feather name="x" size={24} color={'white'} />
            </TouchableOpacity>}
        />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
    closeButton: { 
      zIndex: 1, 
      position: 'absolute', 
      top: 30, 
      right: 20 
    }
})
export default ImageViewModal