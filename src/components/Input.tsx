import Icon from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { AnimatableNumericValue, Animated, ColorValue, DimensionValue, Platform, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS } from '../colors';
import Spacer from './atoms/Spacer';


/**
 * Component prop
 *
 * @interface FloatingLabelInputProps
 * @typedef {FloatingLabelInputProps}
 * @extends {TextInputProps}
 */
export interface FloatingLabelInputProps extends TextInputProps {
    label: string;
    value?: string;
    errorText?: string;
    helperText?: string;
    verified?: boolean;
    isPassword?: boolean;
    variant?: string; // will be enchaned in future with variant, primary, secondary, trasparent.
    rightIcon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rounded?: boolean;
    backgroundColor?: ColorValue | undefined;
    labelColor?: ColorValue | any;
    inputColor?: ColorValue | any;
    paddingHorizontal?: number;
    left?: number;
    useErrorColorInput?: boolean;
    borderColor?: ColorValue;
    borderRadius?: AnimatableNumericValue;
    disabled?: boolean;
    outputRangeSize?: number;
    heightContainer?: ViewStyle['height'];
    paddingVertical?: number;
    multiline?: boolean;
    innerContainerStyle?: ViewStyle;
    iIHeight?: DimensionValue;
    maxLengthPlaceholder?: boolean
}

/**
 * Component
 * @param param0 
 * @returns 
 */
const Input = ({
    keyboardType = "default",
    variant = "transparent",
    label,
    defaultValue,
    onChangeText,
    style,
    errorText,
    helperText,
    verified,
    rightIcon,
    leftIcon,
    isPassword = false,
    rounded = false,
    backgroundColor,
    borderColor = COLORS.white,
    borderRadius,
    labelColor,
    inputColor = COLORS.white,
    paddingHorizontal = 16,
    paddingVertical = 8,
    useErrorColorInput = true,
    left = 16,
    disabled = false,
    outputRangeSize = 18,
    heightContainer = 58,
    multiline,
    innerContainerStyle,
    maxLengthPlaceholder = false,
    iIHeight = 38,
	...props
}: FloatingLabelInputProps) => {

    /**
     * States
     */
    const [isFocused, setIsFocused] = useState(false);
    const [animatedIsFocused] = useState(new Animated.Value(defaultValue ? 1 : 0));
    const [text, setText] = useState<string>('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    /**
     * useEffects
     */
    useEffect(() => {
        if (defaultValue) {
            setText(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        Animated.timing(animatedIsFocused, {
            toValue: isFocused || text ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, text]);

    /**
     * Handle text change
     */
    const handleTextChange = (text: string) => {
        if (/^\s*$/.test(text)) {
          setText('');
          if (onChangeText) onChangeText('');
        } else {
          setText(text);
          if (onChangeText) onChangeText(text);
        }

    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    }

    /**
     * Label style with animated
     */
    const labelStyle = {
        position: 'absolute' as 'absolute',
        left,
        right: 16,
        top: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [outputRangeSize, 8],
        }),
        fontSize: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 12],
        })
    };

    /**
     * Return
     */
    return (
        <>
            <View style={[styles.container, rounded && { borderRadius: borderRadius ? borderRadius : 46 }, { backgroundColor, paddingHorizontal, paddingVertical, borderColor, height: heightContainer }, multiline && { height: 'auto' }, errorText ? styles.errorContainer : undefined, style]}>
                {label && <Animated.Text style={[styles.label, labelStyle, labelColor && { color: labelColor }]}>{label}</Animated.Text>}
                <View style={[styles.innerInputContainer, innerContainerStyle]}>
                    {leftIcon}
                    <View style={[styles.innerInput, { height: iIHeight, minHeight: iIHeight }, !label && { justifyContent: 'center', height: 'auto' }, multiline && { height: 'auto' }]}>
                        {label && <Spacer height={17} />}
                        <TextInput
                            keyboardType={keyboardType}
                            editable={!disabled}
                            returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
                            defaultValue={defaultValue}
                            multiline={multiline}
                            style={[styles.input, { color: useErrorColorInput && errorText ? COLORS.danger : inputColor }, multiline && { height: 'auto' }]}
                            onChangeText={handleTextChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            secureTextEntry={isPassword && !isPasswordVisible}
                            {...props}
                        />
                    </View>
                    {isPassword && (
                        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                            <Icon
                                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color={COLORS.neutral._500}
                            />
                        </TouchableOpacity>
                    )}
                    {rightIcon}
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {verified && <Icon name="checkmark-circle" size={20} color={COLORS.positive} />}
                    </View>
                </View>
                {props.maxLength && maxLengthPlaceholder && 
                    // <Paragraph style={styles.maxLengthPlaceholder} text={`${props.value?.length}/${props.maxLength}`} variant='00' />
                    <Text style={styles.maxLengthPlaceholder}>{`${props.value?.length}/${props.maxLength}`}</Text>
                }
            </View>
            {errorText || helperText ? (
                <View style={styles.helperContainer}>
                    <View style={styles.helperIcon}>
                        {errorText && <Icon name="alert-circle" size={16} color={COLORS.danger} />}
                    </View>
                    <View style={styles.helperMessage}>
                        {/* <Caption weight='regular' text={errorText ? errorText : helperText ?? ''} fontSize={12} color={errorText ? COLORS.danger : COLORS.white} /> */}
                        <Text style={{ fontWeight: 'regular', fontSize: 12, color: errorText ? COLORS.danger : COLORS.white }}>{errorText ? errorText : helperText ?? ''}</Text>
                    </View>
                </View>
            ) : null}
        </>
    );
};


/**
 * Stylesheet
 *
 * @type {*}
 */
const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        height: 58,
        overflow: 'hidden',
        minHeight: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.white
    },
    errorContainer: {
        borderWidth: 1,
        borderColor: COLORS.danger
    },
    label: {
        position: 'absolute',
        left: 0,
        top: 32,
        fontSize: 12,
        lineHeight: 16,
        color: COLORS.white,
        //fontFamily: FONTFAMILY.PlusJakartaSans_medium
    },
    input: {
        padding: 0,
        flex:1,
        height: 18,
        minHeight: 18,
        lineHeight: 18,
        fontSize: 14,
        color: COLORS.white,
        //fontFamily: FONTFAMILY.PlusJakartaSans_medium
    },
    innerInputContainer: {
        flexDirection: 'row',
    },
    innerInput: {
        width: "95%",
        color: COLORS.white,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    helperContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    helperIcon: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginRight: 8
    },
    helperMessage: {
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    maxLengthPlaceholder: {
        position: 'absolute',
        bottom: 12,
        right: 12
      },
});

/**
 * Export
 */
export default Input;
