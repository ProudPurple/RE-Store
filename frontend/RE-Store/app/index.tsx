import { StyleSheet, TouchableOpacity, Text, View, Dimensions, Image, Animated } from "react-native";
import { useFonts } from 'expo-font';
import { router } from "expo-router";
import { getFontFamily } from "@/utils/fontFamily";
import { useEffect, useRef } from "react";

const {width, height} = Dimensions.get('window');

export default function Index() {
  const [loaded] = useFonts({
    'Anton-Regular': require('../assets/fonts/AntonRegular.ttf'),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const btn1Anim = useRef(new Animated.Value(0)).current;
  const btn2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(btn1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(btn2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Ambient glow orbs */}
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />

      {/* Header block */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.eyebrow}>PHOTO RESTORATION</Text>
        <Text style={styles.titleText}>RE-Store</Text>
        <View style={styles.divider} />
      </Animated.View>

      {/* Logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={require('../assets/images/logo.png')} style={styles.image}/>
      </Animated.View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <Animated.View style={{ opacity: btn1Anim, width: '100%', alignItems: 'center' }}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/storage')} activeOpacity={0.8}>
            <View style={styles.buttonInner}>
              <Text style={styles.buttonLabel}>STORAGE</Text>
              <Text style={styles.buttonSub}>Browse restored photos</Text>
            </View>
            <View style={styles.buttonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: btn2Anim, width: '100%', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.primaryButton, styles.accentButton]} onPress={() => router.push('/conversion')} activeOpacity={0.8}>
            <View style={styles.buttonInner}>
              <Text style={styles.buttonLabel}>CONVERSION</Text>
              <Text style={styles.buttonSub}>Restore a new photo</Text>
            </View>
            <View style={[styles.buttonArrow, styles.accentArrow]}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#200b30",
    alignItems: "center",
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(139,63,200,0.12)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: height * 0.05,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(199,125,255,0.07)',
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.15,
    marginBottom: height * 0.01,
  },
  eyebrow: {
    color: '#8B3FC8',
    fontSize: height * 0.014,
    letterSpacing: 4,
    fontFamily: getFontFamily("normal"),
    fontWeight: '600',
    marginBottom: height * 0.01,
  },
  titleText: {
    color: "#F0F0F0",
    fontSize: height * 0.1,
    fontFamily: getFontFamily("normal"),
    letterSpacing: -2,
  },
  divider: {
    width: width * 0.15,
    height: 2,
    backgroundColor: '#C77DFF',
    marginTop: height * 0.015,
    borderRadius: 1,
  },
  image: {
    width: width * 0.55,
    height: width * 0.55,
    alignItems: 'center',
    opacity: 0.95,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: height * 0.018,
    paddingHorizontal: width * 0.07,
    marginTop: height * 0.01,
  },
  primaryButton: {
    width: '100%',
    height: height * 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.3)',
    paddingHorizontal: width * 0.06,
    shadowColor: '#8B3FC8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  accentButton: {
    backgroundColor: 'rgba(139,63,200,0.15)',
    borderColor: '#C77DFF',
    shadowOpacity: 0.4,
  },
  buttonInner: {
    flexDirection: 'column',
    gap: 2,
  },
  buttonLabel: {
    color: "#F0F0F0",
    fontSize: height * 0.022,
    fontFamily: getFontFamily("normal"),
    fontWeight: "700",
    letterSpacing: 2,
  },
  buttonSub: {
    color: 'rgba(199,125,255,0.7)',
    fontSize: height * 0.014,
    fontFamily: getFontFamily("normal"),
    letterSpacing: 0.5,
  },
  buttonArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(199,125,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentArrow: {
    backgroundColor: 'rgba(199,125,255,0.3)',
  },
  arrowText: {
    color: '#C77DFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '300',
  },
});