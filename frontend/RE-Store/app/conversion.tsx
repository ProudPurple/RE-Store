import { StyleSheet, Image, TouchableOpacity, Text, View, Dimensions, PanResponder, Animated } from "react-native";
import ViewShot from 'react-native-view-shot';
import groups from '../assets/photos/groups.json';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useState, useRef } from 'react';
import { useFonts } from 'expo-font';
import { router } from "expo-router";
import { getFontFamily } from "@/utils/fontFamily";

const {width, height} = Dimensions.get('window');
const API_URL = 'https://nonlinkage-unpunctiliously-goldie.ngrok-free.dev';

export default function Conversion() {
    const maskRef = useRef<ViewShot | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [paths, setPaths] = useState<string[]>([]);
    const [curPath, setCurPath] = useState('');
    const [loaded] = useFonts({
        'Anton-Regular': require('../assets/fonts/AntonRegular.ttf'),
    });

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
            const { locationX, locationY } = e.nativeEvent;
            setCurPath(`M${locationX},${locationY}`);
        },
        onPanResponderMove: (e) => {
            const { locationX, locationY } = e.nativeEvent;
            setCurPath(prev => `${prev} L${locationX},${locationY}`);
        },
        onPanResponderRelease: () => {
            setPaths(prev => [...prev, curPath]);
            setCurPath('');
        },
    });

    const pickImage = async () => {
        console.log('\x1b[33m Picking Image Request Received \x1b[0m');
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled)
            setImageUri(result.assets[0].uri);
        console.log('\x1b[32m Image Picked \x1b[0m');
    };

    const run = async () => {
        if (!imageUri) return;
        if (groups[groups.length - 1].photos.length % 8 != 0) {
            startAnimation();
            return;
        }

        const ref = maskRef.current;
        console.log('\x1b[33m Run Request Received \x1b[0m');
        if (!ref || typeof ref.capture !== 'function') {
            console.log("Capture not available");
            return;
        }

        try {
            const maskUri = await ref.capture();
            const formData = new FormData();
            router.replace({ pathname: '/viewer', params: { groupNum: groups.length } });

            formData.append('file', { uri: imageUri, type: 'image/png', name: 'photo.png' } as any);
            formData.append('mask', { uri: maskUri, type: 'image/png', name: 'mask.png' } as any);

            await fetch(`${API_URL}/run`, { method: 'PUT', body: formData });
            console.log('\x1b[32m Run Completed \x1b[0m');
        } catch (error) {
            console.log("Error during run:", error);
        }
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const startAnimation = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(1000),
            Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]).start();
    };

    return (
        <View style={styles.container}>

            {/* Ambient glow */}
            <View style={styles.glowOrb} />

            {/* Header */}
            <TouchableOpacity onPress={() => router.push('..')} style={styles.backButton}>
                <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon}/>
            </TouchableOpacity>
            <View style={styles.header}>
                <View style={styles.headerTextBlock}>
                    <Text style={styles.eyebrow}>RESTORATION</Text>
                    <Text style={styles.titleText}>{imageUri ? 'Mark Damage' : 'Upload Photo'}</Text>
                </View>
            </View>

            {/* Image area */}
            {imageUri ? (
                <View style={styles.canvasCard}>
                    <Image source={{ uri: imageUri }} style={styles.image}/>
                    <Svg style={styles.svgOverlay} {...panResponder.panHandlers}>
                        {paths.map((path, i) => (
                            <Path key={i} d={path} stroke="rgba(139,63,200,0.65)" strokeWidth={18} fill="none" strokeLinecap="round"/>
                        ))}
                        {curPath ? (
                            <Path d={curPath} stroke="rgba(139,63,200,0.65)" strokeWidth={18} fill="none" strokeLinecap="round"/>
                        ) : null}
                    </Svg>
                    <ViewShot ref={maskRef} options={{ format: 'png', result: 'tmpfile' }} style={styles.maskShot}>
                        <Svg width="100%" height="100%">
                            {paths.map((path, i) => (
                                <Path key={i} d={path} stroke="white" strokeWidth={18} fill="none" strokeLinecap="round"/>
                            ))}
                            {curPath && (
                                <Path d={curPath} stroke="white" strokeWidth={18} fill="none" strokeLinecap="round"/>
                            )}
                        </Svg>
                    </ViewShot>
                    <View style={styles.canvasHint}>
                        <Text style={styles.hintText}>Draw over tears and creases</Text>
                    </View>
                </View>
            ) : (
                <TouchableOpacity onPress={pickImage} style={styles.uploadCard} activeOpacity={0.8}>
                    <Image source={require('../assets/images/upload-prompt.png')} style={styles.uploadIcon}/>
                </TouchableOpacity>
            )}

            {/* Controls */}
            {imageUri && (
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setPaths([])}>
                        <Image source={require('../assets/images/x.png')} style={styles.icon}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.confirmButton} onPress={() => run()} activeOpacity={0.8}>
                        <Text style={styles.confirmText}>RESTORE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => { setPaths([]); pickImage(); }}>
                        <Image source={require('../assets/images/redo.png')} style={styles.icon}/>
                    </TouchableOpacity>
                </View>
            )}

            <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
                <Text style={styles.toastText}>Already processing an image</Text>
            </Animated.View>

        </View>
    );
}

const CANVAS = width * 7 / 8;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#200b30",
        alignItems: "center",
        overflow: 'hidden',
    },
    glowOrb: {
        position: 'absolute',
        top: -height * 0.15,
        right: -width * 0.3,
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: width * 0.45,
        backgroundColor: 'rgba(139,63,200,0.1)',
    },
    header: {
        width: '100%',
        paddingTop: height * 0.03,
        paddingHorizontal: width * 0.07,
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.05,
        marginBottom: height * 0.03,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        marginLeft: width * 0.07,
        marginTop: height * 0.09,
        borderColor: 'rgba(199,125,255,0.2)',
        alignItems: 'center',
        alignSelf: 'flex-start',
        justifyContent: 'center',
    },
    backIcon: {
        width: 22,
        height: 22,
    },
    headerTextBlock: {
        flexDirection: 'column',
        gap: 2,
    },
    eyebrow: {
        color: '#8B3FC8',
        fontSize: height * 0.013,
        letterSpacing: 3,
        fontFamily: getFontFamily("normal"),
        fontWeight: '600',
    },
    titleText: {
        color: "#F0F0F0",
        fontSize: height * 0.038,
        fontFamily: getFontFamily("normal"),
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    canvasCard: {
        width: CANVAS,
        height: CANVAS,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(199,125,255,0.25)',
        shadowColor: '#8B3FC8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    image: {
        width: CANVAS,
        height: CANVAS,
        resizeMode: 'cover',
    },
    svgOverlay: {
        position: 'absolute',
        width: CANVAS,
        height: CANVAS,
    },
    maskShot: {
        position: 'absolute',
        width: CANVAS,
        height: CANVAS,
        zIndex: -1,
    },
    canvasHint: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(32,11,48,0.75)',
        paddingVertical: 8,
        alignItems: 'center',
    },
    hintText: {
        color: 'rgba(199,125,255,0.8)',
        fontSize: height * 0.014,
        letterSpacing: 1,
        fontFamily: getFontFamily("normal"),
    },
    uploadCard: {
        width: CANVAS,
        height: CANVAS,
        borderRadius: 20,
        backgroundColor: '#2D1B4E',
        borderWidth: 1.5,
        borderColor: 'rgba(139,63,200,0.5)',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#8B3FC8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 10,
    },
    uploadIcon: {
        width: CANVAS,
        height: CANVAS,
        opacity: 0.7,
        borderRadius: 20,
        backgroundColor: '#2D1B4E',
        borderWidth: 1.5,
        borderColor: 'rgba(139,63,200,0.5)',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#8B3FC8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 10,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: width * 0.05,
        marginTop: height * 0.035,
        width: '100%',
        paddingHorizontal: width * 0.07,
    },
    confirmButton: {
        flex: 1,
        height: height * 0.075,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(139,63,200,0.2)',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#C77DFF',
        shadowColor: '#C77DFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    confirmText: {
        color: "#F0F0F0",
        fontSize: height * 0.022,
        fontFamily: getFontFamily("normal"),
        fontWeight: "700",
        letterSpacing: 3,
    },
    iconButton: {
        width: height * 0.075,
        height: height * 0.075,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(199,125,255,0.3)',
    },
    icon: {
        width: width / 12,
        height: width / 12,
    },
    toastContainer: {
        marginTop: height * 0.025,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(139,63,200,0.2)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(199,125,255,0.3)',
    },
    toastText: {
        color: 'rgba(240,240,240,0.8)',
        fontSize: height * 0.016,
        fontFamily: getFontFamily("normal"),
        letterSpacing: 0.5,
    },
});