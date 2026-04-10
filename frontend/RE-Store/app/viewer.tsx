import { useLocalSearchParams } from 'expo-router';
import { FlatList, View, Text, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import groups from '../assets/photos/groups.json';
import { router } from 'expo-router'
import { getFontFamily } from "@/utils/fontFamily";
import { useState, useEffect } from 'react';
const {width, height} = Dimensions.get('window');

export default function Viewer() {
  const { groupNum } = useLocalSearchParams();
  const index = parseInt(groupNum as string);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [curPhoto, setCurPhoto] = useState(0);
  
  useEffect(() => {
    const photos = groups[index]?.photos || [];
    setPhotos(photos);
    if (photos.length > 0) {
      setImageUri(photos[curPhoto]);
    }
  }, [index, curPhoto]);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress = {() => router.push('..')}><Image source={require('../assets/images/back-arrow.png')} style={styles.exit}/></TouchableOpacity>
      <Text style={styles.labelText}>View Your Image</Text>
      <Image source={imageUri ? { uri: imageUri } : require('../assets/images/loading.png')} style={imageUri ? styles.image : styles.placeholder}/>
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
  labelText: {
      color: "#F0F0F0",
      fontSize:height/15,
      fontFamily: getFontFamily("normal"),
      fontWeight:"bold",
      textAlign: "center",
  },
});