import { useLocalSearchParams } from 'expo-router';
import { Share, View, Text, Image, Dimensions, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import groups from '../assets/photos/groups.json';
import { router } from 'expo-router'
import { getFontFamily } from "@/utils/fontFamily";
import { useState, useEffect, useRef } from 'react';
const {width, height} = Dimensions.get('window');

export default function Viewer() {
  const { groupNum } = useLocalSearchParams();
  const index = parseInt(groupNum as string);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [curPhoto, setCurPhoto] = useState(0);
  
  useEffect(() => {
    const photos = groups[index]?.photos || [];
    setPhotos(photos);
    if (!imageUri)
      setImageLoaded(false);
    if (photos.length > 0) {
      setImageUri(photos[curPhoto]);
    }
  }, [index, curPhoto]);

  const onShare = async () => {
    try {
      if (!imageUri)
        return;

      // Download the image to cache directory
      const fileName = `RE-Store-${Date.now()}.jpg`;
      const fileUri = (FileSystem.cacheDirectory || '') + fileName;
      
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
      
      // Share the actual image file
      const result = await Share.share({
        url: downloadResult.uri,
        message: 'Check out this photo from RE-Store!',
        title: 'Share Photo',
      });
      startAnimationUp();
    } catch (error) {
      console.log("Error Sharing Content: ", error);
    }
  };

  const onDownload = async () => {
    try {
      // Request permission to access media library
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        console.log("Permission to Access Media Library was Denied");
        return;
      }

      if (!imageUri)
        return;

      // Download the image to cache directory
      const fileName = `RE-Store-${Date.now()}.jpg`;
      const fileUri = (FileSystem.cacheDirectory || '') + fileName;
      
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
      
      // Save to photo library
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync('RE-Store', asset, false);
      startAnimationDown();
    } catch (error) {
      console.log("Error Downloading Photo: ", error);
    }
  };

  const fadeAnimUp = useRef(new Animated.Value(0)).current;
  const fadeAnimDown = useRef(new Animated.Value(0)).current;

  const startAnimationUp = () => {
    Animated.sequence([
      Animated.timing(fadeAnimUp, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1000), 
      Animated.timing(fadeAnimUp, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };


  const startAnimationDown = () => {
    Animated.sequence([
      Animated.timing(fadeAnimDown, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1000), 
      Animated.timing(fadeAnimDown, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress = {() => router.back()}><Image source={require('../assets/images/back-arrow.png')} style={styles.exit}/></TouchableOpacity>
      <Text style={styles.labelText}>View Your Image</Text>
      <Image source={imageUri ? { uri: imageUri } : require('../assets/images/loading.png')} style={!imageUri || !imageLoaded ? styles.placeholder : styles.image} onLoad={() => setImageLoaded(true)}/>
      <View style={{flexDirection: "row", gap: width/16, marginTop: height/16}}>
        <TouchableOpacity onPress={() => setCurPhoto(curPhoto%2 == 0 ? curPhoto + 1 : curPhoto - 1)} style={[styles.button, curPhoto%2 == 0 ? {backgroundColor: "#8B3FC8"} : {backgroundColor: "#ba7de9"}]}>
          <Image source={require('../assets/images/colorize.png')} style={styles.icon}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurPhoto(curPhoto%4 < 2 ? curPhoto + 2 : curPhoto - 2)} style={[styles.button, curPhoto%4 < 2 ? {backgroundColor: "#8B3FC8"} : {backgroundColor: "#ba7de9"}]}>
          <Image source={require('../assets/images/sharpen.png')} style={styles.icon}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurPhoto(curPhoto < 4 ? curPhoto + 4 : curPhoto - 4)} style={[styles.button, curPhoto < 4 ? {backgroundColor: "#8B3FC8"} : {backgroundColor: "#ba7de9"}]}>
          <Image source={require('../assets/images/fix.png')} style={styles.icon}/>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: "row", marginTop: height/32, alignContent: "center", alignSelf: "flex-start", marginLeft: width*19/128}}>
        <Animated.View style={{opacity: fadeAnimUp}}><Text style={[styles.pingText, {marginRight: width/4}]}>Uploaded!</Text></Animated.View>
        <Animated.View style={{opacity: fadeAnimDown}}><Text style={[styles.pingText]}>Downloaded!</Text></Animated.View>
      </View>
      <View style={{flexDirection: "row", gap: width/3, marginTop: height/32,}}>
        <TouchableOpacity onPress={onShare} style={[styles.button, {backgroundColor: "#8B3FC8", width: width/6, height: width/6}]}>
          <Image source={require('../assets/images/upload.png')} style={[styles.icon, {width: width/8, height: width/8}]}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDownload} style={[styles.button, {backgroundColor: "#8B3FC8", width: width/6, height: width/6}]}>
          <Image source={require('../assets/images/download.png')} style={[styles.icon, {width: width/8, height: width/8}]}/>
        </TouchableOpacity>
      </View>
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
  list: {
    marginTop: height/16,
    alignSelf: "flex-start",
    margin: width/16,
  },
  image: {
    width: width*7/8,
    height: width*7/8,
    borderRadius: width/16,
  },
  icon: {
    width: width/6,
    height: width/6
  },
  placeholder: {
    width: width*7/8,
    height: width*7/8,
    borderRadius: width/16,
    backgroundColor: '#2D1B4E',
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
  button: {
    width: width/4,
    height: width/4,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: width*3/8,
    borderWidth: 4,
    borderColor: '#C77DFF',
    shadowColor: '#C77DFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10
  },
  exit: {
      position: "absolute",
      top: -width/8,
      left: -width/2 + width/64,
      width: width/8,
      height: width/8,
      borderRadius: width/16,
  },
  pingText: {
      color: "#F0F0F0",
      position: "fixed",
      fontSize:height/40,
      fontFamily: getFontFamily("normal"),
  },
  labelText: {
      color: "#F0F0F0",
      fontSize:height/15,
      fontFamily: getFontFamily("normal"),
      textAlign: "center",
  },
});