import { FlatList, View, Text, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import groups from '../assets/photos/groups.json';
import { router } from 'expo-router';
import { getFontFamily } from "@/utils/fontFamily";
import { useState, useEffect } from 'react';

const {width, height} = Dimensions.get('window');
const THUMB = width * 0.28;
const GAP = (width - THUMB * 3 - width * 0.14) / 2;

export default function Storage() {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const firstPhotos = groups.map((g: { photos: string[] }) => g.photos[0]).filter(Boolean);
    setPhotos(firstPhotos);
  }, []);

  return (
    <View style={styles.container}>

      {/* Ambient glow */}
      <View style={styles.glowOrb} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('..')} style={styles.backButton}>
          <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon}/>
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
          <Text style={styles.titleText}>Storage</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{photos.length}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Grid */}
      {photos.length > 0 ? (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={photos}
          numColumns={3}
          columnWrapperStyle={styles.row}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/viewer', params: { groupNum: index } })}
              style={styles.thumbWrapper}
              activeOpacity={0.75}
            >
              <Image source={{ uri: item }} style={styles.image}/>
              <View style={styles.thumbOverlay} />
              <View style={styles.thumbIndex}>
                <Text style={styles.thumbIndexText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>◎</Text>
          </View>
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptySub}>Restored photos will appear here</Text>
          <TouchableOpacity onPress={() => router.push('/conversion')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>START RESTORING</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#200b30",
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(139,63,200,0.1)',
  },
  header: {
    width: '100%',
    paddingTop: height * 0.07,
    paddingHorizontal: width * 0.07,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.04,
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
    flex: 1,
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
    fontSize: height * 0.042,
    fontFamily: getFontFamily("normal"),
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  countBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139,63,200,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#C77DFF',
    fontSize: height * 0.022,
    fontFamily: getFontFamily("normal"),
    fontWeight: '700',
  },
  divider: {
    width: width - width * 0.14,
    height: 1,
    backgroundColor: 'rgba(199,125,255,0.15)',
    marginHorizontal: width * 0.07,
    marginTop: height * 0.025,
    marginBottom: height * 0.01,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.04,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  thumbWrapper: {
    width: THUMB,
    height: THUMB,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.2)',
    shadowColor: '#8B3FC8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: THUMB,
    height: THUMB,
  },
  thumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: THUMB * 0.35,
    backgroundColor: 'rgba(32,11,48,0.5)',
  },
  thumbIndex: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  thumbIndexText: {
    color: 'rgba(199,125,255,0.6)',
    fontSize: 11,
    fontFamily: getFontFamily("normal"),
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: height * 0.015,
    paddingBottom: height * 0.1,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139,63,200,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.01,
  },
  emptyIconText: {
    color: '#8B3FC8',
    fontSize: 28,
  },
  emptyTitle: {
    color: '#F0F0F0',
    fontSize: height * 0.028,
    fontFamily: getFontFamily("normal"),
    fontWeight: '700',
  },
  emptySub: {
    color: 'rgba(199,125,255,0.5)',
    fontSize: height * 0.016,
    fontFamily: getFontFamily("normal"),
  },
  emptyButton: {
    marginTop: height * 0.02,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'rgba(139,63,200,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(199,125,255,0.4)',
  },
  emptyButtonText: {
    color: '#C77DFF',
    fontSize: height * 0.016,
    fontFamily: getFontFamily("normal"),
    fontWeight: '700',
    letterSpacing: 2,
  },
});