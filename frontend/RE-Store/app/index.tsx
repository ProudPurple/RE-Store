import { StyleSheet, TouchableOpacity, Text, View, Dimensions, Image } from "react-native";
import { useFonts } from 'expo-font';
import { router } from "expo-router";
import { getFontFamily } from "@/utils/fontFamily";

const {width, height} = Dimensions.get('window');

export default function Index() {
  const [loaded] = useFonts({
    'Anton-Regular': require('../assets/fonts/AntonRegular.ttf'),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>RE-Store</Text>
      <Image source={require('../assets/images/logo.png')} style={styles.image}/>
      <TouchableOpacity style={styles.button}onPress={() => router.push('/storage')}>
        <Text style={styles.buttonText}>Storage</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}onPress={() => router.push('/conversion')}>
          <Text style={styles.buttonText}>Conversion</Text>
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
  },
  titleText: {
    color: "#F0F0F0",
    fontSize: height/12,
    fontFamily: getFontFamily("normal"),
    textAlign: "center",
    paddingTop: height/12,
  },
  image: {
    width: width,
    height: width,
    alignItems: 'center',
  },
  button: {
    width: width*3/4,
    height: height*1/8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#200b30',
    borderRadius: width*3/8,
    borderWidth: 4,
    borderColor: '#C77DFF',
    shadowColor: '#C77DFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: "#F0F0F0",
    fontSize:height/20,
    fontFamily: getFontFamily("normal"),
    fontWeight:"bold",
  },
  buttonContainer: {
    marginTop: height/32,
  },
});