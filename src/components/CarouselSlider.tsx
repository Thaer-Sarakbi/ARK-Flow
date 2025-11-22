import { useRef } from "react";
import { Image, StyleSheet, useWindowDimensions } from "react-native";
import { Extrapolation, interpolate, useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination, type ICarouselInstance } from 'react-native-reanimated-carousel';
import { COLORS } from "../colors";

interface CarouselSliderProps { 
  index: number
  images: string[],
  setIndex:(index: number) => void 
}

const renderItem = ({ item }: { item: string }) => {
    return (
      <Image
        resizeMode='cover'
        source={{ uri: item }}
        style={styles.image}
      />
    )
  }

const CarouselSlider = ({ index, images, setIndex }: CarouselSliderProps) => {
      const { width } = useWindowDimensions();
      const ref = useRef<ICarouselInstance>(null);
      const scrollOffsetValue = useSharedValue<number>(0);
      const progress = useSharedValue<number>(0);

      const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
          /**
           * Calculate the difference between the current index and the target index
           * to ensure that the carousel scrolls to the nearest index
           */
          count: index - progress.value,
          animated: true,
        });
      };

    return(
      <>
        <Carousel
          defaultIndex={index}
          ref={ref}
		      loop={true}
		      width={width}
          height={400}
		      snapEnabled={true}
		      pagingEnabled={true}
          onProgressChange={progress}
		      data={images}
		      defaultScrollOffsetValue={scrollOffsetValue}
		      onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
		        'worklet';
		         g.enabled(false);
		      }}
          onScrollEnd={(index) => {
            setIndex(index)
          }}
		      renderItem={renderItem}
          style={{ borderRadius: 10 }}
	      />
        <Pagination.Custom
          progress={progress}
          data={images}
          size={10}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          containerStyle={styles.paginationContainer}
          horizontal
          onPress={onPressPagination}
          customReanimatedStyle={(progress, index, length) => {
            let val = Math.abs(progress - index);
            if (index === 0 && progress > length - 1) {
              val = Math.abs(progress - length);
            }
            const isActive = Math.round(progress) === index;
            const baseStyle = {
              transform: [
                {
                  translateY: interpolate(
                    val,
                    [0, 1],
                    [0, 0],
                    Extrapolation.CLAMP,
                  ),
                },
              ],
            };
            if (index === length - 1 && !isActive) {
              return {
                ...baseStyle,
                width: 6,
                height: 6,
              };
            }
            return baseStyle;
         }}
      />
    </>
  )
};

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    dot: {
      borderRadius: 6,
      backgroundColor: COLORS.white,
    },
    activeDot: {
      width: 22,
      height: 8,
      borderRadius: 8,
      backgroundColor: 'white',
      },
    paginationContainer: {
      position: 'absolute',
      bottom: -50,
      alignSelf: 'center',
      backgroundColor: COLORS.caption,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      gap: 4,
      alignItems: 'center',
    },
});

export default CarouselSlider
