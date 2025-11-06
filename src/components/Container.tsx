import React from 'react';
import { ColorValue, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StatusBarStyle, StyleSheet, View } from 'react-native';
import { Edges, SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { COLORS } from '../colors';
// import Header from './atom/headers/Header';

const { height } = Dimensions.get("window");
const statusBarHeight = (StatusBar.currentHeight ?? 0)
/**
 * Container prop
 *
 * @interface ContainerProps
 * @typedef {ContainerProps}
 * @extends {SafeAreaViewProps}
 */
interface ContainerProps extends SafeAreaViewProps {
    barStyle?: StatusBarStyle;
    barBackgroundColor?: ColorValue;
    allowBack?: boolean;
    backgroundColor?: ColorValue;
    headerMiddle?: React.ReactNode;
    FooterComponent?: React.FC;
    edges?: Edges;
    hasInput?: boolean;
    usingPaddingBottom?: boolean;
    headerBottomLine?: boolean;
    usingPaddingTop?: boolean;
    barHidden?: boolean;
    noPadding?: boolean
    EnableRight?: React.ReactNode;
}


/**
 * Container 
 *
 * @param {ContainerProps} param0
 * @param {*} param0.children
 * @param {*} param0.style
 * @param {StatusBarStyle} [param0.barStyle="default"]
 * @param {ColorValue} [param0.barBackgroundColor="transparent"]
 * @returns {*}
 */
const Container = ({ children, style, headerMiddle, barStyle = "dark-content", barBackgroundColor = "transparent", allowBack = false, hasInput = false, backgroundColor = COLORS.white, edges, usingPaddingBottom = true, usingPaddingTop = true, headerBottomLine = false, barHidden = false, noPadding = false, FooterComponent, EnableRight}: ContainerProps) => {
    return (
        <SafeAreaView style={[style, styles.container, { backgroundColor }]} edges={edges}>
            <StatusBar translucent backgroundColor={barBackgroundColor} barStyle={barStyle} hidden={barHidden} />
            {/* <Header allowBack={allowBack} headerMiddle={headerMiddle} underline={headerBottomLine} EnableRight={EnableRight}/> */}
            {hasInput ? (
                <KeyboardAvoidingView style={[styles.wrapper,  (!usingPaddingBottom || FooterComponent) && {paddingBottom:0}, !usingPaddingTop && {paddingTop: 0}, { padding: noPadding ? 0 : 16 }]} enabled={hasInput} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? statusBarHeight + 12 : 0} >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
                        {children}
                    </ScrollView>
                </KeyboardAvoidingView>
            ) : (
                <ScrollView style={[styles.wrapper,  (!usingPaddingBottom || FooterComponent) && {paddingBottom:0}, !usingPaddingTop && {paddingTop: 0}, { padding: noPadding ? 0 : 16 }]}>
                    {children}
                </ScrollView>
            )}
            {FooterComponent && <View><FooterComponent /></View>}
        </SafeAreaView>
    )
}


/**
 * Stylesheet
 *
 * @type {*}
 */
const styles = StyleSheet.create({
    container: {
        minHeight: height,
        flexGrow: 1,
    },
    wrapper: {
        padding: 16,
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
    }
});

/**
 * Export container
 */
export default Container