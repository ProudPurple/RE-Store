import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useFonts } from "expo-font";

// Screens size themselves from the window, so on a wide browser show the app inside the phone frame
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.self === window.top && window.innerWidth >= 600) {
  window.location.replace('/demo.html');
}

export default function RootLayout() {
  // Loaded here so every screen gets the font, even when opened directly by URL
  useFonts({
    'Anton-Regular': require('../assets/fonts/AntonRegular.ttf'),
  });

  return <Stack screenOptions={{ headerShown: false }} />;
}
