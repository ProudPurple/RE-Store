import { StyleSheet, TouchableOpacity, Text, View, Dimensions } from "react-native";
import { router } from "expo-router";

const {width, height} = Dimensions.get('window');

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>RE-Store</Text>
      <TouchableOpacity style={styles.button}onPress={() => router.push('/storage')}>
        <Text style={styles.buttonText}>Storage</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}onPress={() => router.push('/conversion')}>
        <Text style={styles.buttonText}>Conversion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:"#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    gap: 25,
  },
  titleText: {
    color: "#F0F0F0",
    fontSize: height/16,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: height/3
  },
  button: {
    width: width*3/4,
    height: height*1/8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#0D0D0D',
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
  buttonText: {
    color: "#F0F0F0",
    fontSize:height/24,
    fontWeight:"bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
});