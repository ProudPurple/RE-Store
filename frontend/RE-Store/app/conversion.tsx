import { StyleSheet, Image, TouchableOpacity, Text, View, Dimensions } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { router } from "expo-router";

const {width, height} = Dimensions.get('window');

export default function Conversion() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setRotation(0);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{alignItems: "center", marginTop: height/12}}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={[styles.image, { transform: [{ rotate: `${rotation}deg` }] }]}/>
                ) : (
                    <Image source={imageUri ? { uri: imageUri } : require('../assets/images/splash-icon.png')} style={styles.image}/>
                )}
                <TouchableOpacity style={[styles.button, {margin: height/16}]} onPress={pickImage}>
                    <Text style={styles.buttonText}>Upload Photo</Text>
                </TouchableOpacity>
                {imageUri && (
                    <TouchableOpacity style={[styles.button]} onPress={() => router.push('/storage')}>
                        <Text style={styles.buttonText}>Confirm</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:"#0D0D0D",
    alignItems: "center",
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
    backgroundColor: '#1C1C1C',
    borderRadius: height*3/8,
    borderWidth: 4,
    borderColor: '#C77DFF',
    shadowColor: '#C77DFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10
  },
  buttonText: {
    color: "#F0F0F0",
    fontSize:height/32,
    fontWeight:"bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
});