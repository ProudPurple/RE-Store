import { FlatList, View, Text, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import groups from '../assets/photos/groups.json';
import { router } from 'expo-router'
import { getFontFamily } from "@/utils/fontFamily";
import { useState, useEffect } from 'react';
const {width, height} = Dimensions.get('window');

export default function Storage() {
  const [photos, setPhotos] = useState<string[]>([]);
  
  useEffect(() => {
    const firstPhotos = groups.map((g: { photos: string[] }) => g.photos[0]).filter(Boolean);
    setPhotos(firstPhotos);
  }, []);

  return (
    <View style={styles.container}>
       <TouchableOpacity onPress = {() => router.push('..')}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.exit}/>
        </TouchableOpacity>
      <Text style={styles.labelText}>Storage</Text>
      {photos.length > 0 ? (
        <FlatList columnWrapperStyle={{ justifyContent: 'flex-start' }} style={{marginTop: height/16, alignSelf: "flex-start"}} data={photos} numColumns={3} keyExtractor={(item,index) => index.toString()}
          renderItem={({item}) => (<Image source={{uri: item}} style={styles.image}/>)}
        />
      ) : (
        <Text style={[styles.labelText, {verticalAlign: "middle"}]}>N/A</Text>
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
    width: width/3,
    height: width/3,
    resizeMode: 'contain',
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