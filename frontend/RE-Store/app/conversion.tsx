import { StyleSheet, Image, TouchableOpacity, Text, View, Dimensions } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import { router } from "expo-router";
import { getFontFamily } from "@/utils/fontFamily";

const {width, height} = Dimensions.get('window');
const API_URL = 'http://172.20.10.2:3000';

export default function Conversion() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loaded] = useFonts({
        'Anton-Regular': require('../assets/fonts/AntonRegular.ttf'),
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

    const sharpen = async () => {
        if (!imageUri)
            return;

        console.log('\x1b[33m Sharpening Request Recieved \x1b[0m');

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/png',
            name: 'photo.png',
        } as any);

        const response = await fetch(`${API_URL}/sharpen`, {
            method: 'POST',
            body: formData,
        });

        
        const arrayBuffer = await response.arrayBuffer();

        // Convert to base64
        const base64 = btoa(
            new Uint8Array(arrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        setImageUri(`data:image/png;base64,${base64}`);
        console.log('\x1b[32m Sharpened! \x1b[0m');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress = {() => router.push('..')}>
                <Image source={require('../assets/images/back-arrow.png')} style={styles.exit}/>
            </TouchableOpacity>
            <Text style={[styles.labelText]}>Upload An Image</Text>
            <TouchableOpacity onPress={pickImage} style={{paddingTop:height/16}}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image}/>
                ) : (
                    <Image source={imageUri ? { uri: imageUri } : require('../assets/images/upload-prompt.png')} style={styles.placeholder}/>
                )}
            </TouchableOpacity>
            {imageUri && (
                <TouchableOpacity style={[styles.button, {margin: height/16}]} onPress={sharpen}>
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