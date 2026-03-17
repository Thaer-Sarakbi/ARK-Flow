import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Asset } from 'react-native-image-picker';

const resizeImage = async (uri: string) => {
  try {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ height: 800 });
    const image = await context.renderAsync();
    const resizedImage = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.8
    });

    return resizedImage;
  } catch (err) {
    // Image resizing error
  }
};

export const resizeImagesPromises = async (data: Asset[]) => {
  if(!data?.length) return [];
  const resizedImages = await Promise.all(
    data?.map(async (img) => {
      if (img.type?.includes('image')) {
        const resizedImage = await resizeImage(img.uri!);
        return {
          ...resizedImage,
          fileName: img.fileName,
          type: img.type,
        };
      } else {
        return img
      }
      
    })
  );
  
  return resizedImages;
};

export default resizeImage;