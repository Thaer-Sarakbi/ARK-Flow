import Feather from '@expo/vector-icons/Feather';
import React, { useCallback, useEffect } from 'react';
import { ColorValue, Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '../colors';
import Spacer from '../components/atoms/Spacer';

const { height, width } = Dimensions.get('window');
/**
 * Uploads Props
 */
interface UploadsProps {
  visible: boolean | undefined;
  onPress?: () => void;
  title?: string;
  children?: React.ReactNode;
  variant?: 'closeButton' | 'normal';
  backgroundColor?: ColorValue;
  overlay?: boolean
  usingKeyboardAvoidView?: boolean
  closeOnOverlayPress?: boolean
}
/**
 * 
 * @param param0 
 * @returns {*}
 */
const BottomSheet = ({visible, title = '', variant = 'closeButton', children, backgroundColor = COLORS.white, overlay = true, onPress, usingKeyboardAvoidView = false, closeOnOverlayPress = true}: UploadsProps) => {
  
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  useEffect(() => {
    const onKeyboardShow = (event: {endCoordinates: { height: number }}) => setKeyboardHeight(event.endCoordinates.height);
    const onKeyboardHide = () => setKeyboardHeight(0);
  
    const showListener = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    const hideListener = Keyboard.addListener('keyboardDidHide', onKeyboardHide);
  
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);
  
  const spaceHeightKeyboard = keyboardHeight > 0 ? 12 : 32;

  const translateY = useSharedValue(0);
  const context = useSharedValue({y: 0})
  const scrollTo = useCallback((destination: any) =>{
    "worklet"

    translateY.value = withTiming(destination);

  },[])

  const reSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
      marginBottom: Platform.OS === 'ios' ? keyboardHeight + 32 : 0
    }
  })

  useEffect(() => {
    scrollTo(-375)
  },[])

  if( variant == 'normal') {
    const MAX_TRANSLATE_Y =  -height + 150;

    const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value}
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value =  Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd((event) =>{
      if(translateY.value > -height / 3) {
        scrollTo(-200)
      } else if(translateY.value < -height / 1.8) {
        scrollTo(MAX_TRANSLATE_Y)
      }
    })

    return (
      <>
      {visible && (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles[`sheet-${variant}`], {backgroundColor}, reSheetStyle]}>
          <Spacer height={8} />
          <View style={styles.line} />
          <Spacer height={8} />
          {children}
        </Animated.View>
      </GestureDetector>

      )}
      </>
    )
  } else {
    return (
      <>
      {visible && (
        <>
         <Pressable style={[styles.backdrop, { backgroundColor: overlay ? 'rgba(0,0,0,0.3)' : 'transparent' }]} onPress={onPress} disabled={!closeOnOverlayPress} />
          {
            overlay ? (
              <Animated.View 
                style={[styles[`sheet-${variant}`], { paddingBottom: !usingKeyboardAvoidView ? ( keyboardHeight + spaceHeightKeyboard) : 0 }]}
                entering={SlideInDown}
                exiting={SlideOutDown}>
                {usingKeyboardAvoidView ?
                  <KeyboardAvoidingView behavior={Platform.OS=='ios' ? 'padding':'height'} style={{maxHeight:700}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <TouchableOpacity style={{ flex: 0.9 }} activeOpacity={1}>
                        <View style={styles.header}>
                          <Text style={styles.title}>{title}</Text>
                          <TouchableOpacity onPress={onPress}>
                            <Feather name="x" size={24} color={'black'} />
                          </TouchableOpacity>
                        </View>
                        {children}
                      </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView> 
              :
                <TouchableOpacity style={{ flex: 0.9 }} activeOpacity={1}>
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={onPress}>
                      <Feather name="x" size={24} color={'black'} />
                    </TouchableOpacity>
                  </View>
                  {children}
                </TouchableOpacity>
              }
            </Animated.View>
            ) : (
              <Animated.View 
              style={styles[`sheet-${variant}`]}
              entering={SlideInDown}
              exiting={SlideOutDown}>
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={onPress}>
                      <Feather name="x" size={24} color={'black'} />
                    </TouchableOpacity>
                  </View>
                  {children}
            </Animated.View>
            )
          }
        </>
      )}
      </>
    )
  }
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: -(16 + 36 + 16 + 16),
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 1,
  },
  'sheet-closeButton': {
    backgroundColor: COLORS.white,
    left: 0,
    right: 0,
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 1,
    shadowOffset: {
      height: -2,
      width: 0,
    },
    shadowOpacity: 0.05,
    elevation: 10,
    shadowColor: 'rgba(0, 0, 0, 1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  'sheet-normal': {
    position: 'absolute',
    height: height,
    width: width,
    top: height,
    bottom: 0,
    zIndex: 9,
    borderRadius: 20,
  },
  line: {
    width: 32,
    height: 4,
    flexShrink: 0,
    backgroundColor: COLORS.neutral._400,
    alignSelf: 'center',
    borderRadius: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 25,
  },
})
export default React.memo(BottomSheet)