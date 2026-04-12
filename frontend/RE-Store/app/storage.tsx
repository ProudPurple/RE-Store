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
        <FlatList columnWrapperStyle={{ justifyContent: 'flex-start' }} style={styles.list} data={photos} numColumns={3} keyExtractor={(item,index) => index.toString()}
          renderItem={({item, index}) => (<TouchableOpacity onPress = {() => router.push({ pathname: '/viewer', params: { groupNum: index } })}><Image source={{uri: item}} style={styles.image}/></TouchableOpacity>)}
        />
      ) : (
        <Text style={[styles.labelText, {verticalAlign: "middle"}]}>No Photos Yet</Text>
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
  list: {
    marginTop: height/16,
    alignSelf: "flex-start",
    margin: width/16,
  },
  image: {
    width: width*7/24,
    height: width*7/24,
    borderRadius: width/16,
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