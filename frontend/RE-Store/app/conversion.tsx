import { StyleSheet, Image, TouchableOpacity, Text, View, Dimensions, PanResponder } from "react-native";
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
        console.log('\x1b[33m Picking Image Request Recieved \x1b[0m');
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
        if (!imageUri)
            return;

        const ref = maskRef.current;

        console.log('\x1b[33m Run Request Recieved \x1b[0m');

        if (!ref || typeof ref.capture !== 'function') {
            console.log("Capture not available");
            return;
        }
        const maskUri = await ref.capture();

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/png',
            name: 'photo.png',
        } as any);
        formData.append('mask', {
            uri: maskUri,
            type: 'image/png',
            name: 'mask.png',
        } as any);

        await fetch(`${API_URL}/run`, {
            method: 'PUT',
            body: formData,
        });
        console.log('\x1b[32m Run Completed \x1b[0m');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress = {() => router.push('..')}>
                <Image source={require('../assets/images/back-arrow.png')} style={styles.exit}/>
            </TouchableOpacity>

                {imageUri ? (
                    <View style={{alignItems:"center"}}>
                        <Text style={[styles.labelText, {fontSize: height/30, margin: height/40}]}>Highlight Tears and Creases</Text>
                        <Image source={{ uri: imageUri }} style={styles.image}/>
                        <Svg style={{ position: "absolute", width: width*7/8, height: width*7/8, marginTop: height/10 }}{...panResponder.panHandlers}>
                            {paths.map((path, i) => (
                                <Path key={i} d={path} stroke="rgba(139,63,200,0.6)" strokeWidth={20}fill="none" strokeLinecap="round"/>
                            ))}
                            {curPath ? (
                            <Path d={curPath} stroke="rgba(139,63,200,0.6)" strokeWidth={20} fill="none" strokeLinecap="round"/>
                            ) : null}
                        </Svg>
                        <ViewShot ref={maskRef} options={{ format: 'png', result: 'tmpfile' }} style={{ position: 'absolute', width: width*7/8, height: width*7/8, marginTop: height/10, zIndex: -1 }}>
                            <Svg width="100%" height="100%">
                                {paths.map((path, i) => (
                                    <Path key={i} d={path} stroke="white" strokeWidth={20} fill="none" strokeLinecap="round"/>
                                ))}
                                {curPath && (
                                    <Path d={curPath} stroke="white" strokeWidth={20} fill="none" strokeLinecap="round"/>
                                )}
                            </Svg>
                        </ViewShot>
                    </View>
                ) : (
                    <View>
                        <Text style={[styles.labelText]}>Upload An Image</Text>
                        <TouchableOpacity onPress={pickImage} style={{paddingTop:height/16}}>
                            <Image source={imageUri ? { uri: imageUri } : require('../assets/images/upload-prompt.png')} style={styles.placeholder}/>
                        </TouchableOpacity>
                    </View>
                )}
            {imageUri && (
                <TouchableOpacity style={[styles.button, {margin: height/16}]} onPress={() => {run(); router.push({ pathname: '/viewer', params: { groupNum: groups.length } });}}>
                    <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:"#200b30",
    alignItems: "center",
    paddingTop: height/8,
  },
  image: {
    width: width*7/8,
    height: width*7/8,
    resizeMode: 'contain',
  },
  button: {
    width: width*3/4,
    height: height*1/12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#200b30',
    borderRadius: height*3/8,
    borderWidth: 4,
    borderColor: '#C77DFF',
    shadowColor: '#C77DFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10
  },
  placeholder: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#2D1B4E',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#8B3FC8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#8B3FC8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    },
exit: {
    position: "absolute",
    top: -width/8,
    left: -width/2 + width/64,
    width: width/8,
    height: width/8,
    borderRadius: width/16,
},
labelText: {
    color: "#F0F0F0",
    fontSize:height/20,
    fontFamily: getFontFamily("normal"),
    fontWeight:"bold",
    textAlign: "center",
},
  buttonText: {
    color: "#F0F0F0",
    fontSize:height/24,
    fontFamily: getFontFamily("normal"),
    fontWeight:"bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
});