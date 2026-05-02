import { useLocalSearchParams } from 'expo-router';
import { Share, View, Text, Image, Dimensions, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import groups from '../assets/photos/groups.json';
import { router } from 'expo-router';
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
    setImageLoaded(false);
    if (photos.length > 0) {
      setImageUri(photos[curPhoto]);
    }
  }, [index, curPhoto]);

  const onShare = async () => {
    try {
      if (!imageUri) return;
      const fileName = `RE-Store-${Date.now()}.jpg`;
      const fileUri = (FileSystem.cacheDirectory || '') + fileName;
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
      await Share.share({ url: downloadResult.uri, message: 'Check out this photo from RE-Store!', title: 'Share Photo' });
      startAnimationUp();
    } catch (error) {
      console.log("Error Sharing Content: ", error);
    }
  };

  const onDownload = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) { console.log("Permission Denied"); return; }
      if (!imageUri) return;
      const fileName = `RE-Store-${Date.now()}.jpg`;
      const fileUri = (FileSystem.cacheDirectory || '') + fileName;
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
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
      Animated.timing(fadeAnimUp, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(fadeAnimUp, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();
  };

  const startAnimationDown = () => {
    Animated.sequence([
      Animated.timing(fadeAnimDown, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(fadeAnimDown, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();
  };

  const colorizeActive = curPhoto % 2 !== 0;
  const sharpenActive = curPhoto % 4 >= 2;
  const fixActive = curPhoto >= 4;

  return (
    <View style={styles.container}>

      {/* Ambient glow */}
      <View style={styles.glowOrb} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon}/>
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.eyebrow}>VIEWING</Text>
          <Text style={styles.titleText}>Your Restore</Text>
        </View>
      </View>

      {/* Image */}
      <View style={styles.imageCard}>
        <Image
          source={imageUri ? { uri: imageUri } : require('../assets/images/loading.png')}
          style={!imageUri || !imageLoaded ? styles.placeholder : styles.image}
          onLoad={() => setImageLoaded(true)}
        />
      </View>

      {/* Toggle row */}
      <View style={styles.toggleSection}>
        <Text style={styles.toggleLabel}>ENHANCEMENTS</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setCurPhoto(curPhoto % 2 === 0 ? curPhoto + 1 : curPhoto - 1)}
            style={[styles.toggleButton, colorizeActive && styles.toggleButtonActive]}
            activeOpacity={0.8}
          >
            <Image source={require('../assets/images/colorize.png')} style={styles.toggleIcon}/>
            <Text style={[styles.toggleText, colorizeActive && styles.toggleTextActive]}>Colorize</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurPhoto(curPhoto % 4 < 2 ? curPhoto + 2 : curPhoto - 2)}
            style={[styles.toggleButton, sharpenActive && styles.toggleButtonActive]}
            activeOpacity={0.8}
          >
            <Image source={require('../assets/images/sharpen.png')} style={styles.toggleIcon}/>
            <Text style={[styles.toggleText, sharpenActive && styles.toggleTextActive]}>Sharpen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurPhoto(curPhoto < 4 ? curPhoto + 4 : curPhoto - 4)}
            style={[styles.toggleButton, fixActive && styles.toggleButtonActive]}
            activeOpacity={0.8}
          >
            <Image source={require('../assets/images/fix.png')} style={styles.toggleIcon}/>
            <Text style={[styles.toggleText, fixActive && styles.toggleTextActive]}>Fix</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={onShare} style={styles.actionButton} activeOpacity={0.8}>
          <Image source={require('../assets/images/upload.png')} style={styles.actionIcon}/>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity onPress={onDownload} style={styles.actionButton} activeOpacity={0.8}>
          <Image source={require('../assets/images/download.png')} style={styles.actionIcon}/>
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Toast notifications */}
      <View style={styles.toastRow}>
        <Animated.View style={[styles.toast, { opacity: fadeAnimUp }]}>
          <Text style={styles.toastText}>Shared!</Text>
        </Animated.View>
        <Animated.View style={[styles.toast, { opacity: fadeAnimDown }]}>
          <Text style={styles.toastText}>Saved!</Text>
        </Animated.View>
      </View>

    </View>
  );
}

const IMG = width * 7 / 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#200b30",
    alignItems: "center",
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(139,63,200,0.09)',
  },
  header: {
    width: '100%',
    paddingTop: height * 0.07,
    paddingHorizontal: width * 0.07,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.04,
    marginBottom: height * 0.025,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  headerTextBlock: {
    flexDirection: 'column',
    gap: 2,
  },
  eyebrow: {
    color: '#8B3FC8',
    fontSize: height * 0.013,
    letterSpacing: 3,
    fontFamily: getFontFamily("normal"),
    fontWeight: '600',
  },
  titleText: {
    color: "#F0F0F0",
    fontSize: height * 0.038,
    fontFamily: getFontFamily("normal"),
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  imageCard: {
    width: IMG,
    height: IMG,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.2)',
    shadowColor: '#8B3FC8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  image: {
    width: IMG,
    height: IMG,
    resizeMode: 'cover',
  },
  placeholder: {
    width: IMG,
    height: IMG,
    backgroundColor: '#2D1B4E',
  },
  toggleSection: {
    width: '100%',
    paddingHorizontal: width * 0.07,
    marginTop: height * 0.028,
  },
  toggleLabel: {
    color: '#8B3FC8',
    fontSize: height * 0.013,
    letterSpacing: 3,
    fontFamily: getFontFamily("normal"),
    fontWeight: '600',
    marginBottom: height * 0.014,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: width * 0.03,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.2)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(139,63,200,0.25)',
    borderColor: '#C77DFF',
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  toggleIcon: {
    width: width * 0.07,
    height: width * 0.07,
  },
  toggleText: {
    color: 'rgba(240,240,240,0.4)',
    fontSize: height * 0.014,
    fontFamily: getFontFamily("normal"),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  toggleTextActive: {
    color: '#F0F0F0',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.025,
    width: width * 0.86,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.2)',
    overflow: 'hidden',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: height * 0.022,
  },
  actionDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(199,125,255,0.2)',
  },
  actionIcon: {
    width: width * 0.055,
    height: width * 0.055,
  },
  actionText: {
    color: '#F0F0F0',
    fontSize: height * 0.018,
    fontFamily: getFontFamily("normal"),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  toastRow: {
    flexDirection: 'row',
    gap: width * 0.1,
    marginTop: height * 0.02,
  },
  toast: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: 'rgba(139,63,200,0.25)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.35)',
  },
  toastText: {
    color: '#F0F0F0',
    fontSize: height * 0.015,
    fontFamily: getFontFamily("normal"),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});