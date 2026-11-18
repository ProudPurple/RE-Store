import {Platform} from 'react-native';

export const isIOS = () => {
  return Platform.OS === 'ios';
};

// Web uses the names registered by useFonts, same as iOS
const useDashedNames = isIOS() || Platform.OS === 'web';

export const fontFamilies = {
  ANTON: {
    normal: useDashedNames ? 'Anton-Regular' : 'AntonRegular',
    medium: useDashedNames ? 'Anton-Medium' : 'AntonMedium',
    bold: useDashedNames ? 'Anton-Bold' : 'AntonBold',
  },
  // Adjust the above code to fit your chosen fonts' names
};